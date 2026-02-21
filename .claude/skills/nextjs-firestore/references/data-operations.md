# Firestore データ操作パターン（RoastPlus実装）

## 目次

1. [AppData CRUD](#appdata-crud)
2. [Write Queue（デバウンス + リトライ）](#write-queue)
3. [楽観的更新 + ロック機構](#楽観的更新--ロック機構)
4. [データ消失防止](#データ消失防止)
5. [データ正規化](#データ正規化)
6. [サブコレクション操作](#サブコレクション操作)
7. [配列内アイテムのCRUD](#配列内アイテムのcrud)
8. [Firebase Storage](#firebase-storage)
9. [localStorage併用](#localstorage併用)

---

## AppData CRUD

### 読み取り（初回 + リアルタイム購読）

```typescript
// lib/firestore/userData/crud.ts
export async function getUserData(userId: string): Promise<AppData> {
  const userDocRef = getUserDocRef(userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return normalizeAppData(userDoc.data());
  }

  // 初回: デフォルトデータで初期化
  const cleanedDefaultData = removeUndefinedFields(defaultData);
  await setDoc(userDocRef, cleanedDefaultData);
  return defaultData;
}

// リアルタイム購読
export function subscribeUserData(
  userId: string,
  callback: (data: AppData) => void
): () => void {
  const userDocRef = getUserDocRef(userId);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(normalizeAppData(snapshot.data()));
      } else {
        callback(defaultData);
      }
    },
    (error) => {
      console.error('Error in Firestore subscription:', error);
      // エラー時はcallbackを呼ばない（既存データを保持）
    }
  );
}
```

### 書き込み（Write Queue経由）

```typescript
// 必ず saveUserData() 経由で書き込み
import { saveUserData } from '@/lib/firestore/userData/crud';

await saveUserData(userId, {
  ...appData,
  workProgresses: [...appData.workProgresses, newItem],
});
```

---

## Write Queue

**目的**: Firestoreの「Write stream exhausted」エラーを防止し、安定した書き込みを実現。

```typescript
// lib/firestore/userData/write-queue.ts

// 定数
const SAVE_USER_DATA_DEBOUNCE_MS = 300;  // デバウンス間隔
const MAX_RETRY_COUNT = 3;                // リトライ上限
const RETRY_DELAY = 1000;                 // リトライ基本遅延
const MAX_CONCURRENT_WRITES = 1;          // 同時書き込み制限
const MIN_WRITE_INTERVAL = 200;           // 最小書き込み間隔
```

### 書き込みフロー

```
updateData() 呼び出し
  ↓
デバウンス（300ms待機、連続呼び出しをまとめる）
  ↓
Write Slot取得（同時1件まで）
  ↓
最小間隔チェック（前回から200ms以上経過を確認）
  ↓
removeUndefinedFields() → setDoc(ref, data, { merge: true })
  ↓
失敗時: Write stream exhausted → 指数バックオフでリトライ（最大3回）
```

### 実装の要点

```typescript
export async function executeWrite(userId: string, data: AppData): Promise<void> {
  await acquireWriteSlot();  // セマフォで同時実行制限

  try {
    // 書き込み間隔の保証
    const timeSinceLastWrite = Date.now() - lastWriteTime;
    if (timeSinceLastWrite < MIN_WRITE_INTERVAL) {
      await sleep(MIN_WRITE_INTERVAL - timeSinceLastWrite);
    }

    const userDocRef = getUserDocRef(userId);
    const cleanedData = removeUndefinedFields(data);
    await setDoc(userDocRef, cleanedData, { merge: true });

  } catch (error) {
    if (isWriteStreamExhaustedError(error) && retryCount <= MAX_RETRY_COUNT) {
      // 指数バックオフ（最大10秒）
      const delay = Math.min(RETRY_DELAY * 2 ** retryCount + jitter, 10000);
      await sleep(delay);
      // リトライ
    }
  } finally {
    releaseWriteSlot();
  }
}
```

---

## 楽観的更新 + ロック機構

**目的**: UIの即座の応答性を保ちつつ、サーバーとの整合性を維持。

```typescript
// hooks/useAppData.ts

export function useAppData() {
  const [data, setData] = useState<AppData>(INITIAL_APP_DATA);
  const latestLocalDataRef = useRef<AppData>(INITIAL_APP_DATA);
  const lockedKeysRef = useRef<Set<keyof AppData>>(new Set());  // ★ ロック機構

  // 更新関数（楽観的更新）
  const updateData = useCallback(async (newDataOrUpdater) => {
    const newData = typeof newDataOrUpdater === 'function'
      ? newDataOrUpdater(latestLocalDataRef.current)
      : newDataOrUpdater;

    // 1. ローカル即座更新（UIに即反映）
    commitData(newData);

    // 2. 変更されたキーをロック
    const changedKeys = getChangedKeys(latestLocalDataRef.current, newData);
    changedKeys.forEach(key => lockedKeysRef.current.add(key));

    // 3. サーバーへ書き込み（Write Queue経由）
    await saveUserData(user.uid, newData);

    // 4. ロック解除（書き込み完了後）
  }, [user, commitData]);

  // サーバースナップショット受信時のマージ
  const applyIncomingSnapshot = useCallback((incomingData: AppData) => {
    const mergedData = { ...incomingData };

    // ロック中のキーはローカル値を優先
    lockedKeysRef.current.forEach((key) => {
      const localValue = latestLocalDataRef.current[key];
      if (localValue !== undefined) {
        mergedData[key] = localValue;
      }
    });

    commitData(mergedData);
  }, [commitData]);
}
```

### フロー図

```
ユーザー操作 → updateData()
  ├── UIに即座に反映（楽観的更新）
  ├── 変更キーをロック
  └── Write Queue → Firestore書き込み
                        ↓
                  onSnapshot受信
                  ├── ロック中キー → ローカル値優先
                  └── 非ロックキー → サーバー値適用
                        ↓
                  書き込み確認 → ロック解除
```

---

## データ消失防止

**問題**: Firestoreのスナップショットが一時的に空データを返すことがある。

```typescript
// hooks/useAppData.ts 内
const applyIncomingSnapshot = useCallback((incomingData: AppData) => {
  const localHasData = hasRealData(latestLocalDataRef.current);
  const incomingIsEmpty = isAllEmpty(incomingData);

  // ローカルに実データがあるのに受信データが全て空 → 消失と判断
  if (localHasData && incomingIsEmpty && !isUpdatingRef.current) {
    console.warn('Data loss prevention: incoming snapshot has all empty arrays');
    return;  // スキップ
  }
}, []);
```

---

## データ正規化

```typescript
// lib/firestore/common.ts

// undefined/空オブジェクトを除去（Firestore書き込み前）
export function removeUndefinedFields<T>(obj: T): T {
  // undefinedフィールド、空オブジェクト、空文字列を再帰的に除去
}

// 不足フィールドをデフォルト値で補完（Firestore読み取り後）
export function normalizeAppData(data: Partial<AppData>): AppData {
  return {
    todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
    roastSchedules: Array.isArray(data?.roastSchedules) ? data.roastSchedules : [],
    // ... 各フィールドにデフォルト値を適用
  };
}
```

---

## サブコレクション操作

担当表機能はサブコレクションを使用（AppData外）。

```typescript
// hooks/useMembers.ts
export function useMembers(userId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!userId) return;

    const membersCol = collection(db, 'users', userId, 'members');
    const unsubscribe = onSnapshot(membersCol, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(data);
    });

    return () => unsubscribe();
  }, [userId]);
}
```

### サブコレクションの書き込み

```typescript
// 追加
const membersCol = collection(db, 'users', userId, 'members');
await addDoc(membersCol, { name, role, createdAt: new Date().toISOString() });

// 更新
const memberRef = doc(db, 'users', userId, 'members', memberId);
await updateDoc(memberRef, { name: newName, updatedAt: new Date().toISOString() });

// 削除
await deleteDoc(doc(db, 'users', userId, 'members', memberId));
```

---

## 配列内アイテムのCRUD

AppData内の配列データの操作パターン:

```typescript
// 追加
export async function addWorkProgress(
  userId: string,
  item: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>,
  appData: AppData
): Promise<void> {
  const now = new Date().toISOString();
  const newItem: WorkProgress = {
    ...item,
    id: crypto.randomUUID(),  // クライアント側でID生成
    createdAt: now,
    updatedAt: now,
  };

  await saveUserData(userId, {
    ...appData,
    workProgresses: [...(appData.workProgresses || []), newItem],
  });
}

// 更新
export async function updateWorkProgress(
  userId: string,
  id: string,
  updates: Partial<WorkProgress>,
  appData: AppData
): Promise<void> {
  const updated = appData.workProgresses.map(item =>
    item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
  );

  await saveUserData(userId, { ...appData, workProgresses: updated });
}

// 削除
export async function deleteWorkProgress(
  userId: string,
  id: string,
  appData: AppData
): Promise<void> {
  await saveUserData(userId, {
    ...appData,
    workProgresses: appData.workProgresses.filter(item => item.id !== id),
  });
}
```

---

## Firebase Storage

```typescript
// lib/storage.ts

// アップロード
export async function uploadDefectBeanImage(
  userId: string,
  defectBeanId: string,
  file: File
): Promise<string> {
  const storagePath = userId
    ? `defect-beans/${userId}/${defectBeanId}/${Date.now()}_${file.name}`
    : `defect-beans-master/${defectBeanId}/${Date.now()}_${file.name}`;

  const storageRef = ref(getStorageInstance(), storagePath);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 削除（URLからパスを逆算）
export async function deleteDefectBeanImage(imageUrl: string): Promise<void> {
  const pathMatch = new URL(imageUrl).pathname.match(/\/o\/(.+)$/);
  const decodedPath = decodeURIComponent(pathMatch![1]);
  await deleteObject(ref(getStorageInstance(), decodedPath));
}
```

---

## localStorage併用

Firestoreに保存しないデータはlocalStorageを使用:

```typescript
// lib/localStorage.ts

// 用途: クイズ進捗、タイマー状態、デバイスID、ユーザー設定キャッシュ
// 理由: 高頻度アクセス、オフライン必須、Firestoreへの書き込み削減

export function getQuizProgress(): QuizProgress | null { ... }
export function setQuizProgress(progress: QuizProgress | null): void { ... }
export function getRoastTimerSettings(): RoastTimerSettings | null { ... }
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
```

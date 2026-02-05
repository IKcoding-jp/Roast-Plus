# RoastPlus デバッグシナリオ集

RoastPlusで遭遇する典型的なバグパターンと、デバッグサイクル（仮説→ログ挿入→再現→分析→修正）を用いた解決方法をまとめています。

## 目次

1. [React Hooks競合状態](#1-react-hooks競合状態)
2. [Firestoreリアルタイムリスナー問題](#2-firestoreリアルタイムリスナー問題)
3. [localStorage/IndexedDBクォータ超過](#3-localstorageindexeddbクォータ超過)
4. [オフライン→オンライン復帰時のデータ同期](#4-オフラインオンライン復帰時のデータ同期)
5. [タイマー競合（複数タイマー同時実行）](#5-タイマー競合複数タイマー同時実行)
6. [クリスマスモード切り替えバグ](#6-クリスマスモード切り替えバグ)

---

## 1. React Hooks競合状態

### 症状

- useEffectが無限ループする
- stale closureでデータが古いまま表示される
- 依存配列の警告が出る

### 典型例

#### ケース1: 無限ループ（依存配列にオブジェクト/関数）

```tsx
// ❌ NG: fetchDataが毎回再生成される
function MyComponent() {
  const fetchData = async () => {
    const data = await getFirestoreData();
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchDataが毎回異なるため無限ループ
}

// ✅ OK: useCallbackでメモ化
function MyComponent() {
  const fetchData = useCallback(async () => {
    const data = await getFirestoreData();
    setData(data);
  }, []); // 依存がないのでメモ化される

  useEffect(() => {
    fetchData();
  }, [fetchData]);
}
```

#### ケース2: Stale Closure（依存配列の漏れ）

```tsx
// ❌ NG: countが常に初期値0のまま
function TimerComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 常に0が表示される
      setCount(count + 1); // count=0から常に1になる
    }, 1000);
    return () => clearInterval(timer);
  }, []); // countが依存配列に入っていない
}

// ✅ OK: 関数型更新を使用
function TimerComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        console.log(prev); // 正しい値が表示される
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []); // countへの依存がなくなる
}
```

### デバッグログ挿入例

```tsx
useEffect(() => {
  console.log('[DEBUG][MyComponent] useEffect実行', {
    timestamp: new Date().toISOString(),
    dependencies: { userId, filter }
  });

  fetchData();

  return () => {
    console.log('[DEBUG][MyComponent] useEffect cleanup', {
      timestamp: new Date().toISOString()
    });
  };
}, [userId, filter]);
```

### 予防策

1. **ESLintルール有効化**: `react-hooks/exhaustive-deps` を警告レベルに設定
2. **useCallbackでメモ化**: 関数を依存配列に入れる場合は必ずメモ化
3. **関数型更新**: `setState(prev => prev + 1)` を使用
4. **依存配列を空にしない**: 本当に初回のみ実行すべきか再検討

---

## 2. Firestoreリアルタイムリスナー問題

### 症状

- データが更新されない（リスナーが動作していない）
- コンポーネントアンマウント後もリスナーが動き続ける（メモリリーク）
- 接続断後に復帰しない

### 典型例

#### ケース1: unsubscribe漏れ

```tsx
// ❌ NG: unsubscribeしていない
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (snapshot) => {
      setData(snapshot.data());
    });
    // unsubscribeを呼んでいない！
  }, [userId]);
}

// ✅ OK: cleanup関数でunsubscribe
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (snapshot) => {
      setData(snapshot.data());
    });

    return () => unsubscribe(); // cleanup関数で必ず呼ぶ
  }, [userId]);
}
```

#### ケース2: エラーハンドリング不足

```tsx
// ❌ NG: エラー時にリスナーが停止する
function MyComponent() {
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (snapshot) => {
      setData(snapshot.data());
    });
    return () => unsubscribe();
  }, [userId]);
}

// ✅ OK: エラーハンドリング追加
function MyComponent() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        setData(snapshot.data());
        setError(null);
      },
      (err) => {
        console.error('[DEBUG][Firestore] リスナーエラー:', err);
        setError(err.message);
      }
    );
    return () => unsubscribe();
  }, [userId]);
}
```

### デバッグログ挿入例

```tsx
useEffect(() => {
  console.log('[DEBUG][Firestore] リスナー開始', {
    collection: 'users',
    docId: userId,
    timestamp: new Date().toISOString()
  });

  const unsubscribe = onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      console.log('[DEBUG][Firestore] スナップショット受信', {
        exists: snapshot.exists(),
        data: snapshot.data(),
        timestamp: new Date().toISOString()
      });
      setData(snapshot.data());
    },
    (error) => {
      console.error('[DEBUG][Firestore] リスナーエラー', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });
    }
  );

  return () => {
    console.log('[DEBUG][Firestore] リスナー停止', {
      docId: userId,
      timestamp: new Date().toISOString()
    });
    unsubscribe();
  };
}, [userId]);
```

### 予防策

1. **必ずunsubscribe**: useEffectのreturnでunsubscribeを呼ぶ
2. **エラーハンドリング**: onSnapshotの第3引数にエラーコールバックを設定
3. **ネットワーク状態監視**: `navigator.onLine` でオフライン検出

---

## 3. localStorage/IndexedDBクォータ超過

### 症状

- データ保存時に `QuotaExceededError` が発生
- 一部のデータが保存されない
- アプリが突然クラッシュする

### 典型例

```tsx
// ❌ NG: エラーハンドリングなし
function saveData(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ✅ OK: エラーハンドリング追加
function saveData(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log('[DEBUG][Storage] 保存成功', {
      key,
      size: JSON.stringify(data).length,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[DEBUG][Storage] クォータ超過', {
        key,
        size: JSON.stringify(data).length,
        usedSpace: calculateUsedSpace(),
        timestamp: new Date().toISOString()
      });

      // 古いデータを削除
      clearOldData();

      // 再試行
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

function calculateUsedSpace(): number {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

function clearOldData() {
  // タイムスタンプ付きデータから古いものを削除
  const keys = Object.keys(localStorage);
  const dataWithTimestamps = keys
    .filter(key => key.startsWith('data_'))
    .map(key => {
      try {
        const data = JSON.parse(localStorage[key]);
        return { key, timestamp: data.timestamp || 0 };
      } catch {
        return { key, timestamp: 0 };
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // 古い順に最大10個削除
  dataWithTimestamps.slice(0, 10).forEach(item => {
    console.log('[DEBUG][Storage] 古いデータ削除', { key: item.key });
    localStorage.removeItem(item.key);
  });
}
```

### デバッグログ挿入例

```tsx
// ストレージ使用状況をモニタリング
function logStorageStatus() {
  const used = calculateUsedSpace();
  const limit = 5 * 1024 * 1024; // 5MB（概算）

  console.log('[DEBUG][Storage] 使用状況', {
    used: `${(used / 1024).toFixed(2)} KB`,
    limit: `${(limit / 1024).toFixed(2)} KB`,
    percentage: `${((used / limit) * 100).toFixed(2)}%`,
    timestamp: new Date().toISOString()
  });
}
```

### 予防策

1. **定期的なクリーンアップ**: 古いデータを自動削除
2. **データサイズ制限**: 大きなデータはFirestoreに保存
3. **圧縮**: LZ-stringなどで圧縮してから保存
4. **IndexedDB移行**: localStorageよりも大きな容量が必要な場合

---

## 4. オフライン→オンライン復帰時のデータ同期

### 症状

- オフライン中の変更がオンライン復帰後に反映されない
- データの重複や競合が発生
- 「データを保存できませんでした」エラーが表示される

### 典型例

```tsx
// ❌ NG: オフライン状態を考慮していない
async function saveData(data: any) {
  await setDoc(doc(db, 'users', userId), data);
  alert('保存しました');
}

// ✅ OK: オフライン対応
async function saveData(data: any) {
  const isOnline = navigator.onLine;

  console.log('[DEBUG][Sync] 保存開始', {
    isOnline,
    dataSize: JSON.stringify(data).length,
    timestamp: new Date().toISOString()
  });

  if (!isOnline) {
    // オフライン時はローカルに保存
    const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    pendingData.push({
      id: Date.now(),
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingSync', JSON.stringify(pendingData));

    console.log('[DEBUG][Sync] オフライン保存', {
      pendingCount: pendingData.length
    });

    alert('オフラインで保存しました。オンライン復帰後に同期されます。');
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId), data);
    console.log('[DEBUG][Sync] Firestore保存成功');
    alert('保存しました');
  } catch (error) {
    console.error('[DEBUG][Sync] Firestore保存失敗', { error });
    alert('保存に失敗しました');
  }
}

// オンライン復帰時の同期
window.addEventListener('online', async () => {
  console.log('[DEBUG][Sync] オンライン復帰検出');

  const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');

  if (pendingData.length === 0) {
    console.log('[DEBUG][Sync] 同期データなし');
    return;
  }

  console.log('[DEBUG][Sync] 同期開始', { count: pendingData.length });

  for (const item of pendingData) {
    try {
      await setDoc(doc(db, 'users', userId), item.data);
      console.log('[DEBUG][Sync] 同期成功', { id: item.id });
    } catch (error) {
      console.error('[DEBUG][Sync] 同期失敗', { id: item.id, error });
    }
  }

  localStorage.removeItem('pendingSync');
  console.log('[DEBUG][Sync] 同期完了');
  alert('オフラインデータを同期しました');
});
```

### デバッグログ挿入例

```tsx
// ネットワーク状態の監視
window.addEventListener('online', () => {
  console.log('[DEBUG][Network] オンライン復帰', {
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('offline', () => {
  console.log('[DEBUG][Network] オフライン検出', {
    timestamp: new Date().toISOString()
  });
});
```

### 予防策

1. **オフライン対応**: `navigator.onLine` でネットワーク状態を監視
2. **ローカル保存**: オフライン時はlocalStorageに一時保存
3. **同期キュー**: オンライン復帰時に自動同期
4. **競合解決**: タイムスタンプで最新データを優先

---

## 5. タイマー競合（複数タイマー同時実行）

### 症状

- タイマーが予期せず停止する
- 複数のタイマーが同時に動作して表示がおかしい
- タイマーリセット時に前のタイマーが残る

### 典型例

```tsx
// ❌ NG: 古いタイマーをクリアしていない
function TimerComponent() {
  const [time, setTime] = useState(0);

  const startTimer = () => {
    setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  const resetTimer = () => {
    setTime(0);
    startTimer(); // 古いタイマーが残ったまま新しいタイマーが開始
  };
}

// ✅ OK: タイマーIDを管理
function TimerComponent() {
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    console.log('[DEBUG][Timer] タイマー開始', {
      currentTime: time,
      existingTimer: !!timerRef.current,
      timestamp: new Date().toISOString()
    });

    // 既存のタイマーをクリア
    if (timerRef.current) {
      console.log('[DEBUG][Timer] 既存タイマーをクリア');
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTime(prev => {
        const newTime = prev + 1;
        console.log('[DEBUG][Timer] タイマー更新', { newTime });
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    console.log('[DEBUG][Timer] タイマー停止', {
      currentTime: time,
      timestamp: new Date().toISOString()
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    console.log('[DEBUG][Timer] タイマーリセット');
    stopTimer();
    setTime(0);
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      console.log('[DEBUG][Timer] コンポーネントアンマウント - タイマークリア');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
}
```

### デバッグログ挿入例

```tsx
// タイマーの状態を可視化
useEffect(() => {
  console.log('[DEBUG][Timer] 状態変化', {
    time,
    isRunning: !!timerRef.current,
    timerId: timerRef.current,
    timestamp: new Date().toISOString()
  });
}, [time]);
```

### 予防策

1. **useRefでID管理**: タイマーIDをuseRefで保持
2. **必ずクリア**: 新しいタイマー開始前に既存をクリア
3. **cleanup関数**: useEffectのreturnでクリア
4. **状態管理**: isRunning stateでタイマーの状態を明示的に管理

---

## 6. クリスマスモード切り替えバグ

### 症状

- モード切り替え時に画面がちらつく
- 一部のコンポーネントでモードが反映されない
- localStorageとContext stateが不一致

### 典型例

```tsx
// ❌ NG: ハイドレーション前にlocalStorageを読む
function useChristmasMode() {
  const [isChristmasMode, setIsChristmasMode] = useState(() => {
    // SSR時にlocalStorageにアクセスするとエラー
    return localStorage.getItem('christmasMode') === 'true';
  });
}

// ✅ OK: ハイドレーション後にlocalStorageを読む
function useChristmasMode() {
  const [isChristmasMode, setIsChristmasMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    console.log('[DEBUG][ChristmasMode] ハイドレーション開始');
    const stored = localStorage.getItem('christmasMode') === 'true';

    console.log('[DEBUG][ChristmasMode] localStorageから読み込み', {
      stored,
      timestamp: new Date().toISOString()
    });

    setIsChristmasMode(stored);
    setIsHydrated(true);
  }, []);

  const toggleChristmasMode = () => {
    const newMode = !isChristmasMode;

    console.log('[DEBUG][ChristmasMode] モード切り替え', {
      from: isChristmasMode,
      to: newMode,
      timestamp: new Date().toISOString()
    });

    setIsChristmasMode(newMode);
    localStorage.setItem('christmasMode', String(newMode));
  };

  return { isChristmasMode, toggleChristmasMode, isHydrated };
}
```

### デバッグログ挿入例

```tsx
// モード切り替えの追跡
useEffect(() => {
  console.log('[DEBUG][ChristmasMode] Context状態変化', {
    isChristmasMode,
    isHydrated,
    localStorageValue: localStorage.getItem('christmasMode'),
    timestamp: new Date().toISOString()
  });
}, [isChristmasMode, isHydrated]);
```

### 予防策

1. **ハイドレーション考慮**: useEffectでlocalStorageを読む
2. **isHydrated状態**: ハイドレーション完了まで初期値を使用
3. **Context同期**: localStorageとContext stateを同期
4. **ちらつき防止**: CSS変数を使った即座のテーマ切り替え

---

## デバッグサイクルのベストプラクティス

### 1. 仮説生成

- エラーメッセージから可能性の高い原因を3つリストアップ
- 各仮説に優先度・根拠・確認方法を記載

### 2. ログ挿入

- `[DEBUG][コンポーネント名]` プレフィックスを使用
- 構造化データ: `{ timestamp, functionName, input, currentState }` 形式
- 挿入位置: 関数の入口・中間処理後・catchブロック・出口

### 3. 再現実行

- ユーザーにバグ再現を依頼
- コンソールログを収集

### 4. ログ分析

- 実行順序・タイミング・状態遷移を時系列で分析
- 問題箇所を特定

### 5. 修正適用

- 分析結果に基づき**最小限の修正**を適用
- テストで検証
- `[DEBUG]` ログをすべて削除

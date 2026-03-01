# 設計書: コーヒー豆図鑑 欠点豆追加バグ修正 (#278)

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `hooks/useDefectBeans.ts` | `useAppData.isLoading` を combined `isLoading` に含める |
| `lib/storage.ts` | `uploadDefectBeanImage` にタイムアウト（30秒）を追加 |
| Firebase (要確認) | Storage rules デプロイ・CORS 設定確認 |

---

## バグ1修正: Firebase Storage アップロードタイムアウト

### 現状

```typescript
// lib/storage.ts
export async function uploadDefectBeanImage(userId, defectBeanId, file): Promise<string> {
  try {
    const storageRef = ref(storageInstance, storagePath);
    await uploadBytes(storageRef, file);       // タイムアウトなし
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
}
```

### 修正方針

`Promise.race` でタイムアウト Promise と競合させる。30秒以内に完了しない場合はエラーを throw し、呼び出し元の `handleSubmit` が `catch` してトーストを表示する。

```typescript
const UPLOAD_TIMEOUT_MS = 30_000;

export async function uploadDefectBeanImage(userId, defectBeanId, file): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('画像のアップロードがタイムアウトしました')), UPLOAD_TIMEOUT_MS)
  );

  const uploadPromise = async (): Promise<string> => {
    const storageRef = ref(storageInstance, storagePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  try {
    return await Promise.race([uploadPromise(), timeoutPromise]);
  } catch (error) {
    throw error; // 呼び出し元の try-catch で捕捉される
  }
}
```

### 副次対応: Firebase Storage rules 確認

`storage.rules` の内容が Firebase 本番環境にデプロイされているか確認する。

```bash
firebase deploy --only storage
```

---

## バグ2修正: `isLoading` Race Condition

### 現状

```typescript
// hooks/useDefectBeans.ts
const { data: appData, updateData } = useAppData(); // isLoading を取得していない
const [isLoading, setIsLoading] = useState(true);   // masterLoading のみ

return {
  ...
  isLoading,  // masterLoading のみ → ページが早期表示される
};
```

### 修正方針

`useAppData` から `isLoading`（`appDataLoading`）を取得し、返却する `isLoading` に組み合わせる。

```typescript
// hooks/useDefectBeans.ts（修正後）
const { data: appData, updateData, isLoading: appDataLoading } = useAppData();
const [masterLoading, setMasterLoading] = useState(true);

return {
  ...
  isLoading: masterLoading || appDataLoading, // 両方のロード完了を待つ
};
```

この修正により:
- ページはマスターデータ AND ユーザーデータの両方が完了してから表示される
- `updateData` が呼ばれた時点では `useAppData.isLoading` が必ず `false`
- Race Condition が解消される

### 影響確認

`isLoading` の意味が広がるため、ページ表示が若干遅くなる可能性がある（ユーザーデータのロード時間分）。ただし、これは正しい動作であり、データ消失を防ぐために必要。

---

## テスト方針

### 手動テスト

1. `/defect-beans` を開く
2. 追加フォームを開き、画像 + 名称を入力して送信
3. フォームが閉じ、新しい欠点豆がリストに表示されることを確認
4. ページをリロードしても記録が保持されることを確認

### 自動テスト

- `hooks/useDefectBeans.ts` のユニットテスト追加（testing.md 参照）
- `lib/storage.ts` のタイムアウトテスト追加

---

## Firebase 調査チェックリスト

```bash
# 1. Storage rules のデプロイ確認
firebase deploy --only storage

# 2. Firestore rules のデプロイ確認（念のため）
firebase deploy --only firestore:rules

# 3. CORS 設定確認（Firebase Storage ドキュメント参照）
# gsutil cors get gs://{bucket-name}
```

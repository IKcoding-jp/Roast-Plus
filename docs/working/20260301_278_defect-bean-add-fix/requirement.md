# 要件定義: コーヒー豆図鑑 欠点豆追加バグ修正 (#278)

## 概要

コーヒー豆図鑑（`/defect-beans`）で欠点豆を追加しようとすると、フォームの送信ボタンがローディング状態のまま固まる、または記録がサイレントに消失する。

## ユーザー報告

- 追加フォームを送信後、送信ボタンがローディング状態のまま完了しない
- 画像を選択して送信しているが先に進まない

## 根本原因（2つ）

### バグ1: Firebase Storage アップロードがタイムアウトなしにハング

**場所**: `lib/storage.ts:37` (`uploadBytes`)

`uploadBytes(storageRef, file)` がネットワーク問題・Storage rules 未デプロイ・CORS 問題等でハングした場合、タイムアウトなく永久待機する。これにより `DefectBeanForm` の `isSubmitting` が `true` のまま解決されない。

```typescript
// 現状（lib/storage.ts）
await uploadBytes(storageRef, file);  // タイムアウトなし → ハングの原因
const downloadURL = await getDownloadURL(storageRef);
```

### バグ2: `useDefectBeans.isLoading` の Race Condition（サイレントデータ消失）

**場所**: `hooks/useDefectBeans.ts:12-13` および `hooks/useAppData.ts:225`

`useDefectBeans` が `useAppData` から `isLoading` を取得しておらず、返却する `isLoading` はマスターデータのロードのみを表す。ページはマスターデータ完了時点で表示されるが、`useAppData.isLoading`（ユーザーデータ）がまだ `true` の間にユーザーが追加を試みると、`updateData()` の保護コードが早期 return してデータが保存されない。

```typescript
// useAppData.ts:225 - 保護コード（良い設計だが、呼び出し元が isLoading を認識していない）
if (isLoadingRef.current) {
  console.warn('Cannot update data while loading...');
  return; // ← サイレント失敗。画像はアップロード済み、Firestore 保存はスキップ
}
```

## 受け入れ基準

1. 欠点豆追加フォームで画像・名称を入力して送信すると、正常に保存される
2. Firebase Storage が応答しない場合、30秒以内にエラートーストを表示してボタンが解放される
3. ページロード直後に追加しても Race Condition によるデータ消失が発生しない
4. 既存の機能（編集・削除・マスターデータ表示）が壊れない

## スコープ外

- 欠点豆の UI デザイン変更
- マスターデータの CRUD（管理者機能）
- 他ページへの影響

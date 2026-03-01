# タスクリスト: コーヒー豆図鑑 欠点豆追加バグ修正 (#278)

## フェーズ0: Firebase 調査（必須・最初に実施）

- [ ] `storage.rules` を Firebase 本番環境にデプロイ確認・再デプロイ
  ```bash
  firebase deploy --only storage
  ```
- [ ] Firebase Storage コンソールで `defect-beans/` パスへのアクセスが有効か確認
- [ ] (任意) Firebase Storage の CORS 設定確認

## フェーズ1: バグ1修正 - Storage タイムアウト

- [ ] **テスト**: `lib/storage.ts` の `uploadDefectBeanImage` タイムアウトテスト（Red）
  - タイムアウト発生時にエラーが thrown されることを確認
- [ ] **実装**: `uploadDefectBeanImage` に 30秒タイムアウトを追加（Green）
  - `Promise.race([uploadPromise(), timeoutPromise])` パターン
  - `UPLOAD_TIMEOUT_MS = 30_000` 定数を定義
- [ ] **確認**: lint + test pass

## フェーズ2: バグ2修正 - isLoading Race Condition

- [ ] **テスト**: `hooks/useDefectBeans.ts` で `appDataLoading` が `isLoading` に反映されることをテスト（Red）
  - `useAppData.isLoading = true` の間は `useDefectBeans.isLoading = true` であること
- [ ] **実装**: `useDefectBeans.ts` の修正（Green）
  - `const { data: appData, updateData, isLoading: appDataLoading } = useAppData();`
  - `isLoading` の変数名を `masterLoading` に変更（内部）
  - 返却値: `isLoading: masterLoading || appDataLoading`
- [ ] **確認**: 既存テストが通ること

## フェーズ3: 検証

- [ ] `npm run lint && npm run build && npm run test:run`
- [ ] 手動テスト: 欠点豆の追加 → フォーム送信 → リストに表示 → リロード後も保持
- [ ] 手動テスト: エラー系（Firebase が応答しない状況のシミュレーション）

## フェーズ4: PR 作成

- [ ] ブランチ作成: `fix/#278-defect-bean-add-fix`
- [ ] コミット
- [ ] PR 作成・レビュー依頼

## 依存関係

```
フェーズ0（Firebase調査）→ フェーズ1（Storage修正） →|
                                                     → フェーズ3（検証） → フェーズ4（PR）
フェーズ2（Race Condition修正） ─────────────────────→|
```

## 優先順位

**フェーズ0を最初に実施すること。** Firebase Storage rules が未デプロイだった場合、バグ1はルール修正のみで解決する可能性がある。その場合でも バグ2（Race Condition）は独立した問題として修正が必要。

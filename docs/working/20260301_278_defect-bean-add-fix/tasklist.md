# タスクリスト: コーヒー豆図鑑 欠点豆追加バグ修正 (#278)

**ステータス**: ✅ 完了
**完了日**: 2026-03-01

## フェーズ0: Firebase 調査（必須・最初に実施）

- [x] `storage.rules` を Firebase 本番環境にデプロイ確認・再デプロイ
  - 本番: 既にデプロイ済み（最新版）
  - 開発（roast-plus-dev）: Storage が未有効化 → 有効化後にデプロイ済み
- [x] Firebase Storage コンソールで `defect-beans/` パスへのアクセスが有効か確認
- [x] バグ1の根本原因判明: 開発環境 Firebase Storage が未有効化（課金設定後に解決）

## フェーズ1: バグ1修正 - Storage タイムアウト

- [x] **テスト**: `lib/storage.test.ts` タイムアウトテスト（Red → Green）
- [x] **実装**: `uploadDefectBeanImage` に 30秒タイムアウトを追加
  - `Promise.race([doUpload(), timeoutPromise])` パターン
  - `UPLOAD_TIMEOUT_MS = 30_000` 定数を定義
  - `clearTimeout` でタイマーのクリーンアップも実装
- [x] **確認**: lint + test pass

## フェーズ2: バグ2修正 - isLoading Race Condition

- [x] **テスト**: `hooks/useDefectBeans.test.ts` で `appDataLoading` が `isLoading` に反映されることをテスト
- [x] **実装**: `useDefectBeans.ts` の修正
  - `const { data: appData, updateData, isLoading: appDataLoading } = useAppData();`
  - `isLoading` の変数名を `masterLoading` に変更（内部）
  - 返却値: `isLoading: masterLoading || appDataLoading`
- [x] **確認**: 既存テストが通ること

## フェーズ3: 検証

- [x] `npm run lint && npm run build && npm run test:run`（1067テスト 100%合格）

## フェーズ4: PR 作成

- [x] ブランチ作成: `fix/#278-defect-bean-add-fix`
- [x] コミット（chore + fix の2コミット）
- [x] PR #279 作成

## 依存関係

```
フェーズ0（Firebase調査）→ フェーズ1（Storage修正） →|
                                                     → フェーズ3（検証） → フェーズ4（PR）
フェーズ2（Race Condition修正） ─────────────────────→|
```

## 優先順位

**フェーズ0を最初に実施すること。** Firebase Storage rules が未デプロイだった場合、バグ1はルール修正のみで解決する可能性がある。その場合でも バグ2（Race Condition）は独立した問題として修正が必要。

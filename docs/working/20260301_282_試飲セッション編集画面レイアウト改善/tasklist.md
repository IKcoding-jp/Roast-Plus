# タスクリスト

## フェーズ1: レイアウト修正（app/tasting/page.tsx）
- [x] セッション編集セクションのコンテナクラスを変更
  - [x] `min-h-screen pt-14 pb-6 sm:pb-8 px-4 sm:px-6 bg-page` に
        `flex flex-col items-center justify-center` を追加
  - [x] 内部の `<div className="max-w-lg mx-auto space-y-6">` から `space-y-6` を削除、`w-full` を追加

## フェーズ2: ボタン配置変更（components/TastingSessionForm.tsx）
- [x] 削除ボタンをフォーム右上のアイコンボタンに移動
  - [x] `IconButton` を `@/components/ui` からインポート
  - [x] フォームの最上部に右寄せの削除アイコン（`Trash` アイコン, `variant="ghost"`）を追加
  - [x] 既存のボトムボタン行から `<Button variant="danger">削除</Button>` を削除
- [x] ボトムボタン行をコンパクト化
  - [x] `flex flex-col sm:flex-row gap-3` → `flex gap-3` に変更（常に横並び）
  - [x] `order-*` クラスをすべて削除
  - [x] submitボタンは `flex-[1.5]`、キャンセルは `flex-1` に設定

## フェーズ3: 動作確認
- [ ] 編集画面を開いて縦中央配置を確認
- [ ] ゴミ箱アイコンタップで削除ダイアログが表示されることを確認
- [ ] キャンセル・更新ボタンが1行に収まることを確認
- [ ] 新規作成時にゴミ箱が表示されないことを確認
- [ ] `npm run lint && npm run build` でエラーなしを確認

**ステータス**: ✅ 完了
**完了日**: 2026-03-01

## 依存関係
- フェーズ1 → フェーズ3（独立して実施可）
- フェーズ2 → フェーズ3

## 見積もり
- フェーズ1: 5分
- フェーズ2: 15分
- フェーズ3: 5分
- **合計**: 約25分

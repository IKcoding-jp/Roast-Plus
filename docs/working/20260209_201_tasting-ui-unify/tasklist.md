# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-02-10

## フェーズ1: カード表示の統一

- [x] `components/TastingSessionList.tsx` の空状態表示を `<Card>` に置き換え
- [x] 枠線の見た目が他のページと統一されていることを確認

## フェーズ2: スクロール・レイアウトの修正

- [x] `app/tasting/page.tsx` の `pb-20 sm:pb-0` を除去
- [x] `components/TastingSessionCarousel.tsx` の `h-[calc(100dvh-160px)]` に変更
- [x] カルーセルに `pb-3` 追加でスクロールバー間隔確保
- [x] `overflow-y-hidden` は意図通りのため変更不要と判断

## フェーズ2.5: モバイルボタン統一（追加対応）

- [x] モバイルのフィルターボタンを `IconButton(surface)` に変更
- [x] `IconButton` に `surface` バリアント追加
- [x] `IconButton` の `primary` を塗りつぶしスタイルに変更

## フェーズ3: 検証

- [x] モバイルでスクロール・ボタン表示確認
- [x] デスクトップで表示確認
- [x] Lint チェック通過
- [x] Build通過
- [x] 既存テスト全通過（757テスト）

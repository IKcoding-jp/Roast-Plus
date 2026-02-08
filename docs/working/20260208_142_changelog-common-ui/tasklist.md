# タスクリスト: 更新履歴ページの共通UI化とテーマシステム対応

**ステータス**: ✅ 完了
**完了日**: 2026-02-08

## フェーズ1: page.tsx の共通UI化・テーマ対応
- [x] 戻るリンクを `BackLink` コンポーネントに置換
- [x] `HiArrowLeft` / `Link` のimport削除、`BackLink` をimport
- [x] ヘッダーのテキスト色をCSS変数に変更
- [x] アイコン色 `text-amber-500` → `text-spot`
- [x] フィルターカードを `Card` に置換
- [x] フッターボーダーを `border-edge` に変更
- [x] フッターテキスト色を `text-ink-muted` に変更

## フェーズ2: ChangeTypeFilter.tsx のテーマ対応
- [x] フィルターラベル `text-gray-500` → `text-ink-muted`
- [x] 非選択フィルター `bg-gray-100 text-gray-500 hover:bg-gray-200` → `bg-ground text-ink-muted hover:opacity-80`
- [x] クリアボタンを `Button variant="ghost"` に置換

## フェーズ3: 検証
- [x] npm run lint
- [x] npm run build
- [x] npm run test（750テスト全合格）

# tasklist.md — Issue #280

## ステータス凡例
- [ ] 未着手
- [x] 完了

---

## Phase 1: 準備

- [x] `components/defect-beans/SearchFilterSection.tsx` の参照を確認（他ファイルで import されていないか）
- [x] `@/components/ui` の `Modal` コンポーネントのAPIを確認

## Phase 2: FilterMenu コンポーネント実装

- [x] `components/defect-beans/SortMenu.tsx` を `FilterMenu.tsx` にリネームまたは新規作成
  - props: `searchQuery`, `onSearchChange`, `filterOption`, `onFilterChange`, `sortOption`, `onSortChange`
  - ボタン: 「フィルター」（アイコン: MdFilterList 等）
  - モーダル内構成:
    1. 検索セクション: `Input` で検索フィールド
    2. 絞り込みセクション: 「全て/省く/省かない」ラジオ風ボタン
    3. ソートセクション: 「デフォルト/新しい順/古い順/名前昇順/名前降順」ボタン

## Phase 3: page.tsx の更新

- [x] `SearchFilterSection` の import を削除
- [x] `SearchFilterSection` のレンダリング（JSX）を削除
- [x] `SortMenu` → `FilterMenu` に import変更
- [x] `FilterMenu` に `searchQuery`, `onSearchChange`, `filterOption`, `onFilterChange` を追加で渡す
- [x] `SortMenu` に渡していた `showSortMenu`, `onToggleMenu`, `onClose` props を整理

## Phase 4: 旧コンポーネントの削除

- [x] `SearchFilterSection.tsx` を削除
- [x] `SortMenu.tsx` を削除（`FilterMenu.tsx` に完全移行後）

## Phase 5: 検証

- [x] `npm run lint` — Lintエラー・warningゼロを確認
- [x] `npm run build` — ビルド成功を確認
- [x] `npm run test:run` — 既存テストが全通過を確認（1073件）
- [x] iPad幅（768px）でのレイアウト目視確認（スクリーンショット確認済み）

---

**ステータス**: ✅ 完了
**完了日**: 2026-03-01

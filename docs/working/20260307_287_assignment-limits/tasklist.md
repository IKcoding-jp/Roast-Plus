# タスクリスト

**ステータス**: 完了
**完了日**: 2026-03-07

## フェーズ1: 定数・ロジック実装
- [x] `app/assignment/lib/constants.ts` を新規作成
  - [x] `MAX_TEAMS = 4` を定義
  - [x] `MAX_TASK_LABELS = 8` を定義
  - [x] `MAX_MEMBERS = 15` を定義
- [x] `useTableEditing.ts` の `handleAddTeam` に上限チェック追加
  - [x] `teams.length >= MAX_TEAMS` の場合にToast表示＆早期リターン
- [x] `useTableEditing.ts` の `handleAddTaskLabel` に上限チェック追加
  - [x] `taskLabels.length >= MAX_TASK_LABELS` の場合にToast表示＆早期リターン
- [x] `useTableEditing.ts` の `handleAddMember` に上限チェック追加
  - [x] `members.length >= MAX_MEMBERS` の場合にToast表示＆早期リターン

## フェーズ2: UI制御
- [x] `DesktopTableView.tsx` — 班追加ボタンの表示制御
  - [x] `teams.length >= MAX_TEAMS` のとき「+」ボタンを非表示
- [x] `DesktopTableView.tsx` — 作業ラベル追加行の表示制御
  - [x] `taskLabels.length >= MAX_TASK_LABELS` のとき追加行の入力・ボタンを非表示
- [x] `MobileListView.tsx` — 確認済み（追加ボタンなし、変更不要）
- [x] `TableModals.tsx` — メンバー追加メニューの表示制御
  - [x] `members.length >= MAX_MEMBERS` のとき「新規メンバー追加」を非表示

## フェーズ3: テスト
- [x] 上限定数のテスト（constants.test.ts: 4テスト）
- [x] `useTableEditing` の上限チェックロジックのユニットテスト（useTableEditing.test.ts: 9テスト）

## 追加対応
- [x] Toast コンポーネントのテーマ対応（CSS変数ベースに変更）
- [x] 上限到達時のinfo Toast通知（最後の1つ追加時）

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（順次実行）
- Toast コンポーネントは既存（`components/Toast.tsx`）を使用

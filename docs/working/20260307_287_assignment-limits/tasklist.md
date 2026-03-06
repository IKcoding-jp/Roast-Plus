# タスクリスト

## フェーズ1: 定数・ロジック実装
- [ ] `app/assignment/lib/constants.ts` を新規作成
  - [ ] `MAX_TEAMS = 4` を定義
  - [ ] `MAX_TASK_LABELS = 8` を定義
  - [ ] `MAX_MEMBERS = 15` を定義
- [ ] `useTableEditing.ts` の `handleAddTeam` に上限チェック追加
  - [ ] `teams.length >= MAX_TEAMS` の場合にToast表示＆早期リターン
- [ ] `useTableEditing.ts` の `handleAddTaskLabel` に上限チェック追加
  - [ ] `taskLabels.length >= MAX_TASK_LABELS` の場合にToast表示＆早期リターン
- [ ] `useAssignmentHandlers.ts` の `handleAddMember` に上限チェック追加
  - [ ] `members.length >= MAX_MEMBERS` の場合にToast表示＆早期リターン

## フェーズ2: UI制御
- [ ] `DesktopTableView.tsx` — 班追加ボタンの表示制御
  - [ ] `teams.length >= MAX_TEAMS` のとき「+」ボタンを非表示
- [ ] `DesktopTableView.tsx` — 作業ラベル追加行の表示制御
  - [ ] `taskLabels.length >= MAX_TASK_LABELS` のとき追加行の入力・ボタンを非表示
- [ ] `MobileListView.tsx` — 必要に応じて同様の制御
- [ ] `TableModals.tsx` — メンバー追加メニューの表示制御
  - [ ] `members.length >= MAX_MEMBERS` のとき「新規メンバー追加」を非表示

## フェーズ3: テスト
- [ ] 上限定数のテスト（constants.ts のエクスポート確認）
- [ ] `useTableEditing` の上限チェックロジックのユニットテスト
- [ ] `useAssignmentHandlers` の上限チェックロジックのユニットテスト
- [ ] UIの表示制御テスト（上限時にボタン非表示確認）

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（順次実行）
- Toast コンポーネントは既存（`components/Toast.tsx`）を使用

## 見積もり
- フェーズ1: 10分
- フェーズ2: 15分
- フェーズ3: 20分
- **合計**: 約45分

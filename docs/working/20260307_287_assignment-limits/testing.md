# テスト計画

## テスト戦略

### ユニットテスト（Vitest）

#### `app/assignment/lib/constants.test.ts`
- 定数が正しくエクスポートされること
- 各定数が正の整数であること

#### `app/assignment/components/assignment-table/useTableEditing.test.ts`（既存 or 新規）
- handleAddTeam: `teams.length < MAX_TEAMS` の場合に追加が実行される
- handleAddTeam: `teams.length >= MAX_TEAMS` の場合に追加が実行されない
- handleAddTaskLabel: `taskLabels.length < MAX_TASK_LABELS` の場合に追加が実行される
- handleAddTaskLabel: `taskLabels.length >= MAX_TASK_LABELS` の場合に追加が実行されない

#### `app/assignment/hooks/useAssignmentHandlers.test.ts`（既存 or 新規）
- handleAddMember: `members.length < MAX_MEMBERS` の場合に追加が実行される
- handleAddMember: `members.length >= MAX_MEMBERS` の場合に追加が実行されない

## テストケース一覧

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| 正常系: 班追加（上限未満） | teams.length = 3 | 追加が実行される |
| 境界値: 班追加（上限ちょうど） | teams.length = 4 | 追加が拒否される |
| 正常系: 作業追加（上限未満） | taskLabels.length = 7 | 追加が実行される |
| 境界値: 作業追加（上限ちょうど） | taskLabels.length = 8 | 追加が拒否される |
| 正常系: メンバー追加（上限未満） | members.length = 14 | 追加が実行される |
| 境界値: メンバー追加（上限ちょうど） | members.length = 15 | 追加が拒否される |
| 異常系: 上限超過データの表示 | teams.length = 5（既存データ） | 正常に表示される、追加のみ制限 |

## カバレッジ目標
- lib/: 90%以上
- hooks/: 85%以上
- 全体: 75%以上

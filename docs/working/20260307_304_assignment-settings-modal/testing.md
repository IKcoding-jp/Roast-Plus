# テスト計画

## テスト戦略

### ユニットテスト（Vitest）

#### `app/assignment/lib/shuffle.ts`
- 班内シャッフル制約のテスト（`crossTeamShuffle: false`）
  - 全メンバーが元の班のスロットにのみ配置されることを検証
  - ペア除外設定との併用が正しく動作すること
  - 制約が厳しすぎて解が見つからない場合のフォールバック
- 班またぎシャッフルのテスト（`crossTeamShuffle: true`）
  - 従来の動作と同等であることを検証
- デフォルト値テスト（`crossTeamShuffle: undefined`）
  - `false` として動作することを検証

### コンポーネントテスト（Testing Library）

#### `app/assignment/components/AssignmentSettingsModal.tsx`
- モーダルの表示/非表示
- シャッフル設定セクションの表示（全ユーザー）
- Switchトグルの操作 → `onUpdateShuffleSettings` コールバック呼び出し
- `isDeveloperMode=false` でペア除外セクション非表示
- `isDeveloperMode=true` でペア除外セクション表示
- ペア除外の追加・削除操作（既存テストのポート）

## テストケース一覧

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| 正常系: 班内シャッフル | 2班×4タスク, crossTeamShuffle=false | 全メンバーが元の班に留まる |
| 正常系: 班またぎシャッフル | 2班×4タスク, crossTeamShuffle=true | メンバーが班をまたいで配置可能 |
| デフォルト: undefinedは班内 | 2班×4タスク, crossTeamShuffle=undefined | 班内シャッフルとして動作 |
| 境界値: 1班のみ | 1班×4タスク, crossTeamShuffle=false | 正常にシャッフル（制約の意味なし） |
| 境界値: 1人の班 | 班に1人だけ, crossTeamShuffle=false | その1人が班内の全スロットに配置 |
| 併用: ペア除外+班内 | 班内制約+ペア除外, crossTeamShuffle=false | 両方の制約を満たす |
| UI: トグルOFF→ON | Switchクリック | onUpdateShuffleSettings({ crossTeamShuffle: true }) |
| UI: ペア除外非表示 | isDeveloperMode=false | ペア除外セクションがDOMにない |
| UI: ペア除外表示 | isDeveloperMode=true | ペア除外セクションがDOMにある |

## カバレッジ目標
- lib/shuffle.ts: 90%以上（既存テスト + 新テスト）
- AssignmentSettingsModal: 80%以上
- 全体: 75%以上維持

# テスト計画

**Issue**: #173
**作成日**: 2026-02-07

## テスト戦略

### 移行テストの方針

既存テストの `isChristmasMode` 関連テストケースを更新:
- `isChristmasMode` prop を渡すテスト → 削除
- CSS変数によるテーマ切替テスト → 追加（必要に応じて）

### ユニットテスト更新対象

| テストファイル | 変更内容 |
|-------------|---------|
| `Accordion.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Badge.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Button.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Card.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Checkbox.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Dialog.test.tsx` | `isChristmasMode` prop テスト削除 |
| `EmptyState.test.tsx` | `isChristmasMode` prop テスト削除 |
| `IconButton.test.tsx` | `isChristmasMode` prop テスト削除 |
| `InlineInput.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Input.test.tsx` | `isChristmasMode` prop テスト削除 |
| `NumberInput.test.tsx` | `isChristmasMode` prop テスト削除 |
| `ProgressBar.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Select.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Switch.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Tabs.test.tsx` | `isChristmasMode` prop テスト削除 |
| `Textarea.test.tsx` | `isChristmasMode` prop テスト削除 |

### 検証項目

- [ ] 全テスト通過（811+テスト）
- [ ] lint 0 errors
- [ ] build 成功
- [ ] 通常モードの全UIコンポーネント表示が正しい
- [ ] クリスマスモードの全UIコンポーネント表示が正しい

### 手動動作確認

`/ui-test` ページで以下を確認:
1. 通常モード → 全コンポーネント表示
2. クリスマスモード切替 → 全コンポーネントの色が切り替わる
3. ブラウザリロード → テーマが維持される

## カバレッジ目標
- 全体: 75%以上維持
- `components/ui/`: 既存カバレッジ維持

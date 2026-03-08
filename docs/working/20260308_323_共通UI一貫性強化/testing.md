# テスト計画

## テスト戦略

### ユニットテスト（Vitest）

#### ESLintルールのテスト
- `eslint-rules/__tests__/no-raw-button.test.js`
  - 生`<button>`を検出すること
  - `<Button>`（共通コンポーネント）は検出しないこと
  - `components/ui/`内のファイルは除外されること
  - `onClick`なしの`<button type="submit">`も検出すること

- `eslint-rules/__tests__/no-raw-checkbox.test.js`
  - 生`<input type="checkbox">`を検出すること
  - `<Checkbox>`は検出しないこと
  - `<input type="text">`は検出しないこと（typeが異なる）
  - `components/ui/`内のファイルは除外されること

- `eslint-rules/__tests__/no-raw-select.test.js`
  - 生`<select>`を検出すること
  - `<Select>`は検出しないこと
  - `components/ui/`内のファイルは除外されること

### 統合テスト（既存テストの修正）

置換対象コンポーネントに既存テストがある場合、コンポーネント変更に伴い修正が必要:
- `FilterDialog` のテスト（該当テストがある場合）
- `TableModals` のテスト（該当テストがある場合）
- `MemberSettingsDialog` のテスト（該当テストがある場合）
- `MobileListView` のテスト（該当テストがある場合）
- `schedule/page.tsx` のテスト（該当テストがある場合）

### E2Eテスト（Playwright MCP / 手動）

以下のページで置換前後のスクリーンショット比較を推奨:
- `/progress` - FilterDialogのフィルターボタン
- `/assignment` - TableModals / MemberSettingsDialog のチェックボックス
- `/assignment` - MobileListViewのラベル・セルボタン
- `/schedule` - タブナビゲーション

## テストケース一覧

### ESLintルール

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| 正常系: 生button検出 | `<button onClick={fn}>text</button>` | 警告を出力 |
| 正常系: Button許可 | `<Button onClick={fn}>text</Button>` | 警告なし |
| 正常系: 生checkbox検出 | `<input type="checkbox" />` | 警告を出力 |
| 正常系: Checkbox許可 | `<Checkbox checked={v} />` | 警告なし |
| 正常系: 生select検出 | `<select><option>a</option></select>` | 警告を出力 |
| 正常系: Select許可 | `<Select options={opts} />` | 警告なし |
| 除外: ui内のbutton | `components/ui/Button.tsx`内の`<button>` | 警告なし |
| 除外: input typeが違う | `<input type="text" />` | 警告なし |

### UI置換

| テストケース | 確認方法 | 期待結果 |
|-------------|---------|---------|
| FilterDialog表示 | Playwright MCP | フィルターボタンが正しく表示・動作 |
| チェックボックス動作 | Playwright MCP | チェック切替が正常動作 |
| タブ切替 | Playwright MCP | タブ切替時にコンテンツが正しく表示 |
| テーマ切替 | 全7テーマで確認 | すべてのテーマで適切な配色 |

## カバレッジ目標
- ESLintルール: 100%（新規コードのため完全カバレッジ）
- 全体カバレッジ: 75%以上を維持（既存テスト + 新規テスト）

# 要件定義

**Issue**: #323
**作成日**: 2026-03-08
**ラベル**: refactor

## ユーザーストーリー

ユーザー「AIが生成したページで、ボタンやチェックボックスのスタイルがページごとに微妙に違う。共通コンポーネントがあるのに使われてないのはおかしい。統一してほしいし、今後もこういうことが起きないようにしてほしい」
アプリ「すべてのページで共通UIコンポーネントが使用され、一貫したデザインが保たれる。ESLintが生Tailwindの使用を検出して警告する」

## 要件一覧

### 必須要件
- [ ] 6箇所の生Tailwind CSSを共通コンポーネントに置換
  - FilterDialog: 生`<button>` → `Button`または`Tabs`
  - TableModals: 生`<input checkbox>` → `Checkbox`
  - MemberSettingsDialog: 生`<input checkbox>` → `Checkbox`
  - MobileListView(ラベル): 生`<div>` → `Badge`
  - MobileListView(セル): 生`<button>` → `Button` variant
  - schedule/page.tsx: 生タブ → `Tabs`
- [ ] ESLintカスタムルール作成（no-raw-button, no-raw-checkbox, no-raw-select）
- [ ] ESLintルールのテスト
- [ ] 全20共通コンポーネントの使用頻度分析レポート

### オプション要件
- [ ] 低頻度コンポーネントの統廃合提案（分析結果に基づく）

## 非機能要件
- パフォーマンス: 置換前後でUI描画パフォーマンスに劣化なし
- アクセシビリティ: 共通コンポーネントのaria属性を活用（現状改善）
- テーマ対応: 7テーマすべてで正常表示（CSS変数による自動対応）

## 受け入れ基準
- [ ] `npm run lint` がエラー・警告ゼロで通る
- [ ] `npm run build` が成功する
- [ ] `npm run test:run` が全テスト通過する
- [ ] 6箇所すべてが共通コンポーネントに置換されている
- [ ] ESLintカスタムルールが生`<button>`, `<input type="checkbox">`, `<select>`を検出する
- [ ] ESLintカスタムルールが`components/ui/`内のファイルを除外する
- [ ] 使用頻度分析レポートが作成されている
- [ ] 置換前後で視覚的な差異が最小限である（Playwright MCPでスクショ確認推奨）

## 参照
- Steering Documents: FEATURES.md「共通UI」セクション
- Steering Documents: GUIDELINES.md「コーディング規約」

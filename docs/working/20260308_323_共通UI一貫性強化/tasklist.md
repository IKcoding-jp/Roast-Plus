# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-03-08

## フェーズ1: 使用頻度分析（調査のみ）
- [ ] 全20共通コンポーネントの使用箇所をカウント
  - [ ] ボタン系: Button, IconButton
  - [ ] フォーム系: Input, NumberInput, InlineInput, Select, Textarea, Checkbox, Switch
  - [ ] コンテナ系: Card, Modal, Dialog, FloatingNav, BackLink
  - [ ] 表示系: Badge, RoastLevelBadge
  - [ ] フィードバック系: ProgressBar, EmptyState, Tabs, Accordion
- [ ] 使用頻度レポートをIssueコメントに投稿
- [ ] 低頻度コンポーネントの統廃合候補をリストアップ

## フェーズ2: 生Tailwind CSS置換
- [ ] FilterDialog: 生`<button>` → `Button`に置換
  - [ ] 現在のスタイルと`Button` variantの対応を確認
  - [ ] 置換実装
  - [ ] 動作確認
- [ ] TableModals: 生checkbox → `Checkbox`に置換
  - [ ] 赤色カスタムスタイルの対応方法を決定
  - [ ] 置換実装
  - [ ] 動作確認
- [ ] MemberSettingsDialog: 生checkbox → `Checkbox`に置換
  - [ ] 置換実装
  - [ ] 動作確認
- [ ] MobileListView(ラベル): 生`<div>` → `Badge`に置換
  - [ ] onClick対応の確認
  - [ ] 置換実装
  - [ ] 動作確認
- [ ] MobileListView(セル): 生`<button>` → `Button`に置換
  - [ ] 4状態のvariantマッピング決定
  - [ ] 置換実装
  - [ ] 動作確認
- [ ] schedule/page.tsx: 生タブ → `Tabs`に置換
  - [ ] Framer Motionアニメーションの対応方針決定
  - [ ] 置換実装
  - [ ] 動作確認

## フェーズ3: ESLintカスタムルール
- [ ] `eslint-rules/` ディレクトリ作成
- [ ] `no-raw-button` ルール実装 + テスト
- [ ] `no-raw-checkbox` ルール実装 + テスト
- [ ] `no-raw-select` ルール実装 + テスト
- [ ] `eslint-rules/index.js` エントリポイント作成
- [ ] `eslint.config.mjs` にカスタムルール追加
- [ ] `npm run lint` で既存コードに対して動作確認

## フェーズ4: 検証・仕上げ
- [ ] `npm run lint && npm run build && npm run test:run` 全通過
- [ ] 既存テストの修正（必要に応じて）
- [ ] 置換前後のUIスクリーンショット比較（Playwright MCP推奨）
- [ ] ESLintルールが`components/ui/`を正しく除外することを確認

## 依存関係
- フェーズ1 → フェーズ2（分析結果が置換方針に影響する可能性）
- フェーズ2 → フェーズ3（置換完了後にESLintルールを追加しないと大量の警告が出る）
- フェーズ2, フェーズ3 → フェーズ4（すべての変更完了後に統合検証）

## 見積もり
- フェーズ1: 約5分（grep/検索のみ）
- フェーズ2: 約20分（6箇所の置換 + 動作確認）
- フェーズ3: 約15分（3ルール + テスト）
- フェーズ4: 約10分（検証）
- **合計**: 約50分

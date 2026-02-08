# 設計書: デジタル時計ページの共通UI化とテーマシステム対応

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/clock/page.tsx` | 共通UI置換（BackLink, IconButton）、テーマ対応 |
| `components/clock/ClockSettingsModal.tsx` | Modal、IconButton、Switch、Button に置換、テーマ対応 |

## 設計方針

### 共通UI置換

#### page.tsx
1. **戻るリンク**: `<Link>` + `HiArrowLeft` → `<BackLink href="/" variant="icon-only" />`
2. **設定ボタン**: `<button>` + `HiCog6Tooth` → `<IconButton variant="ghost" rounded>`

#### ClockSettingsModal.tsx
1. **モーダル外殻**: 独自 `fixed inset-0` → `<Modal show={showSettings} onClose={onClose}>`
   - `contentClassName` で時計テーマの背景色をカスタム指定
2. **閉じるボタン**: 独自 `<button>` + `HiXMark` → `<IconButton variant="ghost" rounded>`
3. **トグルスイッチ**: 独自 `ToggleRow` → `<Switch>` コンポーネント
4. **リセットボタン**: 独自 `<button>` → `<Button variant="secondary" fullWidth>`

### テーマ対応

時計ページは独自テーマ（5色）を持つ特殊ケース。以下の方針で対応:

1. **時計表示エリア**: 時計固有テーマ（style属性）を維持（変更しない）
2. **設定モーダル**: 時計固有テーマを維持しつつ、Modalの外殻はCSS変数対応
3. **ページ全体**: 時計固有テーマが最優先（style属性でオーバーライド）

### 禁止事項チェック
- ❌ 生のTailwindでボタン/カード/入力を作らない → ✅ 共通コンポーネント使用
- ❌ `isChristmasMode` prop → ✅ CSS変数で自動（ただし時計固有テーマがstyle属性で優先）
- ❌ モーダル背景に `bg-surface` → ✅ `bg-overlay` 使用（Modal共通コンポーネントが対応済み）

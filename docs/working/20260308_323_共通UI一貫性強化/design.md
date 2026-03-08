# 設計書

## 実装方針

3つの作業を順次実行: ①使用頻度分析 → ②生Tailwind置換 → ③ESLintカスタムルール

### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/progress/components/FilterDialog.tsx` | 生`<button>` → `Button` variant使用 |
| `app/assignment/components/assignment-table/TableModals.tsx` | 生`<input checkbox>` → `Checkbox` |
| `app/assignment/components/MemberSettingsDialog.tsx` | 生`<input checkbox>` → `Checkbox` |
| `app/assignment/components/assignment-table/MobileListView.tsx` | 生`<div>`→`Badge`, 生`<button>`→`Button` |
| `app/schedule/page.tsx` | 生タブ → `Tabs`コンポーネント |
| `eslint.config.mjs` | カスタムルール追加 |

### 新規作成ファイル

| ファイル | 役割 |
|---------|------|
| `eslint-rules/no-raw-button.js` | 生`<button>`検出ESLintルール |
| `eslint-rules/no-raw-checkbox.js` | 生`<input type="checkbox">`検出ESLintルール |
| `eslint-rules/no-raw-select.js` | 生`<select>`検出ESLintルール |
| `eslint-rules/index.js` | ローカルプラグインエントリポイント |
| `eslint-rules/__tests__/` | ESLintルールのテスト |

## 置換設計

### 1. FilterDialog（生button → Button）

**現状**: フィルターオプションを生`<button>`で条件付きスタイリング
**方針**: `Button` コンポーネントの `outline` or `ghost` variantを使い、選択状態は`variant`切替で表現

```tsx
// Before
<button className={`px-3 py-1.5 ... ${selected ? 'bg-spot-subtle...' : 'bg-surface...'}`}>

// After
<Button
  variant={selected ? 'primary' : 'outline'}
  size="sm"
  onClick={...}
>
```

### 2. TableModals / MemberSettingsDialog（生checkbox → Checkbox）

**現状**: `appearance-none`で独自スタイリングされた`<input type="checkbox">`
**方針**: `Checkbox` コンポーネントに置換。色カスタマイズが必要な場合はclassName propで対応

```tsx
// Before
<input type="checkbox" className="appearance-none w-5 h-5 border rounded checked:bg-red-500..." />

// After
<Checkbox checked={isExcluded} onChange={handleChange} />
```

⚠️ TableModalsのチェックボックスは赤色（除外表示）。Checkboxコンポーネントのデフォルト色と異なる場合、className propまたはvariant追加を検討。

### 3. MobileListView（生div → Badge / 生button → Button）

**ラベル表示**:
```tsx
// Before
<div className="text-sm px-2 py-1 rounded cursor-pointer font-bold text-ink bg-ground border border-edge">

// After
<Badge variant="default" onClick={...}>{label.leftLabel}</Badge>
```

**セル選択ボタン**: 4つの状態（member+selected, member+unselected, empty+selected, empty+unselected）を持つ。`Button` の variant 切替で対応。

```tsx
// After
<Button
  variant={member ? (isSelected ? 'primary' : 'surface') : (isSelected ? 'outline' : 'ghost')}
  size="sm"
  fullWidth
  onClick={...}
>
  {member ? member.name : '未割当'}
</Button>
```

### 4. schedule/page.tsx（生タブ → Tabs）

**現状**: Framer Motion の `motion.div` でスライドアニメーション付きタブを独自実装
**方針**: `Tabs` コンポーネントに置換

```tsx
// Before
<div className="flex bg-ground rounded-2xl p-1.5 ...">
  <button onClick={() => setActiveTab('today')} className={...}>
    ...
    <motion.div className="absolute inset-0 rounded-xl bg-spot shadow-md" />
  </button>
</div>

// After
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="today">本日のスケジュール</TabsTrigger>
    <TabsTrigger value="week">今週のスケジュール</TabsTrigger>
  </TabsList>
  <TabsContent value="today">...</TabsContent>
  <TabsContent value="week">...</TabsContent>
</Tabs>
```

⚠️ 既存のFramer Motionアニメーション（スライドインジケーター）は`Tabs`コンポーネントに内蔵されていない場合、Tabsコンポーネント側にアニメーション対応を検討するか、アニメーションを簡略化する。

## ESLintカスタムルール設計

### アーキテクチャ

```
eslint-rules/
├── index.js          # プラグインエントリポイント
├── no-raw-button.js  # <button> 検出ルール
├── no-raw-checkbox.js # <input type="checkbox"> 検出ルール
├── no-raw-select.js  # <select> 検出ルール
└── __tests__/
    ├── no-raw-button.test.js
    ├── no-raw-checkbox.test.js
    └── no-raw-select.test.js
```

### ルール仕様

#### no-raw-button
- **検出対象**: JSX内の `<button>` 要素
- **除外**: `components/ui/` 配下のファイル
- **メッセージ**: `"生の <button> を使用しないでください。@/components/ui の Button または IconButton を使用してください。"`

#### no-raw-checkbox
- **検出対象**: JSX内の `<input type="checkbox">` 要素
- **除外**: `components/ui/` 配下のファイル
- **メッセージ**: `"生の <input type='checkbox'> を使用しないでください。@/components/ui の Checkbox を使用してください。"`

#### no-raw-select
- **検出対象**: JSX内の `<select>` 要素
- **除外**: `components/ui/` 配下のファイル
- **メッセージ**: `"生の <select> を使用しないでください。@/components/ui の Select を使用してください。"`

### eslint.config.mjs への統合

```js
import localRules from './eslint-rules/index.js';

// ルール追加
{
  plugins: { local: localRules },
  rules: {
    'local/no-raw-button': 'warn',
    'local/no-raw-checkbox': 'warn',
    'local/no-raw-select': 'warn',
  },
  // components/ui/ は除外
  ignores: ['components/ui/**'],
}
```

## 影響範囲
- `app/progress/` - FilterDialog のフィルターボタンUI
- `app/assignment/` - TableModals, MemberSettingsDialog, MobileListView
- `app/schedule/` - タブナビゲーションUI
- `eslint.config.mjs` - カスタムルール設定追加
- 既存テストファイル - コンポーネント変更に伴う修正が必要な可能性

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui`）
- [x] テーマ対応: セマンティックCSS変数使用（`bg-page`, `text-ink` 等）
- [x] ハードコード色の禁止（`bg-white`, `text-gray-800` 等は非推奨）

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない（むしろこれを修正するIssue）
- [x] 新しい状態管理ライブラリを導入しない
- [x] 設計方針を変更しない

## ADR

### Decision-001: ESLintカスタムルールをローカルプラグインとして実装
- **理由**: npm パッケージとして公開する規模ではない。ローカルプラグイン（`eslint-rules/`）として管理が最も軽量
- **影響**: eslint.config.mjs から直接インポート。外部依存なし

### Decision-002: 警告レベル（warn）で導入
- **理由**: 既存コードベースに即座にエラーを出さないため。6箇所の修正完了後にerrorへ昇格可能
- **影響**: CI/CDはブロックされない。開発者への注意喚起として機能

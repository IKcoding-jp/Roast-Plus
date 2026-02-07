# 設計書

**Issue**: #173
**作成日**: 2026-02-07

## 実装方針

### 移行戦略: CSS変数 + `@layer theme` セレクタ

現在の `isChristmasMode ? christmasStyle : normalStyle` パターンを、
CSS変数による自動切替に置き換える。

```
Before:
  Component.tsx → isChristmasMode prop → JS三項演算子 → Tailwindクラス切替

After:
  globals.css → @layer theme → CSS変数定義（default / christmas）
  Component.tsx → CSS変数参照のTailwindクラスのみ（条件分岐なし）
```

### 3つの移行パターン

#### パターン1: セマンティックトークン直接利用（低複雑度）

既存の `bg-page`, `text-ink`, `border-edge` 等にマッピング可能な場合。

```tsx
// Before
className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}

// After
className="text-ink"
```

#### パターン2: コンポーネントレベルCSS変数追加（中複雑度）

Input, Dialog等で、既存セマンティックトークンではカバーできない色がある場合。

```css
/* globals.css @layer theme */
:root {
  --input-bg: #ffffff;
  --input-border: #e5e7eb;
}
[data-theme="christmas"] {
  --input-bg: rgba(255, 255, 255, 0.1);
  --input-border: rgba(212, 175, 55, 0.4);
}
```

#### パターン3: バリアント固有CSS変数追加（高複雑度）

Button（10バリアント）、Card（6バリアント）等で、バリアントごとに色セットが異なる場合。

```css
/* globals.css @layer theme */
:root {
  --btn-primary-bg: #d97706;
  --btn-primary-hover: #b45309;
  --btn-primary-text: #ffffff;
  --btn-danger-bg: #dc2626;
  /* ... */
}
[data-theme="christmas"] {
  --btn-primary-bg: #6d1a1a;
  --btn-primary-hover: #8b2323;
  --btn-primary-text: #ffffff;
  --btn-danger-bg: #991b1b;
  /* ... */
}
```

### 変更対象ファイル

#### 主要変更（CSS変数定義）
- `app/globals.css` - `@layer theme` にCSS変数追加、`@theme inline` にTailwindユーティリティ登録

#### UIコンポーネント変更（19ファイル）
- `components/ui/Button.tsx` - normalVariantStyles/christmasVariantStyles統合
- `components/ui/Card.tsx` - 同上
- `components/ui/IconButton.tsx` - 同上
- `components/ui/Badge.tsx` - 同上
- `components/ui/Input.tsx` - normalStyles/christmasStyles統合
- `components/ui/NumberInput.tsx` - 同上
- `components/ui/Select.tsx` - 同上
- `components/ui/Textarea.tsx` - 同上
- `components/ui/Dialog.tsx` - インライン三項演算子削除
- `components/ui/Accordion.tsx` - 同上
- `components/ui/BackLink.tsx` - 同上
- `components/ui/Checkbox.tsx` - 同上
- `components/ui/EmptyState.tsx` - 同上
- `components/ui/InlineInput.tsx` - 同上
- `components/ui/Modal.tsx` - 同上
- `components/ui/ProgressBar.tsx` - 同上
- `components/ui/RoastLevelBadge.tsx` - 同上
- `components/ui/Switch.tsx` - 同上
- `components/ui/Tabs.tsx` - 同上

#### Consumer変更（約70ファイル）
- `components/` 配下 - `isChristmasMode` prop 受け渡し削除
- `app/` 配下 - `useChristmasMode()` インポート削除（テーマ切替UIで使用する箇所は残す）

#### テスト変更（16ファイル）
- `components/ui/*.test.tsx` - `isChristmasMode` 関連テスト更新

## 影響範囲

### 直接影響
- UIコンポーネント19個のAPI変更（`isChristmasMode` prop 削除）
- Consumer約70ファイルの更新

### 間接影響
- `useChristmasMode()` フックの利用箇所が大幅に減少（設定画面等のみに残る）
- テーマ切替の実装がCSS層に移動（JSからの関与が減少）

## 禁止事項チェック
- ❌ `useChristmasMode()` フック自体を削除しない（設定画面で使用中）
- ❌ CSS変数名に `christmas` 固有の名前を使わない（将来のテーマ追加に備える）
- ❌ ユーザーから見た表示・動作を変更しない
- ❌ 独自CSS（CSS Modules等）を導入しない → Tailwindユーティリティ + CSS変数

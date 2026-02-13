# 設計書

## 原因分析

### CSS変数の二重構造問題

```
:root {
  --background: #FDF8F0;  ← テーマ非対応（prefers-color-scheme のみ）
}

@layer theme {
  :root {
    --page: #F7F7F5;      ← テーマ対応（data-theme で切替）
  }
  [data-theme="christmas"] {
    --page: #051a0e;      ← ダーク系
  }
}

body {
  background: var(--background);  ← テーマ非対応の変数を参照！
}
```

ページ遷移時のタイムライン:
1. `router.push(href)` → 旧ページアンマウント
2. body の `var(--background): #FDF8F0` が露出（白い！）
3. 新ページの JSX がマウント → `bg-page` で正しい色が適用

### Loading.tsx のハードコード
`style={{ backgroundColor: '#F7F7F5' }}` でテーマ無視

## 実装方針

### 変更対象ファイル
- `app/globals.css` - body の background を `var(--page)` に変更
- `app/layout.tsx` - body に `bg-page` クラスを追加
- `components/Loading.tsx` - ハードコード背景色をテーマ対応に

### 新規作成ファイル
なし（`app/loading.tsx` の作成は不要。body の背景色修正で根本解決するため）

## 詳細設計

### 1. globals.css の修正

```css
/* 修正前 */
body {
  background: var(--background);
  color: var(--foreground);
}

/* 修正後 */
body {
  background: var(--page);
  color: var(--foreground);
}
```

### 2. layout.tsx の修正

```tsx
// 修正前
<body className={`${fonts} antialiased font-serif`}>

// 修正後
<body className={`${fonts} antialiased font-serif bg-page`}>
```

理由: CSS と Tailwind の両方で `--page` を指定することで、
CSS変数の読み込みタイミングに関係なく背景色が確実に適用される。

### 3. Loading.tsx の修正

```tsx
// 修正前
<div className={containerClass} style={{ backgroundColor: '#F7F7F5' }}>

// 修正後
<div className={`${containerClass} bg-page`}>
```

インラインスタイルを削除し、テーマ対応の `bg-page` に統一。

## 影響範囲
- 全ページの遷移体験に影響（改善方向）
- `--background` を直接参照している箇所があれば影響
  → `@theme inline` の `--color-background: var(--background)` → Tailwind の `bg-background` クラス
  → 使用箇所を要確認

## 禁止事項チェック
- ❌ 独自CSSで背景色を作らない → `bg-page` を使用
- ❌ テーマ判定ロジックをコンポーネントに入れない → CSS変数で自動対応
- ❌ `--background` 変数を削除しない → 後方互換性のため残す（将来的に整理）

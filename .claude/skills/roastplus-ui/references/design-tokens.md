# デザイントークンリファレンス

ローストプラスのCSS変数ベーステーマシステム。`data-theme` 属性で自動切替。

**7テーマ**: `default`, `christmas`, `dark-roast`, `light-roast`, `matcha`, `caramel`, `dark`

以下は代表として default / christmas の値を記載。他テーマの値は `app/globals.css` を参照。

---

## 目次

1. セマンティックトークン完全一覧
2. Tailwindクラスマッピング
3. ブランドカラー（固定）
4. カスタムユーティリティ
5. 使い方ガイド

---

## 1. セマンティックトークン完全一覧

`globals.css` で定義。全7テーマで値が自動切替。

### 背景色

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--page` | `bg-page` | `#F7F7F5` | `#051a0e` | ページ全体背景 |
| `--surface` | `bg-surface` | `#FFFFFF` | `#0d3520` | カード・セクション背景 |
| `--overlay` | `bg-overlay` | `#FFFFFF` | `#0a2f1a` | モーダル・ダイアログ（**不透明必須**） |
| `--ground` | `bg-ground` | `#F5F5F5` | `rgba(255,255,255,0.03)` | セクション背景・テーブルヘッダー |
| `--field` | `bg-field` | `#FFFFFF` | `rgba(255,255,255,0.08)` | 入力フィールド背景 |

### テキスト色

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--ink` | `text-ink` | `#1f2937` | `#f8f1e7` | メインテキスト |
| `--ink-sub` | `text-ink-sub` | `#4b5563` | `rgba(248,241,231,0.7)` | 補助テキスト・説明文 |
| `--ink-muted` | `text-ink-muted` | `#9ca3af` | `rgba(248,241,231,0.5)` | プレースホルダー・薄いテキスト |

### ボーダー

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--edge` | `border-edge` | `#e5e7eb` | `rgba(212,175,55,0.2)` | 通常ボーダー |
| `--edge-strong` | `border-edge-strong` | `#d1d5db` | `rgba(212,175,55,0.4)` | 強調ボーダー・ホバー |
| `--edge-subtle` | `border-edge-subtle` | `#f3f4f6` | `rgba(255,255,255,0.12)` | 薄いボーダー |

### アクセント色

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--spot` | `text-spot`, `bg-spot` | `#d97706` | `#d4af37` | アクセント色 |
| `--spot-hover` | `text-spot-hover` | `#b45309` | `#e8c65f` | アクセントホバー |
| `--spot-subtle` | `bg-spot-subtle` | `#f0f0f0` | `rgba(212,175,55,0.15)` | アクセント薄背景 |
| `--spot-surface` | `bg-spot-surface` | `#f7f7f7` | `rgba(212,175,55,0.05)` | アクセント極薄背景 |

### ボタン

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--btn-primary` | `bg-btn-primary` | `#d97706` | `#6d1a1a` | プライマリボタン背景 |
| `--btn-primary-hover` | `bg-btn-primary-hover` | `#b45309` | `#8b2323` | プライマリボタンホバー |

### ヘッダー

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--header-bg` | `bg-header-bg` | `#261a14` | `#4a0e0e` | ヘッダー背景 |
| `--header-text` | `text-header-text` | `#FFFFFF` | `#f8f1e7` | ヘッダーテキスト |
| `--header-accent` | `text-header-accent` | `#EF8A00` | `#d4af37` | ヘッダーアクセント |
| `--header-btn-hover` | `bg-header-btn-hover` | `rgba(255,255,255,0.1)` | `rgba(212,175,55,0.2)` | ヘッダーボタンホバー |

### ステータスカラー

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--danger` | `text-danger`, `bg-danger` | `#dc2626` | `#991b1b` | エラー・削除 |
| `--danger-subtle` | `bg-danger-subtle` | `#fee2e2` | `rgba(127,29,29,0.5)` | エラー薄背景 |
| `--success` | `text-success`, `bg-success` | `#16a34a` | `#166534` | 成功 |
| `--success-subtle` | `bg-success-subtle` | `#dcfce7` | `rgba(20,83,45,0.5)` | 成功薄背景 |
| `--warning` | `text-warning`, `bg-warning` | `#eab308` | `#d4af37` | 警告 |
| `--warning-subtle` | `bg-warning-subtle` | `#fef9c3` | `rgba(113,63,18,0.5)` | 警告薄背景 |
| `--info` | `text-info`, `bg-info` | `#00b8d4` | `#0097a7` | 情報 |
| `--info-hover` | `bg-info-hover` | `#00a0b8` | `#00838f` | 情報ホバー |

### エラー

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--error` | `text-error`, `border-error` | `#ef4444` | `#f87171` | エラーテキスト・ボーダー |
| `--error-ring` | `ring-error-ring` | `#fee2e2` | `rgba(248,113,113,0.2)` | エラーフォーカスリング |

### カードヘッダーグラデーション

| CSS変数 | default | christmas |
|---------|-----------|----------------|
| `--card-header-from` | `#211714` | `#143a22` |
| `--card-header-via` | `#3A2F2B` | `#143a22` |
| `--card-header-to` | `#211714` | `#143a22` |

使い方: `bg-gradient-to-r from-card-header-from via-card-header-via to-card-header-to`

### フィードバックテキスト

| CSS変数 | Tailwindクラス | default | christmas | 用途 |
|---------|---------------|-----------|----------------|------|
| `--feedback-correct` | `text-feedback-correct` | `#065f46` | `#4ade80` | 正解表示 |
| `--feedback-incorrect` | `text-feedback-incorrect` | `#9f1239` | `#fb7185` | 不正解表示 |

### シャドウ

| CSS変数 | カスタムクラス | default | christmas |
|---------|-------------|-----------|----------------|
| `--card-shadow` | `shadow-card` | 標準シャドウ | ゴールドグロー |
| `--card-shadow-hover` | `shadow-card-hover` | ホバーシャドウ | 強ゴールドグロー |
| `--card-glow` | `shadow-card-glow` | 薄いシャドウ | ダークシャドウ |

---

## 2. Tailwindクラスマッピング

`@theme inline` ブロックで登録済み。Tailwindクラスとして直接使用可能。

```tsx
// 背景色
<div className="bg-surface">      // カード
<div className="bg-overlay">      // モーダル（不透明）
<div className="bg-ground">       // セクション背景
<div className="bg-page">         // ページ背景
<input className="bg-field" />    // 入力フィールド

// テキスト色
<p className="text-ink">           // メインテキスト
<p className="text-ink-sub">       // サブテキスト
<p className="text-ink-muted">     // プレースホルダー
<span className="text-spot">      // アクセント

// ボーダー
<div className="border-edge">      // 通常ボーダー
<div className="border-edge-strong"> // 強調ボーダー

// ボタン
<button className="bg-btn-primary hover:bg-btn-primary-hover text-white">

// ヘッダー
<header className="bg-header-bg text-header-text">

// ステータス
<span className="text-danger">     // エラー
<span className="text-success">    // 成功
<div className="bg-danger-subtle">  // エラー薄背景
```

---

## 3. ブランドカラー（固定・テーマ非依存）

`:root` で定義。テーマに関わらず常に同じ値。

| CSS変数 | Tailwindクラス | 値 | 用途 |
|---------|---------------|-----|------|
| `--primary` | `text-primary`, `bg-primary` | `#EF8A00` | ブランドオレンジ |
| `--primary-dark` | `bg-primary-dark` | `#D67A00` | ブランドダークオレンジ |
| `--primary-light` | `text-primary-light` | `#FF9A1A` | ブランドライトオレンジ |
| `--dark` | `bg-dark` | `#211714` | ダークブラウン |
| `--dark-light` | `bg-dark-light` | `#3A2F2B` | ライトブラウン |
| `--gold` | `text-gold` | `#FFC107` | ゴールド |
| `--background` | `bg-background` | `#FDF8F0` | レガシー背景色 |

---

## 4. カスタムユーティリティ

`@layer utilities` で定義。テーマごとに値が自動切替。

```css
/* テーマ対応シャドウ */
.shadow-card          /* 通常: 標準shadow / ダーク系: テーマ色グロー */
.shadow-card-hover    /* 通常: ホバーshadow / ダーク系: 強グロー */
.shadow-card-glow     /* 通常: 薄shadow / ダーク系: ダークshadow */

/* タブアクティブ状態 */
.tab-active           /* 通常: bg-surface + text-ink / ダーク系: bg-spot-subtle + text-spot */

/* Select矢印アイコン */
.select-icon          /* テーマごとに矢印色が変化 */

/* ホームアイコン背景 */
.icon-circle-bg       /* 通常: 透明 / ダーク系: bg-spot-subtle + 丸背景 */
```

---

## 5. 使い方ガイド

### 新規要素のスタイリング

```tsx
// セマンティックトークンを使用（テーマ自動対応）
<div className="bg-surface border border-edge rounded-2xl p-4">
  <h3 className="text-ink font-bold">タイトル</h3>
  <p className="text-ink-sub">説明文</p>
  <span className="text-spot">アクセント</span>
</div>
```

### 避けるべきパターン

```tsx
// NG: 直接hex値（テーマ非対応）
<div className="bg-white text-gray-900 border-gray-200">

// NG: テーマ判定による配色分岐（旧方式）
<div className={isChristmasTheme ? 'bg-[#0a2f1a]' : 'bg-white'}>

// OK: セマンティックトークン（テーマ自動切替）
<div className="bg-surface text-ink border-edge">
```

### 新しいCSS変数を追加する場合

1. `app/globals.css` の `:root` と全7テーマの `[data-theme="xxx"]` ブロックに変数を追加
2. `@theme inline` ブロックに `--color-xxx: var(--xxx)` を追加
3. Tailwindクラスとして使用可能になる

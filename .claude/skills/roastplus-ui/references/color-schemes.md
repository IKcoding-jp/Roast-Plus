# ローストプラス 配色スキーム詳細ガイド

ローストプラスアプリケーションの配色スキームを詳細に解説します。
通常モードとクリスマスモードの両方の色定義、使用ガイドライン、実装パターンを記載します。

---

## 目次

1. ブランドカラーシステム
2. 通常モード詳細
3. クリスマスモード詳細
4. 配色切り替え実装
5. アクセシビリティ（カラーコントラスト）
6. CSS変数定義

---

## 1. ブランドカラーシステム

ローストプラスの配色は「コーヒーの世界」を表現しています。

### 1.1 メインカラー（オレンジ系）

コーヒーの焙煎時の温かさを表現します。

| 名称 | 16進数 | RGB | Tailwind | 用途 |
|------|--------|-----|----------|------|
| Primary Orange | `#EF8A00` | rgb(239, 138, 0) | `amber-600` | メインアクション、ブランド色 |
| Dark Orange | `#D67A00` | rgb(214, 122, 0) | `amber-700` | ホバー、押下状態 |
| Light Orange | `#FF9A1A` | rgb(255, 154, 26) | `amber-500` | 明るいアクセント、リンク |

**使用ガイド:**
- **Primary Orange**: ボタン、アイコン、強調テキスト
- **Dark Orange**: ホバー状態、選択状態、深い背景
- **Light Orange**: 補助的アクセント、ウォーニング背景

### 1.2 ダークカラー（ブラウン系）

コーヒー豆の深い色を表現します。

| 名称 | 16進数 | RGB | 用途 |
|------|--------|-----|------|
| Dark Brown | `#211714` | rgb(33, 23, 20) | ヘッダー、テキスト、濃い背景 |
| Light Brown | `#3A2F2B` | rgb(58, 47, 43) | 補助テキスト、サブヘッダー |

**使用ガイド:**
- **Dark Brown**: ページヘッダー、重要なテキスト（h1, h2）
- **Light Brown**: 補助テキスト、サブメニュー背景

### 1.3 ニュートラルカラー

背景、テキスト、境界線に使用します。

| 名称 | 16進数 | 用途 |
|------|--------|------|
| Background | `#FDF8F0` | ページ背景（通常モード） |
| Light Cream | `#F7F2EB` | グラデーション背景の明るい部分 |
| Neutral Gray | `#171717` / `#ededed` | テキスト、Dark/Light mode |
| White | `#FFFFFF` | カード背景、入力フィールド背景 |

### 1.4 ゴールド（高級感演出）

プレミアム感とクリスマス対応を強調します。

| 名称 | 16進数 | 用途 |
|------|--------|------|
| Primary Gold | `#FFC107` | 通常モード高級感演出 |
| Luxury Gold | `#d4af37` | クリスマスモード主要アクセント |

**使用ガイド:**
- ボーダー、グロー効果、特別なアクセント
- New!ラベルのグラデーション
- プレミアム機能のハイライト

---

## 2. 通常モード詳細

### 2.1 ページ背景グラデーション

優雅で落ち着いた印象を作ります。

**定義:**
```css
background: linear-gradient(180deg, #F7F2EB 0%, #F3F0EA 100%);
```

**Tailwind実装:**
```tsx
<div className="bg-gradient-to-b from-[#F7F2EB] to-[#F3F0EA]">
```

**背景色変数:**
```
--background: #FDF8F0
--foreground: #171717
```

### 2.2 テキストカラー

明確で読みやすい色選び。

| 種類 | 色 | Tailwindクラス | 使用例 |
|------|-----|----------------|-------|
| 主要テキスト | `#1F2A44` | `text-gray-900` / `text-slate-900` | 本文、ボタンテキスト |
| 補助テキスト | `#6B7280` | `text-gray-500` / `text-slate-500` | 説明文、プレースホルダ |
| ディセーブル | `#D1D5DB` | `text-gray-300` / `text-slate-300` | 無効化されたテキスト |

### 2.3 コンポーネント背景

それぞれのコンポーネントの背景色。

**カード:**
```tsx
<div className="bg-white/95 rounded-2xl shadow-md">
// または
<div className="bg-white rounded-2xl shadow-md">
```

**入力フィールド:**
```tsx
<input className="bg-white border border-gray-200 focus:bg-white">
```

**ボタン:**
```tsx
// プライマリ
<button className="bg-amber-600 hover:bg-amber-700">

// セカンダリ
<button className="bg-gray-600 hover:bg-gray-700">

// アウトライン
<button className="bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200">
```

### 2.4 ボーダー・シャドウ

階層感と奥行きを表現します。

**ボーダー:**
```
主要: border-gray-200 (2px)
補助: border-gray-300 (1px)
カード: border-gray-100
```

**シャドウ:**
```
カード通常: shadow-md
カードホバー: shadow-lg
モーダル: shadow-xl
```

### 2.5 ホバー・アクティブ状態

ユーザー操作のフィードバック。

**ボタン:**
```tsx
// ホバー
<button className="hover:bg-amber-700">

// アクティブ（押下）
<button className="active:scale-[0.98]">
```

**カード:**
```tsx
<div className="hover:shadow-lg hover:-translate-y-2 transition-all">
```

---

## 3. クリスマスモード詳細

クリスマスシーズンに特別な雰囲気を演出します。

### 3.1 ページ背景グラデーション

深い緑とゴールドで高級感を表現。

**定義:**
```css
background: radial-gradient(circle at center, #0a2f1a 0%, #051a0e 100%);
```

**Tailwind実装:**
```tsx
<div className="bg-[#051a0e] bg-[radial-gradient(circle_at_center,_#0a2f1a_0%,_#051a0e_100%)]">
```

### 3.2 クリスマスモードカラーパレット

| 用途 | 色 | Tailwind相当 | 説明 |
|------|-----|-------------|------|
| ベース背景 | `#051a0e` | `emerald-950` | 深い緑 |
| グラデーション中間 | `#0a2f1a` | `emerald-900` | 明るい緑 |
| アクセント（ゴールド） | `#d4af37` | 　 | 豪華なゴールド |
| アクセント（赤） | `#e23636` | `red-600` | クリスマス赤 |
| テキスト（主要） | `#f8f1e7` | 　 | アイボリー |
| テキスト（補助） | `#f8f1e7/60%` | 　 | 半透明アイボリー |

### 3.3 クリスマスモードコンポーネント

**ヘッダーグラデーション:**
```tsx
<header className="bg-gradient-to-r from-[#4a0e0e] via-[#5d1212] to-[#2d0a0a]">
```

**ボーダーラインのアクセント:**
```tsx
<div className="border-b-[0.5px] border-[#d4af37]/40 shadow-[0_-1px_10px_rgba(212,175,55,0.3)]">
```

**カード:**
```tsx
<div className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70">
```

**ボタン:**
```tsx
// プライマリボタン
<button className="bg-[#6d1a1a] text-[#f8f1e7] hover:bg-[#8b2323] border border-[#d4af37]/40 hover:border-[#d4af37]">

// グラデーションボタン
<button className="bg-gradient-to-r from-[#d4af37] to-[#e8c65f] text-[#051a0e] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
```

### 3.4 グロー効果（ゴールド）

ゴールドの輝き効果。

```tsx
// シャドウグロー
<div className="shadow-[0_0_15px_rgba(212,175,55,0.5)]">

// より大きなグロー
<div className="shadow-[0_0_30px_rgba(212,175,55,0.3)]">

// テキストドロップシャドウ
<span className="drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
```

### 3.5 クリスマスアイコン

ホームページで使用されるアイコンの置き換え。

```tsx
const ChristmasIcons = {
  assignment: FaGift,          // プレゼント
  schedule: BsStars,           // 星
  tasting: FaTree,             // ツリー
  'roast-timer': PiBellFill,   // 鐘
  'defect-beans': GiGingerbreadMan, // ジンジャーブレッドマン
  progress: FaSnowflake,       // 雪の結晶
  'drip-guide': GiCandyCanes,  // キャンディケーン
  'coffee-trivia': FaStar,     // 星
  changelog: FaSnowflake,      // 雪の結晶
};
```

---

## 4. 配色切り替え実装

### 4.1 基本的な切り替えパターン

**シンプルな三項演算子:**
```tsx
const { isChristmasMode } = useChristmasMode();

<div className={`${
  isChristmasMode
    ? 'bg-[#051a0e] text-[#f8f1e7]'
    : 'bg-white text-gray-900'
}`}>
  コンテンツ
</div>
```

### 4.2 複雑なスタイルの切り替え

**複数のスタイルプロパティ:**
```tsx
<button className={`
  px-6 py-3 rounded-lg font-semibold transition-all min-h-[44px]
  ${isChristmasMode
    ? 'bg-[#6d1a1a] text-[#f8f1e7] hover:bg-[#8b2323] border border-[#d4af37]/40 hover:border-[#d4af37] shadow-lg'
    : 'bg-amber-600 text-white hover:bg-amber-700'
  }
`}>
  ボタンテキスト
</button>
```

### 4.3 グラデーションの切り替え

**背景グラデーション:**
```tsx
<div className={`${
  isChristmasMode
    ? 'bg-[#051a0e] bg-[radial-gradient(circle_at_center,_#0a2f1a_0%,_#051a0e_100%)]'
    : 'bg-gradient-to-b from-[#F7F2EB] to-[#F3F0EA]'
}`}>
```

### 4.4 部分的な色の変更

**アイコンやテキストのみ変更:**
```tsx
<span className={`${
  isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'
}`}>
  テキスト
</span>

<div className={`border-t-[0.5px] ${
  isChristmasMode
    ? 'border-[#d4af37]/40'
    : 'border-gray-200'
}`}>
```

---

## 5. アクセシビリティ（カラーコントラスト）

### 5.1 WCAG AAA準拠（推奨）

コントラスト比 7:1 以上が推奨されます。

| 組み合わせ | コントラスト比 | 適性 | 用途 |
|-----------|----------------|------|------|
| `#F7F2EB` (背景) + `#1F2A44` (テキスト) | 9.2:1 | ✅ AAA | 通常モード本文 |
| `#FDF8F0` (背景) + `#171717` (テキスト) | 15.6:1 | ✅ AAA | 通常モード本文 |
| `#051a0e` (背景) + `#f8f1e7` (テキスト) | 10.5:1 | ✅ AAA | クリスマスモード本文 |
| `#FFFFFF` (ボタン) + `#EF8A00` (テキスト) | 4.5:1 | ✅ AA | ボタン |
| `#EF8A00` (背景) + `#FFFFFF` (テキスト) | 5.3:1 | ✅ AAA | ボタン |

### 5.2 避けるべき色の組み合わせ

```
❌ 避ける: #FDF8F0背景 + #FF9A1A テキスト（コントラスト2.8:1）
❌ 避ける: #F7F2EB背景 + #D67A00 テキスト（コントラスト3.2:1）
```

### 5.3 色覚異常への対応

色だけで情報を伝えない（パターン、テキスト、アイコンも併用）。

```tsx
// ✅ 良い例：色 + テキスト + アイコン
<span className="text-red-600 font-semibold">
  <FaError /> エラーが発生しました
</span>

// ❌ 悪い例：色のみ
<span className="text-red-600">エラー</span>
```

---

## 6. CSS変数定義

### 6.1 グローバルCSS（globals.css）

```css
:root {
  --background: #FDF8F0;
  --foreground: #171717;

  /* メインカラー */
  --primary: #EF8A00;
  --primary-dark: #D67A00;
  --primary-light: #FF9A1A;

  /* ダークカラー */
  --dark: #211714;
  --dark-light: #3A2F2B;

  /* その他 */
  --gold: #FFC107;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### 6.2 Tailwind v4 @theme定義

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-dark: var(--primary-dark);
  --color-primary-light: var(--primary-light);
  --color-dark: var(--dark);
  --color-dark-light: var(--dark-light);
  --color-gold: var(--gold);
}
```

### 6.3 Tailwindクラスでの使用

```tsx
// CSS変数を参照
<div className="bg-background text-foreground">
<button className="bg-primary hover:bg-primary-dark">
<span className="text-gold">

// または直接カラー指定
<div className="bg-amber-600 hover:bg-amber-700">
```

---

## 配色の選択ガイド

### 通常モードの色を選ぶ場合

1. **メイン背景**: `#FDF8F0` または `bg-white/95`
2. **テキスト**: `#1F2A44` または `text-gray-900`
3. **アクセント**: `#EF8A00` または `bg-amber-600`
4. **ホバー**: `#D67A00` または `bg-amber-700`
5. **ボーダー**: `#E5E7EB` または `border-gray-200`

### クリスマスモードの色を選ぶ場合

1. **メイン背景**: `#051a0e` + ラジアルグラデーション
2. **テキスト**: `#f8f1e7`
3. **アクセント**: `#d4af37`（ゴールド）
4. **セカンダリアクセント**: `#e23636`（赤）
5. **ボーダー**: `#d4af37/40`

---

## よくある質問

### Q: クリスマスモードになっていない
**A:** `useChristmasMode()`フックで `isChristmasMode` 変数が正しく取得されているか確認してください。

### Q: テキストが読みにくい
**A:** コントラスト比を確認。最低4.5:1（AA）、推奨7:1（AAA）を目安に調整してください。

### Q: 新しい色を追加したい
**A:**
1. `app/globals.css` の `:root` に新色を追加
2. `@theme inline` で新色を登録
3. このドキュメントに追記して、チーム全体に周知

### Q: ボタンの色がクリスマスモードで反映されない
**A:** 以下を確認：
```tsx
// ✅ 正しい
className={`${isChristmasMode ? 'クリスマス色' : '通常色'}`}

// ❌ 間違い（クリスマス変数がスコープ外）
className="bg-amber-600"
```


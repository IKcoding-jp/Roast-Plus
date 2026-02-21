# アニメーション実装ガイド

グローバルCSSアニメーション、Tailwindトランジション、Framer Motion パターン。

---

## 目次

1. グローバルCSSアニメーション
2. Tailwindトランジション
3. Framer Motion
4. アクセシビリティ（prefers-reduced-motion）
5. パフォーマンス最適化

---

## 1. グローバルCSSアニメーション

`globals.css` に定義済み。

### pulse-scale（パルス）

New!ラベル、アテンション要素に使用。

```tsx
<div className="animate-pulse-scale">
  <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs font-bold">
    New!
  </span>
</div>
```

- 持続時間: 2秒、無限ループ
- 変化: scale(1) → scale(1.05) → scale(1)

### home-slide-in（ページスライドイン）

ホームページ初期ロード時。

```tsx
<div className="animate-home-page">
  {/* ページ全体 */}
</div>
```

- 持続時間: 0.55秒（1回のみ）
- 変化: 左からスライド + フェードイン
- `will-change: opacity, transform` 設定済み

### home-card-appear（カード順次出現）

ホームページグリッドカード。`animationDelay` で順次出現。

```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-home-card"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    {/* カード */}
  </div>
))}
```

- 持続時間: 0.48秒（1回のみ）
- 変化: 下からスライド + フェードイン
- 遅延間隔: 60ms

### gradient-shift（グラデーション流動）

New!ラベルのグラデーション背景。

```tsx
<span className="new-label-gradient text-white px-2 py-0.5 rounded-full text-xs font-bold">
  New!
</span>
// または
<span className="completed-label-gradient text-white ...">
  完了
</span>
```

### walk / wobble アニメーション

ヘッダーキャラクター歩行用:
- `.animate-walk-characters` - 横移動 + バウンス
- `.animate-wobble-left` / `.animate-wobble-right` - ゆらゆら歩行風

### テーマ変更トランジション

テーマ切替時に `body` に `transition-colors duration-1000` が適用され、配色が1秒かけて滑らかに変化する。

---

## 2. Tailwindトランジション

### 基本パターン

```tsx
// 色のみ
<button className="transition-colors duration-200 hover:bg-btn-primary-hover">

// 全プロパティ
<div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover">

// スケール
<div className="transition-transform duration-200 hover:scale-105">
```

### 推奨持続時間

| 用途 | Tailwind | 値 |
|------|----------|-----|
| ホバー効果 | `duration-200` | 200ms |
| フェードイン / モーダル開閉 | `duration-300` | 300ms |
| ページ入場アニメーション | - | 480-550ms |
| テーマ変更 | `duration-1000` | 1000ms |

### よく使う組み合わせ

```tsx
// カードホバー（リフト + シャドウ）
<Card variant="hoverable">  // 内部でtransition-all設定済み

// ボタン押下
<Button>  // 内部でtransition-colors設定済み

// カスタムリフト効果
<div className="hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300">
```

---

## 3. Framer Motion

### フェードイン

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  コンテンツ
</motion.div>
```

### モーダル（AnimatePresence）

`Modal` コンポーネントが内部で使用済み。直接使用時:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* コンテンツ */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 順次出現（staggerChildren）

```tsx
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.div key={i.id} variants={item}>{/* ... */}</motion.div>
  ))}
</motion.div>
```

### ホバー/タップ

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  ボタン
</motion.button>
```

---

## 4. アクセシビリティ（prefers-reduced-motion）

`globals.css` に定義済み:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-home-page,
  .animate-home-card {
    animation: none;
  }
}
```

Framer Motion 使用時:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
>
```

---

## 5. パフォーマンス最適化

- **`transform` と `opacity` のみ**使用（`width`/`height` のアニメーションは避ける）
- `will-change` は限定的に使用（`.animate-home-page` と `.animate-home-card` に設定済み）
- 常時アニメーションは3個以下（`pulse-scale` 等）
- 順次アニメーションは最大10個程度

# ローストプラス アニメーション実装ガイド

ローストプラスアプリケーションで使用されるアニメーション、トランジション、動き表現をまとめています。
グローバルに定義されたアニメーションから、Framer Motionの高度な実装まで幅広くカバーします。

---

## 目次

1. グローバルアニメーション定義
2. Tailwindトランジション
3. Framer Motion実装
4. よく使うアニメーションパターン
5. アクセシビリティ配慮（prefers-reduced-motion）
6. パフォーマンス最適化

---

## 1. グローバルアニメーション定義

### 1.1 グローバルCSS（app/globals.css）

ページ全体で使用可能なアニメーションをCSS変数で定義します。

```css
/* New!ラベルのパルスアニメーション */
@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse-scale {
  animation: pulse-scale 2s ease-in-out infinite;
}

/* グラデーション背景の流動アニメーション */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* ホームページスライドイン */
@keyframes home-slide-in {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-home-page {
  animation: home-slide-in 0.55s cubic-bezier(0.25, 0.8, 0.3, 1) both;
  will-change: opacity, transform;
}

/* ホームページカード出現 */
@keyframes home-card-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-home-card {
  animation: home-card-appear 0.48s ease-out both;
  will-change: opacity, transform;
}

/* 減速・削除運動対応 */
@media (prefers-reduced-motion: reduce) {
  .animate-home-page,
  .animate-home-card {
    animation: none;
  }
}
```

### 1.2 各アニメーションの詳細

#### pulse-scale（パルススケール）

**用途:** New!ラベル、アテンション要素

**特性:**
- 持続時間: 2秒
- ループ: 無限
- タイミング: ease-in-out（開始と終了が緩い）
- 変化: 100% → 105% → 100%

**実装例:**
```tsx
<div className="animate-pulse-scale">
  <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
    New!
  </span>
</div>
```

**カスタマイズ:**
```css
/* より速いパルス */
.animate-pulse-scale-fast {
  animation: pulse-scale 1s ease-in-out infinite;
}

/* より大きなスケール変化 */
@keyframes pulse-scale-large {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.animate-pulse-scale-large {
  animation: pulse-scale-large 2s ease-in-out infinite;
}
```

#### gradient-shift（グラデーションシフト）

**用途:** グラデーション背景アニメーション、バッジ

**特性:**
- 持続時間: 3秒
- ループ: 無限
- タイミング: linear（一定の速度）
- 背景位置: 0% → 100% → 0%

**実装例:**
```tsx
<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-[length:200%_100%]"
      style={{ animation: 'gradient-shift 3s ease infinite' }}>
  グラデーション背景
</span>
```

#### home-slide-in（ホームスライドイン）

**用途:** ホームページの初期ロード時のページ全体アニメーション

**特性:**
- 持続時間: 0.55秒
- ループ: なし（1回のみ）
- タイミング: cubic-bezier(0.25, 0.8, 0.3, 1)（春のような動き）
- 変化: 左から右へスライド + フェードイン

**実装:**
```tsx
<div className="animate-home-page">
  {/* ページコンテンツ */}
</div>
```

**カスタマイズ:**
```css
/* トップからスライド */
@keyframes home-slide-in-top {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-home-page-top {
  animation: home-slide-in-top 0.55s cubic-bezier(0.25, 0.8, 0.3, 1) both;
}
```

#### home-card-appear（ホームカード出現）

**用途:** ホームページグリッドカードの順次出現

**特性:**
- 持続時間: 0.48秒
- ループ: なし（1回のみ）
- タイミング: ease-out（最初は速く、終わりは遅い）
- 変化: 下から上へスライド + フェードイン

**実装:**
```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-home-card"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    {/* カード内容 */}
  </div>
))}
```

**遅延の計算:**
- アイテム0: 0ms（すぐに開始）
- アイテム1: 60ms
- アイテム2: 120ms
- アイテム3: 180ms
- ...

---

## 2. Tailwindトランジション

日常的に使用するトランジション設定です。

### 2.1 基本トランジション

```tsx
/* すべてのプロパティの変更に対応 */
<div className="transition-all duration-200">

/* 色のみの変更 */
<button className="transition-colors duration-300 hover:bg-blue-600">

/* トランスフォームのみ */
<div className="transition-transform duration-300 hover:scale-105">

/* 不透明度のみ */
<div className="transition-opacity duration-200 hover:opacity-75">
```

### 2.2 持続時間

| 値 | Tailwind | 用途 |
|----|----------|------|
| 75ms | `duration-75` | 素早い反応（ホバー） |
| 100ms | `duration-100` | 高速トランジション |
| 200ms | `duration-200` | **標準（推奨）** |
| 300ms | `duration-300` | やや遅い |
| 500ms | `duration-500` | 大きな変更 |
| 700ms | `duration-700` | 時間のかかる変更 |
| 1000ms | `duration-1000` | 長いアニメーション |

**推奨:**
- ホバー効果: `duration-200` または `duration-300`
- フェードイン: `duration-300`
- モーダル開閉: `duration-300` または `duration-500`

### 2.3 タイミング関数

```tsx
/* 線形（一定の速度） */
<div className="transition-all linear duration-300">

/* ease-in（最初は遅い、終わりは速い） */
<div className="transition-all ease-in duration-300">

/* ease-out（最初は速い、終わりは遅い） */
<div className="transition-all ease-out duration-300 hover:opacity-50">

/* ease-in-out（最初と終わりが遅い） */
<div className="transition-all ease-in-out duration-300">

/* cubic-bezierカスタム */
<div style={{ transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.3, 1)' }}>
```

### 2.4 よく使うトランジションパターン

**ボタンホバー（リフト効果）**
```tsx
<button className="hover:-translate-y-1 transition-all duration-200">
  ボタン
</button>
```

**カードホバー（より大きなリフト）**
```tsx
<div className="hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
  カード
</div>
```

**色の変更**
```tsx
<button className="bg-amber-600 hover:bg-amber-700 transition-colors duration-300">
  ボタン
</button>
```

**スケール変化**
```tsx
<div className="hover:scale-105 transition-transform duration-300">
  要素
</div>
```

**複合効果**
```tsx
<div className="hover:-translate-y-2 hover:shadow-xl hover:scale-105 transition-all duration-300">
  複合効果
</div>
```

---

## 3. Framer Motion実装

より高度なアニメーションが必要な場合、Framer Motionを使用します。

### 3.1 基本的なMotion要素

```tsx
import { motion } from 'framer-motion';

// フェードイン・スライドイン
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  コンテンツ
</motion.div>
```

### 3.2 よく使うパターン

#### フェードイン・アウト

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
```

#### スライド + フェード

```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```

#### スケール + フェード（モーダル）

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.3 }}
>
```

#### ストリップ可能なプログレスバー

```tsx
<motion.div
  className="h-full bg-amber-500"
  initial={{ width: 0 }}
  animate={{ width: `${progressPercent}%` }}
  transition={{ duration: 1, ease: 'linear' }}
/>
```

### 3.3 複雑なアニメーション例

**順次出現（子要素）**
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {/* コンテンツ */}
    </motion.div>
  ))}
</motion.div>
```

**ホバー時のスケール**
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

## 4. よく使うアニメーションパターン

### 4.1 ホームページ

ページ読み込み時：
```tsx
<div className="animate-home-page">
  {/* ページ全体 */}
</div>

{/* グリッドカード順次出現 */}
<div className="grid grid-cols-2">
  {cards.map((card, index) => (
    <div
      key={card.id}
      className="animate-home-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* カード */}
    </div>
  ))}
</div>
```

### 4.2 New!ラベル（パルス）

```tsx
<div className="absolute -top-1 -right-1 animate-pulse-scale">
  <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500">
    New!
  </span>
</div>
```

### 4.3 モーダル開閉

Framer Motion使用：
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* オーバーレイ */}
      <motion.div
        className="fixed inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* モーダル */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* モーダルコンテンツ */}
        </motion.div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 4.4 タイマー表示の更新

スムーズな数値更新：
```tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Timer({ time }: { time: number }) {
  return (
    <motion.div
      key={time}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="text-6xl font-bold text-amber-600"
    >
      {time}
    </motion.div>
  );
}
```

---

## 5. アクセシビリティ配慮（prefers-reduced-motion）

ユーザーの「減速・削除運動の優先」設定を尊重します。

### 5.1 CSS Media Query

```css
/* グローバルアニメーション */
@media (prefers-reduced-motion: reduce) {
  .animate-home-page,
  .animate-home-card {
    animation: none;
  }

  /* すべてのトランジションを無効化 */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.2 Framer Motion対応

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3,
  }}
>
  コンテンツ
</motion.div>
```

### 5.3 カスタムフック

```tsx
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// 使用方法
const prefersReducedMotion = useReducedMotion();
const duration = prefersReducedMotion ? 0 : 0.3;
```

---

## 6. パフォーマンス最適化

### 6.1 will-change（ブラウザ最適化ヒント）

アニメーション対象要素に `will-change` を追加：

```tsx
<div className="animate-home-page" style={{ willChange: 'opacity, transform' }}>
  {/* グローバルCSSで既に定義済み */}
</div>
```

**注意:** `will-change` は過度に使用しないこと（パフォーマンス低下）

### 6.2 transform と opacity のみを使用

パフォーマンスが良い：
```tsx
<div className="hover:-translate-y-2 hover:opacity-80 transition-all">
```

パフォーマンスが悪い：
```tsx
<div className="hover:w-64 hover:h-64 transition-all">
  {/* widthやheightの変更は重い */}
</div>
```

### 6.3 アニメーション個数の制限

- ページ読み込み時: 最大10個程度の順次アニメーション
- 常時動作: 3個以下（pulse-scale等）
- 複雑な相互作用がある場合は、`requestAnimationFrame` で制御

---

## アニメーション実装チェックリスト

新規アニメーション実装時に確認：

- [ ] **prefers-reduced-motion対応**: ユーザー設定を尊重
- [ ] **パフォーマンス**: `will-change`, `transform`, `opacity` 優先
- [ ] **アニメーション時間**: 適切か（速すぎない、遅すぎない）
- [ ] **初期状態**: 無効なアニメーションは除外
- [ ] **キーフレーム**: スムーズか（ガクガクしていないか）
- [ ] **モーダル**: `AnimatePresence` で入り口と出口アニメーション
- [ ] **遅延設定**: 順次アニメーション時に計算間隔は統一
- [ ] **クリスマスモード**: 必要に応じて両モード対応
- [ ] **テスト**: 複数デバイス・ブラウザで動作確認

---

## よくある問題と解決策

### Q: アニメーションがガクガクしている
**A:** `will-change` を追加、`transform` または `opacity` のみを使用

### Q: Framer Motionで子要素が同時に出現する
**A:** `staggerChildren` で遅延を設定

### Q: モーダルのアニメーションが効かない
**A:** `AnimatePresence` を使用して、コンポーネントのマウント・アンマウントを制御

### Q: `prefers-reduced-motion` を無視できない
**A:** 仕様なので無視しないこと。ユーザーの健康と設定を尊重

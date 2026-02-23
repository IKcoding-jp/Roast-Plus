# 設計書: テーマセレクターのビジュアルリデザイン

**Issue**: #272

---

## 変更対象ファイル

| ファイル | 変更種別 | 変更概要 |
|---------|---------|---------|
| `lib/theme.ts` | 変更 | `ThemePreset` に `fontStyle`・`animationType` フィールド追加 |
| `lib/theme.test.ts` | 変更 | 新フィールドのテスト追加 |
| `components/settings/ThemeSelector.tsx` | 変更 | `ThemePreviewCard` コンポーネントの全面リデザイン |
| `components/settings/ThemeSelector.test.tsx` | 変更 | 新UIのテスト更新 |

---

## lib/theme.ts の変更仕様

### 型定義の拡張

```typescript
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark';
  themeColor: string;
  previewColors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
  // 新規追加フィールド
  fontStyle: string;       // Tailwindクラス文字列 (e.g., "font-black tracking-tight")
  animationType: ThemeAnimationType;
}

export type ThemeAnimationType =
  | 'steam'    // デフォルト: 湯気上昇
  | 'flame'    // ダークロースト: 炎ゆらぎ
  | 'particles' // ライトロースト: 粒子浮上
  | 'leaf'     // 抹茶ラテ: 葉そよぎ
  | 'glow'     // キャラメルマキアート: 光波
  | 'snow'     // クリスマス: 雪降下
  | 'stars';   // ダークモード: 星瞬き
```

### 各テーマのfontStyle

```typescript
{ id: 'default',       fontStyle: 'font-bold tracking-normal' }
{ id: 'dark-roast',    fontStyle: 'font-black tracking-tight' }
{ id: 'light-roast',   fontStyle: 'font-light tracking-wide' }
{ id: 'matcha',        fontStyle: 'font-semibold tracking-widest' }
{ id: 'caramel',       fontStyle: 'font-bold tracking-normal' }
{ id: 'christmas',     fontStyle: 'font-extrabold tracking-tight' }
{ id: 'dark',          fontStyle: 'font-black tracking-tight' }
```

---

## ThemeSelector.tsx のコンポーネント設計

### コンポーネント構造

```
ThemeSelector
└── ThemePreviewCard (×7)
    ├── アニメーションレイヤー（絶対配置）
    │   └── ThemeAnimation (animationType別コンポーネント)
    ├── カード上部
    │   ├── テーマアイコン（react-icons、24px）
    │   └── LIGHT/DARK バッジ
    ├── カード中部
    │   ├── テーマ名（text-2xl、fontStyle適用）
    │   └── 説明文（text-xs opacity-75）
    └── カード下部
        ├── 色スウォッチ（3ドット）
        └── 選択チェック（HiCheck）
```

### アニメーションコンポーネント設計

```typescript
// アニメーション種別ごとのコンポーネントをswitch分岐
function ThemeAnimation({ type }: { type: ThemeAnimationType }) {
  // prefers-reduced-motion 判定
  const prefersReduced = useReducedMotion(); // Framer Motionの組み込みフック
  if (prefersReduced) return null;

  switch (type) {
    case 'steam': return <SteamAnimation />;
    case 'flame': return <FlameAnimation />;
    // ...
  }
}
```

#### SteamAnimation（湯気）
- 2〜3本の `motion.div`（w-0.5、高さ20px、opacity 0）
- `y: [0, -20]` + `opacity: [0, 0.5, 0]` を `duration: 2.5` + `repeat: Infinity` + `delay: stagger 0.8s`
- カード内の左下に絶対配置

#### FlameAnimation（炎）
- アイコンに `motion.span` でラップ
- `scale: [1, 1.08, 1]` + `opacity: [0.8, 1, 0.8]` を `duration: 1.5` + `repeat: Infinity`

#### ParticlesAnimation（粒子）
- 3〜4個の `motion.div`（w-1 h-1 rounded-full、アクセント色）
- 各粒子が `y: [20, -20]` + `opacity: [0, 0.7, 0]` を異なる `duration` (2〜3s) + `delay` で実行

#### LeafAnimation（葉）
- アイコンに `motion.span` でラップ
- `rotate: [-4, 4, -4]` を `duration: 2.5` + `repeat: Infinity` + `ease: "easeInOut"`

#### GlowAnimation（光波）
- カード背景に `motion.div`（`radial-gradient` 背景）をオーバーレイ
- `opacity: [0, 0.15, 0]` + `scale: [0.8, 1.2]` を `duration: 3` + `repeat: Infinity`

#### SnowAnimation（雪）
- 6粒の `motion.div`（w-1 h-1 rounded-full 白）を絶対配置
- 各粒子: `y: [-10, card_height + 10]` + `x: random(-5, 5)` を `duration: 3〜5s` + staggered delay + `repeat: Infinity`

#### StarsAnimation（星）
- 5〜7個の `motion.div`（w-1 h-1 rounded-full）をランダム配置
- 各星: `opacity: [1, 0.1, 1]` を異なる `duration` (1〜2.5s) で `repeat: Infinity`

---

## スタイル詳細

### カードコンテナ

```tsx
<button
  style={{ backgroundColor: preset.previewColors.bg }}
  className={`
    relative w-full text-left rounded-xl overflow-hidden
    transition-all duration-200 ease-out
    border-2
    ${isSelected
      ? 'border-white/40 ring-2 ring-white/20'
      : 'border-transparent hover:border-white/20'
    }
  `}
>
```

### テーマ名

```tsx
<span
  style={{ color: preset.previewColors.text }}
  className={`text-2xl leading-tight ${preset.fontStyle}`}
>
  {preset.name}
</span>
```

### 色スウォッチ

```tsx
// bg, surface, accent の3色
{[preset.previewColors.bg, preset.previewColors.surface, preset.previewColors.accent].map((color, i) => (
  <span
    key={i}
    className="w-3.5 h-3.5 rounded-full border"
    style={{
      backgroundColor: color,
      borderColor: `${preset.previewColors.text}30`,
    }}
  />
))}
```

### LIGHT/DARK バッジ

```tsx
<span
  className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border"
  style={{
    color: preset.previewColors.text,
    borderColor: `${preset.previewColors.text}40`,
  }}
>
  {preset.type === 'light' ? 'LIGHT' : 'DARK'}
</span>
```

---

## 実装注意事項

### /frontend-design スキル使用

実装時は `/frontend-design` スキルを呼び出す。
このスキルは「汎用的なAIスロップデザインを避け、独自性のある実装」を指向する。

### パフォーマンス

- アニメーション要素に `will-change: transform` または `will-change: opacity` を付与
- アニメーションは `transform`/`opacity` のみ変更（layout/paint を避ける）

### `prefers-reduced-motion`

```typescript
import { useReducedMotion } from 'framer-motion';

// ThemeAnimation コンポーネント内
const prefersReduced = useReducedMotion();
if (prefersReduced) return null;
```

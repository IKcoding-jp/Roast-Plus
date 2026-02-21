# design.md — Issue #249

## 変更対象ファイル
- `components/coffee-quiz/HelpGuideModal.tsx`

## 現状の構成
```
Modal
├── ヘッダー（オレンジグラデーション）
│   ├── ✕ボタン
│   ├── HelpCircleIcon（アニメーション）
│   └── タイトル「使い方ガイド」
├── コンテンツ（スクロール可能）
│   ├── GuideCard（定着率とは）
│   ├── GuideCard（習得度について）
│   ├── GuideCard（レベルと経験値）
│   └── GuideCard（学習モード）
└── フッター（「わかった」ボタン）
```

## 新デザイン構成

```
Modal (max-w-sm, bg-overlay)
├── ✕ボタン（右上、bg-surface/80）
│
├── ステップコンテンツ（AnimatePresence）
│   ├── 大アイコンエリア（64px、bg-spot/10 円形背景）
│   ├── ラベルチップ（e.g. "定着率"）
│   ├── タイトル（font-bold, text-ink）
│   ├── 説明テキスト（text-ink-sub, text-sm）
│   └── ミニビジュアル（オプション）
│
├── ドットインジケーター
│   └── ● ○ ○ ○（activeは bg-spot, 非activeは bg-edge）
│
└── ナビゲーション
    ├── ← 前へボタン（ステップ1では非表示）
    └── 次へ → / 「はじめる」（最終ステップのみ）
```

## ステップデータ定義
```typescript
const STEPS = [
  {
    icon: '🎯',
    label: '定着率',
    title: '記憶がどれだけ定着しているか',
    description: '各問題の記憶定着度をパーセンテージで表します。正解するほど上がり、67%以上で「定着済み」に。全75問を定着済みにしよう！',
    visual: <RetentionGauge />  // ミニプログレスバー(67%)
  },
  {
    icon: '⭐',
    label: '習得度',
    title: '正解した問題がわかる',
    description: '一度でも正解すると「正解済み」カウント。定着率67%以上でマスターラベルが付きます。全75問の正解を目指そう！',
    visual: <MasteryBadge />  // バッジ表現
  },
  {
    icon: '📈',
    label: 'レベルとXP',
    title: 'クイズでXPを獲得してレベルアップ',
    description: 'クイズに答えるたびにXP（経験値）獲得。正解すればするほど多くのXPがもらえます。レベルが上がるほど達成感UP！',
    visual: <XPBar />  // XPプログレスバー
  },
  {
    icon: '📚',
    label: '学習モード',
    title: '3つのモードで効率的に学習',
    description: '「今日のクイズ」はランダム出題、「復習」は忘れかけを重点出題、「カテゴリ別」は好きな分野を集中学習できます。',
    visual: <ModeIcons />  // 3アイコン列
  },
] as const;
```

## アニメーション仕様
```typescript
// ステップ切り替え
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// アイコン
const iconVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
};
```

## CSS変数マッピング
| 用途 | 変数 |
|------|------|
| モーダル背景 | `bg-overlay` |
| アイコン背景 | `bg-spot/10` |
| アクティブドット | `bg-spot` |
| 非アクティブドット | `bg-edge` |
| タイトル | `text-ink` |
| 説明 | `text-ink-sub` |
| チップ背景 | `bg-spot-subtle` |
| チップテキスト | `text-spot` |

## 既存コード削除対象
- `GuideCard` コンポーネント（全削除）
- `HelpCircleIcon`（64px版に置換）
- オレンジグラデーション背景（`from-spot via-spot-hover to-spot`）
- スクロールコンテナ（`overflow-y-auto`）

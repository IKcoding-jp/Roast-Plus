# 設計書

## 実装方針

### 変更対象ファイル
- `components/RoastTimer.tsx` - メインレイアウト（flex-col → md:flex-row）、panelVariants分岐
- `components/roast-timer/TimerDisplay.tsx` - リングサイズのレスポンシブ化
- `components/roast-timer/SetupPanel.tsx` - 右パネル用スタイル追加
- `components/roast-timer/TimerControls.tsx` - 右パネル用スタイル追加

### 新規作成ファイル
- `hooks/useMediaQuery.ts` - window.matchMediaベースのレスポンシブフック

## UI設計

### レイアウト構造（768px以上）

```
┌─ ヘッダー（現行維持）─────────────────────┐
│ [FloatingNav]                    [⚙ 設定] │
├──────────────┬─────────────────────────────┤
│              │                             │
│  左パネル    │  右パネル                   │
│  flex: 1     │  flex: 1                   │
│  border-r    │                             │
│              │  ステート別コントロール     │
│  TimerDisplay│  (AnimatePresence)          │
│  85%, max340 │                             │
│              │                             │
└──────────────┴─────────────────────────────┘
```

### アニメーション分岐

```typescript
// useMediaQuery で画面幅を検知
const isDesktop = useMediaQuery('(min-width: 768px)');

// variants を分岐
const panelVariants = isDesktop
  ? {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
    }
  : {
      // 現行のスマホ用variants（y: 10 / y: -10, duration: 0.25）
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
    };
```

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui`）— 既存のButton使用を維持
- [x] テーマ対応: セマンティックCSS変数使用（`var(--edge)`, `var(--ink)` 等）
- [x] ハードコード色の禁止 — 全色CSS変数で対応済み

## ADR

### Decision-001: ブレークポイントは768px（md）
- **理由**: iPadの最小幅（縦持ち768px）でも左右分割が成立する。ユーザーは横画面使用がメインなので、縦画面時の最適化は低優先
- **影響**: iPad縦画面でやや窮屈になる可能性があるが、致命的な崩れでなければ許容

### Decision-002: アニメーションはuseMediaQueryで分岐
- **理由**: Framer MotionのvariantsはJS値のため、TailwindのCSSブレークポイントでは制御不可
- **影響**: `hooks/useMediaQuery.ts` の新規ファイル追加が必要

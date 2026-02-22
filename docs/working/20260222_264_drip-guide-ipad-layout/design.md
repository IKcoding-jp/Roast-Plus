# 設計書 — Issue #264

## 変更対象ファイル一覧

| ファイル | 変更種別 | 内容 |
|--------|--------|-----|
| `components/drip-guide/runner/StepListSidebar.tsx` | **新規作成** | iPad用ステップリストサイドバー |
| `components/drip-guide/DripGuideRunner.tsx` | 修正 | md:ブレイクポイントで2カラム切り替え |
| `components/drip-guide/runner/RunnerHeader.tsx` | 修正 | md:時にタイマー・プログレス表示 |
| `components/drip-guide/runner/TimerDisplay.tsx` | 修正 | md:で非表示 |
| `components/drip-guide/runner/StepInfo.tsx` | 修正 | md:でmax-w-md解除 |
| `components/drip-guide/runner/FooterControls.tsx` | 修正 | md:でボタンサイズ縮小 |

## コンポーネント設計

### StepListSidebar.tsx（新規）

```tsx
interface StepListSidebarProps {
  steps: DripStep[];
  currentStepIndex: number;
}
```

**表示仕様:**
- 幅: 220px固定、border-r で右側と区切り
- 各行の構成:
  - 状態アイコン（15px丸）: 完了=`CheckCircle spot/50`、現在=`bg-spot 白丸`、未来=`border-edge-strong 空丸`
  - ステップ名（11px、現在=spot色、完了=取り消し線）
  - 時刻・水量（9px tabular-nums）: `00:45・60g`
- 現在行: `bg-spot/10 border border-spot/20 rounded-xl`
- スクロール可能（overflow-y-auto）

### RunnerHeader.tsx（修正）

**既存props（変更なし）:**
```tsx
interface RunnerHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
}
```

**追加props（iPad用）:**
```tsx
  currentTime?: number;
  totalDurationSec?: number;
  recipeName?: string;
```

**レイアウト変更:**
```tsx
// モバイル時（既存）
<div className="flex-none flex items-center justify-between px-5 pt-4 pb-1">
  <BackButton />
  <StepCounter />
</div>

// iPad時（md:）
<div className="... md:bg-surface/80 md:border-b md:border-edge md:px-5 md:py-3">
  <BackButton />
  <Timer text-[3rem] />  {/* md:block hidden */}
  <ProgressBar flex-1 />  {/* md:flex hidden */}
  <StepCounter />
</div>
```

### DripGuideRunner.tsx（修正）

**レイアウト構造:**
```tsx
<div className="flex flex-col h-[100dvh] bg-ground relative overflow-hidden">
  {/* ヘッダー: iPad時はタイマーも含む */}
  <RunnerHeader
    currentStepIndex={currentStepIndex}
    totalSteps={steps.length}
    currentTime={currentTime}        // 追加
    totalDurationSec={recipe.totalDurationSec}  // 追加
    recipeName={recipe.name}         // 追加
  />

  {/* メインエリア: md:で横並び */}
  <div className="flex-1 flex flex-col md:flex-row min-h-0">
    {/* iPad専用: 左サイドバー */}
    <div className="hidden md:block flex-none">
      <StepListSidebar
        steps={steps}
        currentStepIndex={currentStepIndex}
      />
    </div>

    {/* 既存のコンテンツエリア */}
    <div className="flex-1 flex flex-col items-center justify-center px-5 pb-3 overflow-y-auto">
      <TimerDisplay ... />  {/* 内部で md:hidden */}
      <StepInfo ... />       {/* 内部で max-w-md → md:max-w-none */}
    </div>
  </div>

  {/* フッター: md:でボタン縮小 */}
  <FooterControls ... />
</div>
```

## 参照ファイル

- デザインモック: `app/dev/design-lab/components/mockups/IpadLayoutB1.tsx`
- デザインドキュメント: `docs/plans/2026-02-22-drip-guide-ipad-layout-design.md`

## 実装上の注意点

1. **`h-[100dvh]`の維持**: iPad横向きでもビューポート高さを使い切る設計を維持
2. **`overflow-hidden`の扱い**: サイドバーのスクロールとメインの`overflow-hidden`が干渉しないよう`min-h-0`を忘れない
3. **Framer Motion**: `StepInfo`内の`AnimatePresence`はiPad時も同様に動作する（変更不要）
4. **音声カウントダウン**: レイアウト変更による影響なし（ロジック変更なし）

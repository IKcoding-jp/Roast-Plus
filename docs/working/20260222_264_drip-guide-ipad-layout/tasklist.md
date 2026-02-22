# タスクリスト — Issue #264

## フェーズ1: 新規コンポーネント作成

- [ ] **1-1** `StepListSidebar.tsx` を新規作成
  - `components/drip-guide/runner/StepListSidebar.tsx`
  - Props: `steps: DripStep[]`, `currentStepIndex: number`
  - 各ステップ行: 状態アイコン（CheckCircle/現在●/空丸）+ ステップ名 + `formatTime(startTimeSec)・Xg`
  - スタイル: `w-[220px] flex-none border-r border-edge bg-surface/20 overflow-y-auto`
  - 現在ステップ: `bg-spot/10 border border-spot/20`

## フェーズ2: 既存コンポーネント修正

- [ ] **2-1** `RunnerHeader.tsx` にタイマーpropsを追加
  - 追加props: `currentTime?: number`, `totalDurationSec?: number`, `recipeName?: string`
  - iPad（md:）時: `← | [タイマー3rem] [プログレスバー flex-1] レシピ名 | Step X/N`
  - モバイル時: 既存のまま（`←` と `Step X/N` のみ）

- [ ] **2-2** `TimerDisplay.tsx` に `md:hidden` を追加
  - 外側の `div` に `md:hidden` を付与（iPad時は非表示）
  - モバイル表示は変更なし

- [ ] **2-3** `StepInfo.tsx` の `max-w-md` を iPad時解除
  - `className="w-full max-w-md flex-shrink-0"` → `"w-full max-w-md md:max-w-none flex-shrink-0"`

- [ ] **2-4** `FooterControls.tsx` のボタンサイズをiPad時縮小
  - オートモード再生ボタン: `w-20 h-20` → `w-20 h-20 md:w-16 md:h-16`
  - オートモードアイコンサイズ: `size={36}` → `size={28}` (md:クラスで対応)
  - マニュアルモードも同様に縮小

## フェーズ3: DripGuideRunner メインレイアウト

- [ ] **3-1** `DripGuideRunner.tsx` のレイアウトを更新
  - 外側wrapper: `flex flex-col h-[100dvh]` → `flex flex-col h-[100dvh] md:flex-row md:flex-wrap` ← ※要検討
  - より具体的なアプローチ:
    ```tsx
    // 現在
    <div className="flex flex-col h-[100dvh] bg-ground">
      <RunnerHeader ... />
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-3">
        <TimerDisplay ... />
        <StepInfo ... />
      </div>
      <FooterControls ... />
    </div>

    // iPad対応後
    <div className="flex flex-col h-[100dvh] bg-ground">
      <RunnerHeader currentTime={currentTime} totalDurationSec={...} recipeName={...} />
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* iPad: 左サイドバー */}
        <div className="hidden md:block">
          <StepListSidebar steps={steps} currentStepIndex={currentStepIndex} />
        </div>
        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-3 overflow-y-auto">
          <TimerDisplay ... />  {/* md:hiddenはTimerDisplay内で付与 */}
          <StepInfo ... />
        </div>
      </div>
      <FooterControls ... />
    </div>
    ```

- [ ] **3-2** `RunnerHeader.tsx` への新しいprops渡し

## フェーズ4: マニュアルモード対応

- [ ] **4-1** マニュアルモードでもサイドバー・ヘッダーが正常動作することを確認
  - `isManualMode=true` 時: タイマーヘッダーは表示（ただし currentTime は0固定でOK）
  - FooterControls のマニュアルモードボタン（前へ/次へ/完了）も同サイズ縮小

## フェーズ5: 検証

- [ ] **5-1** `npm run lint && npm run build && npm run test:run` で全通過確認
- [ ] **5-2** 開発サーバーでiPadビューポート（768x1024）で目視確認
- [ ] **5-3** モバイルビューポート（375x812）で既存表示が崩れていないことを確認

## 依存関係

```
1-1 → 3-1
2-1 → 3-2
2-2, 2-3, 2-4 は並行可能
フェーズ4はフェーズ3完了後
フェーズ5はすべて完了後
```

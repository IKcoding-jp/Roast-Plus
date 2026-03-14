# タスクリスト

## フェーズ1: 基盤（useMediaQueryフック）
- [ ] `hooks/useMediaQuery.ts` 新規作成
  - [ ] `window.matchMedia` ベースの軽量フック実装
  - [ ] SSR対応（初期値false、useEffect内でmatchMedia実行）
  - [ ] ユニットテスト作成

## フェーズ2: メインレイアウト変更
- [ ] `components/RoastTimer.tsx` レスポンシブ化
  - [ ] `flex-col` → `flex-col md:flex-row` に変更
  - [ ] 左パネル（50%）: タイマーリング領域
  - [ ] 右パネル（50%）: コントロール領域（`md:flex-1 md:h-auto` で高さ固定解除）
  - [ ] パネル境界線追加（`md:border-r md:border-[var(--edge)]`）
  - [ ] Framer Motion panelVariantsをuseMediaQueryで分岐

## フェーズ3: コンポーネント個別調整
- [ ] `components/roast-timer/TimerDisplay.tsx`
  - [ ] リングコンテナを `md:w-[85%] md:max-w-[340px] md:h-auto md:aspect-square` に変更
  - [ ] 時間テキスト `text-[64px] md:text-[72px]`
  - [ ] ラベルテキスト `text-[10px] md:text-[13px]`
- [ ] `components/roast-timer/SetupPanel.tsx`
  - [ ] 右パネル用パディング追加（`md:px-10 md:py-8`）
  - [ ] 縦方向中央揃え（`md:justify-center`）
- [ ] `components/roast-timer/TimerControls.tsx`
  - [ ] 右パネル用パディング追加
  - [ ] 縦方向中央揃え

## フェーズ4: 検証
- [ ] `npm run build && npm run test:run` 通過確認
- [ ] Playwright MCPでスクリーンショット検証
  - [ ] iPad横画面（1024×768）: 3ステート
  - [ ] iPad縦画面（768×1024）: 崩れなし確認
  - [ ] スマホ（375×667）: 現行維持確認

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3 → フェーズ4（順次実行）

## 見積もり
- フェーズ1: 約5分（フック1つ + テスト）
- フェーズ2: 約10分（メインレイアウト + アニメーション分岐）
- フェーズ3: 約10分（3コンポーネント調整）
- フェーズ4: 約5分（ビルド + テスト + スクリーンショット）
- **合計**: 約30分

# タスクリスト

## フェーズ1: 準備・フォント・不要コード削除
- [ ] Fraunces フォント追加
  - [ ] `next/font/google` でFraunces設定（opsz, wght: 300/400/600）
  - [ ] Tailwind CSS変数にフォントファミリー登録
- [ ] 不要コンポーネント削除
  - [ ] `components/roast-timer/ModeSelectView.tsx` 削除
  - [ ] `components/roast-timer/RecommendedModeView.tsx` 削除
  - [ ] `components/roast-timer/TimerHeader.tsx` 削除
  - [ ] `components/roast-timer/index.ts` からexport削除
- [ ] 削除後ビルド確認（`npm run build`）

## フェーズ2: リング（TimerDisplay）リデザイン
- [ ] TimerDisplay: 常時表示構造に変更
  - [ ] idle状態でもリング表示（進捗0%、track色のみ）
  - [ ] ティックマーク60本のSVG生成ロジック実装
  - [ ] Fraunces フォントで時間表示（64px, weight:300）
  - [ ] ステート別リング色: `--edge-strong` / `--spot` / `--success`
  - [ ] ステートインジケータードット追加
  - [ ] 「焙煎時間」「残り時間」「完了」ラベル切替
- [ ] ハードコード色を全てCSS変数に置換

## フェーズ3: SetupPanel簡略化（重量カード）
- [ ] SetupPanel: 重量カード3択のみに再構成
  - [ ] WeightCardコンポーネント: 重さ(Fraunces) + セパレーター + 時間表示
  - [ ] 選択状態: `--spot` border + `--spot-surface` background
  - [ ] カード選択 → 親へ duration/weight 通知
  - [ ] 不要なstate/effect削除（inputMode, recommendedMode, availableBeans等）

## フェーズ4: RoastTimer 1画面構造化
- [ ] RoastTimer: 画面構造変更
  - [ ] リングセクション: `flex:1` で中央配置（全ステートで固定位置）
  - [ ] 下部パネル: `flex-shrink:0; height:230px` で固定
  - [ ] idle/running/completedでパネル内コンテンツ切替（`opacity + translateY` アニメーション）
- [ ] TimerControls: 下部パネル配置
  - [ ] running: 一時停止(primary) + スキップ(secondary)
  - [ ] completed: リセットボタン
  - [ ] ボタン縦位置の統一
- [ ] ヘッダー: FloatingNav + 設定ボタン（pill型）に変更
- [ ] page.tsx: レイアウト調整

## フェーズ5: running/completed パネル詳細
- [ ] running パネル
  - [ ] 経過バー（elapsed / total + プログレストラック）
  - [ ] 情報バッジ（重さ + 設定時間）
- [ ] completed パネル
  - [ ] 「焙煎室に戻るタイミングです」メッセージ
  - [ ] 重さ・焙煎時間の統計表示

## フェーズ6: テスト・検証
- [ ] 既存テスト修正（削除コンポーネントのテスト削除/更新）
- [ ] 重量カード選択のテスト追加
- [ ] ステート遷移のテスト追加
- [ ] `npm run build && npm run test:run` 通過確認

## 依存関係
- フェーズ1 → フェーズ2, 3（並行可能）→ フェーズ4 → フェーズ5 → フェーズ6

## 見積もり
- フェーズ1: 5分
- フェーズ2: 15分
- フェーズ3: 10分
- フェーズ4: 20分
- フェーズ5: 10分
- フェーズ6: 15分
- **合計**: 約75分（AIエージェント実行時間）

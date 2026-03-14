# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-03-14

## フェーズ1: 準備・不要コード削除
- [x] ~~Fraunces フォント追加~~ → スキップ（Noto Sans JPで統一）
- [x] 不要コンポーネント削除
  - [x] `components/roast-timer/ModeSelectView.tsx` 削除
  - [x] `components/roast-timer/RecommendedModeView.tsx` 削除
  - [x] `components/roast-timer/TimerHeader.tsx` 削除
  - [x] `components/roast-timer/index.ts` からexport削除

## フェーズ2: リング（TimerDisplay）リデザイン
- [x] TimerDisplay: 常時表示構造に変更
  - [x] idle状態でもリング表示（進捗0%、track色のみ）
  - [x] ティックマーク60本のSVG生成ロジック実装
  - [x] 時間表示（64px, weight:300）
  - [x] ステート別リング色: `--edge-strong` / `--spot` / `--success`
  - [x] ステートインジケータードット追加
  - [x] 「焙煎時間」「残り時間」「完了」ラベル切替
- [x] ハードコード色を全てCSS変数に置換

## フェーズ3: SetupPanel簡略化（重量カード）
- [x] SetupPanel: 重量カード3択のみに再構成
  - [x] WeightCard: 重さ + セパレーター + 時間表示
  - [x] 選択状態: `--spot` border + `--spot-surface` background
  - [x] カード選択 → 親へ duration/weight 通知
  - [x] 不要なstate/effect削除

## フェーズ4: RoastTimer 1画面構造化
- [x] RoastTimer: 画面構造変更
  - [x] リングセクション: `flex:1` で中央配置（全ステートで固定位置）
  - [x] 下部パネル: `flex-shrink:0; height:230px` で固定
  - [x] idle/running/completedでパネル内コンテンツ切替（Framer Motionアニメーション）
- [x] TimerControls: 下部パネル配置
  - [x] running: 一時停止(primary) + スキップ(secondary)
  - [x] completed: リセットボタン
- [x] ヘッダー: FloatingNav + 設定ボタン（pill型）に変更
- [x] page.tsx: レイアウト調整

## フェーズ5: running/completed パネル詳細
- [x] running パネル: 経過バー + 情報バッジ
- [x] completed パネル: 完了メッセージ + 統計表示

## フェーズ6: テスト・検証
- [x] `npm run build` 通過
- [x] `npm run test:run` 全1171テスト通過

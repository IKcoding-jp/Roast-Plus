# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-03-15

## フェーズ1: 型定義の修正
- [x] `types/timer.ts` から `RoastTimerDialogState` 型を削除
- [x] `types/timer.ts` の `RoastTimerState` から `dialogState` プロパティを削除

## フェーズ2: フック・コンポーネントの削除・修正
- [x] `hooks/useRoastTimerDialogs.ts` をファイルごと削除
- [x] `components/RoastTimerDialogs.tsx` をファイルごと削除
- [x] `hooks/roast-timer/useTimerUpdater.ts` の `completeTimer` から `dialogState: 'completion'` を削除
- [x] `components/RoastTimer.tsx` からダイアログ関連のimport・フック呼び出し・描画を削除

## フェーズ3: テストの更新
- [x] テストファイルにダイアログ関連の参照なし（更新不要）

## フェーズ4: 検証
- [x] `npm run build && npm run test:run` で全テスト合格を確認（1176テスト）

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3 → フェーズ4（順次実行）

## 見積もり
- フェーズ1: 2分
- フェーズ2: 5分
- フェーズ3: 3分
- フェーズ4: 5分
- **合計**: 約15分

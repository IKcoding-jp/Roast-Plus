# タスクリスト

## フェーズ1: 型定義の修正
- [ ] `types/timer.ts` から `RoastTimerDialogState` 型を削除
- [ ] `types/timer.ts` の `RoastTimerState` から `dialogState` プロパティを削除

## フェーズ2: フック・コンポーネントの削除・修正
- [ ] `hooks/useRoastTimerDialogs.ts` をファイルごと削除
- [ ] `components/RoastTimerDialogs.tsx` をファイルごと削除
- [ ] `hooks/roast-timer/useTimerUpdater.ts` の `completeTimer` から `dialogState: 'completion'` を削除
- [ ] `components/RoastTimer.tsx` からダイアログ関連のimport・フック呼び出し・描画を削除

## フェーズ3: テストの更新
- [ ] `hooks/useRoastTimer.test.ts` のダイアログ関連テスト・モックを削除（該当箇所がある場合）
- [ ] 他のテストファイルで `dialogState` を参照している箇所を修正

## フェーズ4: 検証
- [ ] `npm run build && npm run test:run` で全テスト合格を確認
- [ ] `npm run deadcode` でダイアログ関連のデッドコードがないことを確認

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3 → フェーズ4（順次実行）

## 見積もり
- フェーズ1: 2分
- フェーズ2: 5分
- フェーズ3: 3分
- フェーズ4: 5分
- **合計**: 約15分

# タスクリスト

## フェーズ1: 型定義・データ層の変更
- [ ] `types/timer.ts`: `RoastTimerSettings`から`goToRoastRoomTimeSeconds`を削除
- [ ] `lib/roastTimerSettings.ts`: `DEFAULT_SETTINGS`から該当フィールドを削除
- [ ] `lib/firestore/common.ts`: `normalizeAppData`の正規化処理から該当フィールドを削除
- [ ] `lib/localStorage.ts`: 既存データ読み込み時に古いフィールドを無視する確認

## フェーズ2: ロジック削除
- [ ] `lib/roastTimerUtils.ts`: `calculateRecommendedTime`関数を削除
- [ ] `calculateRecommendedTime`の呼び出し箇所を特定し削除
  - ローストタイマーページ内での推奨時間表示UIを削除

## フェーズ3: UI削除
- [ ] `components/RoastTimerSettings.tsx`: NumberInput（焙煎室に行くまでの時間）と説明文を削除

## フェーズ4: テスト修正
- [ ] `lib/roastTimerUtils.test.ts`: `calculateRecommendedTime`関連テストを削除
- [ ] `lib/roastTimerSettings.test.ts`: `goToRoastRoomTimeSeconds`参照テストを修正
- [ ] `lib/firestore/common.test.ts`: 正規化テストから該当フィールドを削除

## フェーズ5: 検証
- [ ] `npm run build && npm run test:run` 通過確認
- [ ] 既存データの後方互換確認（古いフィールドが残っていてもエラーにならない）

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（型→ロジック→UIの順で削除）
- フェーズ4はフェーズ1-3と並行可能
- フェーズ5はフェーズ1-4完了後

## 見積もり
- フェーズ1: 5分
- フェーズ2: 5分
- フェーズ3: 3分
- フェーズ4: 10分
- フェーズ5: 5分
- **合計**: 約30分

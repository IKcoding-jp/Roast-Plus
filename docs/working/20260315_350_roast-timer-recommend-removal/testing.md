# テスト計画

## テスト戦略

### 削除対象テスト

以下のテストケースを削除または修正する:

#### `lib/roastTimerUtils.test.ts` — 削除対象
- `calculateRecommendedTime`関連テスト全件（約6件）
  - 正常系: 平均時間からの減算
  - `goToRoastRoomTimeSeconds`が異なる場合
  - 計算結果が60秒未満の場合の調整
  - レコードなしの場合のnull返却

#### `lib/roastTimerSettings.test.ts` — 修正対象
- デフォルト設定の検証テスト: `goToRoastRoomTimeSeconds: 60`の期待値を削除
- 設定の読み込み/保存テスト: 該当フィールドの検証を削除
- マイグレーションテスト: 該当フィールドの検証を削除

#### `lib/firestore/common.test.ts` — 修正対象
- `normalizeAppData`テスト: `goToRoastRoomTimeSeconds`の正規化検証を削除

### 追加テスト（必要に応じて）

後方互換テスト:
- 古い形式のLocalStorageデータ（`goToRoastRoomTimeSeconds`を含む）を読み込んでもエラーにならないことを確認

## カバレッジ目標
- lib/: 90%以上（削除によるカバレッジ低下がないことを確認）
- 全体: 75%以上

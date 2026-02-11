# テスト計画

## テスト戦略

全ファイルが純粋関数中心のため、外部依存のモックは最小限。主なモック対象:

### モック方針
| ファイル | モック対象 | 方法 |
|---------|-----------|------|
| streak.ts | `debug.ts`のisDebugMode/getDebugTodayDateString | `vi.mock('./debug')` |
| badge.ts | `debug.ts`のgetCurrentDate | `vi.mock('./debug')` |
| daily-goal.ts | `streak.ts`のgetTodayDateString | `vi.mock('./streak')` |
| stats.ts | `streak.ts`のgetTodayDateString | `vi.mock('./streak')` |
| firestore/common.ts | `firebase`モジュール | `vi.mock('../firebase')` |

### ファイル別テストケース

#### `lib/coffee-quiz/xp.test.ts`
- 正解時の基本XP（10 * 難易度倍率）
- 不正解時の基本XP（2）
- 難易度ごとの倍率（beginner:1.0, intermediate:1.5, advanced:2.0）
- 速度ボーナス（5秒以内:+5, 10秒以内:+2, 10秒超:0）
- 速度ボーナスは不正解時は無効
- 初回ボーナス（正解かつ初回: +5）
- ストリーク倍率（連続正解ごとに+10%、最大2倍）
- 複合条件の計算検証

#### `lib/coffee-quiz/level.test.ts`
- calculateXPForNextLevel: レベル1〜数レベルの必要XP、maxLevelでInfinity
- calculateLevelFromTotalXP: XP 0→レベル1、十分なXP→正しいレベル、端数処理
- addXP: レベルアップしない場合、レベルアップする場合、複数レベルアップ
- createInitialLevelInfo: 初期値の確認

#### `lib/coffee-quiz/streak.test.ts`
- getTodayDateString: YYYY-MM-DD形式（vi.useFakeTimersでテスト）
- getDaysDifference: 同日→0、1日差→1、複数日差
- updateStreak: 初回→streak 1、連続→+1、同日→変更なし、2日以上空き→リセット
- isStreakAtRisk: 未活動→false、今日活動済み→false、昨日のみ→true、2日前→false
- createInitialStreakInfo: 初期値確認

#### `lib/coffee-quiz/badge.test.ts`
- checkNewBadges: ストリーク系（3,7,30,100）各閾値
- 正解数系（10,50,100,500）各閾値
- カテゴリマスタリー（basics,roasting,brewing,history）各20問
- パーフェクトセッション（10問以上全問正解）
- first-quiz（1問以上）
- speed-demon（10問全問正解かつ2分以内）
- 時間帯バッジ（early-bird: 6時前、night-owl: 0-5時）
- 既に獲得済みのバッジは重複しない
- earnBadges: 新バッジが追加される、既存は保持

#### `lib/coffee-quiz/daily-goal.test.ts`
- updateDailyGoal: 新しいゴール作成、既存ゴール更新、7日超のデータ削除
- getTodayGoal: 今日のゴール取得、存在しない場合null
- getDailyGoalProgress: 0問→0%、目標達成→100%、超過→100%

#### `lib/coffee-quiz/stats.test.ts`
- updateStats: 基本統計（totalQuestions, totalCorrect, totalIncorrect）
- 正解率計算（averageAccuracy）
- カテゴリ統計更新
- 難易度統計更新
- 週間アクティビティ（今日のエントリ更新、新規作成、7日超削除）

#### `lib/roastTimerUtils.test.ts`
- calculateRecommendedTime: 一致レコード2件以上→平均計算、2件未満→null、60秒未満→60秒に調整
- formatTime: 0秒→"00:00"、65秒→"01:05"、3600秒→"60:00"
- formatTimeAsMinutes: 60秒→"1分"、90秒→"2分"（四捨五入）
- formatTimeAsMinutesAndSeconds: 0秒→"0秒"、60秒→"1分"、90秒→"1分30秒"

#### `lib/tastingUtils.test.ts`
- calculateAverageScores: 空配列→全0、1件→そのまま、複数件→平均
- getRecordsBySessionId: 指定IDのレコード抽出
- getRecordCountBySessionId: レコード数カウント

#### `lib/firestore/workProgress/helpers.test.ts`
- extractTargetAmount: "10kg"→10、"5個"→5、"10.5kg"→10.5、undefined→undefined、不正値→undefined
- extractUnitFromWeight: "10kg"→数値部分、undefined→""
- findWorkProgressOrThrow: 存在→返す、存在しない→Error
- resolveStatusTransition: 各ステータス遷移パターン（pending→in_progress、pending→completed等）
- recalculateFromHistory: 進捗量モード/完成数モードの再計算

#### `lib/drip-guide/formatTime.test.ts`
- 0秒→"00:00"、65秒→"01:05"

#### `lib/drip-guide/recipeCalculator.test.ts`
- 1人前→元レシピそのまま
- 2人前→豆・湯量2倍、各ステップの目標湯量2倍
- targetTotalWater未定義のステップ→undefinedのまま

#### `lib/drip-guide/recipe46.test.ts`
- basic/sweet/bright × light/strong2/strong3 の9パターン
- 各パターンで総湯量がbeanAmount*15であること
- ステップ合計が総湯量に一致
- 味調整パートが40%、濃度調整パートが60%

#### `lib/utils.test.ts`
- convertToHalfWidth: "１２３"→"123"、混在文字列、半角のみ→変化なし
- removeNonNumeric: "abc123"→"123"、"１２３"→""（全角は残らない）

#### `lib/firestore/common.test.ts`
- removeUndefinedFields: undefined削除、ネスト、配列内のundefined、null保持
- normalizeAppData: null→defaultData、部分的データ→補完、roastScheduleのdate補完

## カバレッジ目標
- 各テストファイル: ステートメント80%以上
- lib/coffee-quiz/全体: 95%以上
- lib/drip-guide/: 90%以上

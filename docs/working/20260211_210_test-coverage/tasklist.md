# タスクリスト

## フェーズ1: 改善前計測
- [ ] 現在のカバレッジを記録（ベースライン）

## フェーズ2: Tier 1 テスト追加（coffee-quiz系）
- [ ] `lib/coffee-quiz/xp.test.ts` - calculateXP（難易度/速度/ストリーク倍率）
- [ ] `lib/coffee-quiz/level.test.ts` - calculateXPForNextLevel, calculateLevelFromTotalXP, addXP, createInitialLevelInfo
- [ ] `lib/coffee-quiz/streak.test.ts` - getTodayDateString, getDaysDifference, updateStreak, isStreakAtRisk, createInitialStreakInfo
- [ ] `lib/coffee-quiz/badge.test.ts` - checkNewBadges, earnBadges（全バッジ条件）
- [ ] `lib/coffee-quiz/daily-goal.test.ts` - updateDailyGoal, getTodayGoal, getDailyGoalProgress
- [ ] `lib/coffee-quiz/stats.test.ts` - updateStats（カテゴリ/難易度/週間アクティビティ更新）

## フェーズ3: Tier 1 テスト追加（その他）
- [ ] `lib/roastTimerUtils.test.ts` - calculateRecommendedTime, formatTime, formatTimeAsMinutes, formatTimeAsMinutesAndSeconds
- [ ] `lib/tastingUtils.test.ts` - calculateAverageScores, getRecordsBySessionId, getRecordCountBySessionId
- [ ] `lib/firestore/workProgress/helpers.test.ts` - extractTargetAmount, extractUnitFromWeight, findWorkProgressOrThrow, resolveStatusTransition, recalculateFromHistory

## フェーズ4: Tier 2 テスト追加
- [ ] `lib/drip-guide/formatTime.test.ts` - formatTime
- [ ] `lib/drip-guide/recipeCalculator.test.ts` - calculateRecipeForServings
- [ ] `lib/drip-guide/recipe46.test.ts` - generateRecipe46（味/濃度組み合わせ）
- [ ] `lib/utils.test.ts` - convertToHalfWidth, removeNonNumeric
- [ ] `lib/firestore/common.test.ts` - removeUndefinedFields, normalizeAppData

## フェーズ5: 改善後計測・レポート
- [ ] カバレッジ再計測
- [ ] 改善率レポート作成

## 依存関係
- フェーズ1 → フェーズ2〜4（並列可） → フェーズ5
- フェーズ2内: streak → daily-goal, stats, badge（streakの`getTodayDateString`を使用するため先にモック理解が必要）

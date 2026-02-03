// デイリーゴール管理ロジック
import type { DailyGoal } from './types';
import { getTodayDateString } from './streak';

/**
 * デイリーゴールを更新
 */
export function updateDailyGoal(
  dailyGoals: DailyGoal[],
  isCorrect: boolean,
  xpEarned: number,
  targetQuestions: number
): DailyGoal[] {
  const today = getTodayDateString();

  // 今日のゴールを探す
  const todayIndex = dailyGoals.findIndex((g) => g.date === today);

  if (todayIndex >= 0) {
    // 既存のゴールを更新
    const updated = [...dailyGoals];
    updated[todayIndex] = {
      ...updated[todayIndex],
      completedQuestions: updated[todayIndex].completedQuestions + 1,
      correctAnswers: updated[todayIndex].correctAnswers + (isCorrect ? 1 : 0),
      xpEarned: updated[todayIndex].xpEarned + xpEarned,
    };
    return updated;
  }

  // 新しいゴールを作成
  const newGoal: DailyGoal = {
    date: today,
    targetQuestions,
    completedQuestions: 1,
    correctAnswers: isCorrect ? 1 : 0,
    xpEarned,
  };

  // 最新7日間のみ保持
  const recentGoals = dailyGoals.slice(-6);
  return [...recentGoals, newGoal];
}

/**
 * 今日のデイリーゴールを取得
 */
export function getTodayGoal(dailyGoals: DailyGoal[]): DailyGoal | null {
  const today = getTodayDateString();
  return dailyGoals.find((g) => g.date === today) || null;
}

/**
 * デイリーゴール達成率を計算
 */
export function getDailyGoalProgress(goal: DailyGoal | null): number {
  if (!goal) return 0;
  return Math.min(100, (goal.completedQuestions / goal.targetQuestions) * 100);
}

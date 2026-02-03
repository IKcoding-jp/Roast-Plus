// 統計更新ロジック
import type { QuizStats, QuizCategory, QuizDifficulty } from './types';
import { getTodayDateString } from './streak';

/**
 * 統計を更新
 */
export function updateStats(
  stats: QuizStats,
  isCorrect: boolean,
  category: QuizCategory,
  difficulty: QuizDifficulty,
  isMastered: boolean
): QuizStats {
  const today = getTodayDateString();

  // 基本統計
  const newStats: QuizStats = {
    ...stats,
    totalQuestions: stats.totalQuestions + 1,
    totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
    totalIncorrect: stats.totalIncorrect + (isCorrect ? 0 : 1),
    averageAccuracy: 0, // 後で計算
    categoryStats: { ...stats.categoryStats },
    difficultyStats: { ...stats.difficultyStats },
    weeklyActivity: [...stats.weeklyActivity],
  };

  // 正解率を計算
  newStats.averageAccuracy =
    newStats.totalQuestions > 0
      ? Math.round((newStats.totalCorrect / newStats.totalQuestions) * 100)
      : 0;

  // カテゴリ統計
  const catStat = newStats.categoryStats[category];
  newStats.categoryStats[category] = {
    total: catStat.total + 1,
    correct: catStat.correct + (isCorrect ? 1 : 0),
    accuracy:
      catStat.total + 1 > 0
        ? Math.round(((catStat.correct + (isCorrect ? 1 : 0)) / (catStat.total + 1)) * 100)
        : 0,
    masteredCount: catStat.masteredCount + (isMastered ? 1 : 0),
  };

  // 難易度統計
  const diffStat = newStats.difficultyStats[difficulty];
  newStats.difficultyStats[difficulty] = {
    total: diffStat.total + 1,
    correct: diffStat.correct + (isCorrect ? 1 : 0),
    accuracy:
      diffStat.total + 1 > 0
        ? Math.round(((diffStat.correct + (isCorrect ? 1 : 0)) / (diffStat.total + 1)) * 100)
        : 0,
  };

  // 週間アクティビティ
  const todayActivityIndex = newStats.weeklyActivity.findIndex((a) => a.date === today);
  if (todayActivityIndex >= 0) {
    newStats.weeklyActivity[todayActivityIndex] = {
      ...newStats.weeklyActivity[todayActivityIndex],
      questionsAnswered: newStats.weeklyActivity[todayActivityIndex].questionsAnswered + 1,
      correctAnswers:
        newStats.weeklyActivity[todayActivityIndex].correctAnswers + (isCorrect ? 1 : 0),
    };
  } else {
    // 最新7日間のみ保持
    if (newStats.weeklyActivity.length >= 7) {
      newStats.weeklyActivity = newStats.weeklyActivity.slice(-6);
    }
    newStats.weeklyActivity.push({
      date: today,
      questionsAnswered: 1,
      correctAnswers: isCorrect ? 1 : 0,
    });
  }

  return newStats;
}

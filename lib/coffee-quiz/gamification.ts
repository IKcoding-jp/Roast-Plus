// ゲーミフィケーションロジック（XP、レベル、バッジ、ストリーク計算）
import type {
  LevelInfo,
  StreakInfo,
  BadgeType,
  EarnedBadge,
  DailyGoal,
  QuizDifficulty,
  QuizStats,
  QuizCategory,
} from './types';
import {
  XP_CONFIG,
  LEVEL_CONFIG,
  INITIAL_LEVEL_INFO,
  INITIAL_STREAK_INFO,
} from './types';
import { getDebugTodayDateString, isDebugMode, getCurrentDate } from './debug';

// ========================================
// XP計算
// ========================================

interface XPCalculationParams {
  isCorrect: boolean;
  difficulty: QuizDifficulty;
  responseTimeMs: number;
  isFirstTime: boolean;
  consecutiveCorrect: number;
}

/**
 * 獲得XPを計算
 */
export function calculateXP(params: XPCalculationParams): number {
  const { isCorrect, difficulty, responseTimeMs, isFirstTime, consecutiveCorrect } = params;

  // 基本XP
  const baseXP = isCorrect ? XP_CONFIG.baseXPCorrect : XP_CONFIG.baseXPIncorrect;

  // 難易度ボーナス
  const difficultyMultiplier = XP_CONFIG.difficultyMultiplier[difficulty];

  // 速度ボーナス（正解時のみ）
  let speedBonus = 0;
  if (isCorrect) {
    const responseTimeSec = responseTimeMs / 1000;
    if (responseTimeSec < 5) {
      speedBonus = XP_CONFIG.speedBonus.fast;
    } else if (responseTimeSec < 10) {
      speedBonus = XP_CONFIG.speedBonus.normal;
    }
  }

  // 初回ボーナス
  const firstTimeBonus = isFirstTime && isCorrect ? XP_CONFIG.firstTimeBonus : 0;

  // ストリーク倍率（連続正解ボーナス）
  const streakMultiplier = isCorrect
    ? Math.min(
        1 + consecutiveCorrect * XP_CONFIG.streakMultiplierPerCorrect,
        XP_CONFIG.maxStreakMultiplier
      )
    : 1;

  // 合計XP
  const totalXP = Math.floor(
    (baseXP * difficultyMultiplier + speedBonus + firstTimeBonus) * streakMultiplier
  );

  return totalXP;
}

// ========================================
// レベル計算
// ========================================

/**
 * 次のレベルに必要なXPを計算
 */
export function calculateXPForNextLevel(level: number): number {
  if (level >= LEVEL_CONFIG.maxLevel) return Infinity;

  return Math.floor(
    LEVEL_CONFIG.baseXP * Math.pow(level, LEVEL_CONFIG.exponent) +
      LEVEL_CONFIG.baseXP * level
  );
}

/**
 * 累計XPからレベル情報を計算
 */
export function calculateLevelFromTotalXP(totalXP: number): LevelInfo {
  let level = 1;
  let xpUsed = 0;

  while (level < LEVEL_CONFIG.maxLevel) {
    const xpForNextLevel = calculateXPForNextLevel(level);
    if (xpUsed + xpForNextLevel > totalXP) {
      break;
    }
    xpUsed += xpForNextLevel;
    level++;
  }

  const currentXP = totalXP - xpUsed;
  const xpToNextLevel = level >= LEVEL_CONFIG.maxLevel ? 0 : calculateXPForNextLevel(level);

  return {
    level,
    currentXP,
    totalXP,
    xpToNextLevel,
  };
}

/**
 * XPを追加してレベル情報を更新
 */
export function addXP(levelInfo: LevelInfo, xpGained: number): {
  newLevelInfo: LevelInfo;
  leveledUp: boolean;
  newLevel?: number;
} {
  const newTotalXP = levelInfo.totalXP + xpGained;
  const newLevelInfo = calculateLevelFromTotalXP(newTotalXP);
  const leveledUp = newLevelInfo.level > levelInfo.level;

  return {
    newLevelInfo,
    leveledUp,
    newLevel: leveledUp ? newLevelInfo.level : undefined,
  };
}

// ========================================
// ストリーク計算
// ========================================

/**
 * 今日の日付文字列を取得（YYYY-MM-DD）
 */
export function getTodayDateString(): string {
  // デバッグモードの場合はデバッグ用の日付を使用
  if (isDebugMode()) {
    return getDebugTodayDateString();
  }
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * 2つの日付の差（日数）を計算
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * ストリーク情報を更新
 */
export function updateStreak(streak: StreakInfo): StreakInfo {
  const today = getTodayDateString();

  // 初回またはリセット
  if (!streak.lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(streak.longestStreak, 1),
      lastActiveDate: today,
      streakStartDate: today,
    };
  }

  // すでに今日活動済み
  if (streak.lastActiveDate === today) {
    return streak;
  }

  const daysDiff = getDaysDifference(streak.lastActiveDate, today);

  // 連続（昨日活動していた）
  if (daysDiff === 1) {
    const newStreak = streak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastActiveDate: today,
      streakStartDate: streak.streakStartDate || today,
    };
  }

  // ストリーク切れ
  return {
    currentStreak: 1,
    longestStreak: streak.longestStreak,
    lastActiveDate: today,
    streakStartDate: today,
  };
}

/**
 * ストリークが危機的かどうか（今日やらないと切れる）
 */
export function isStreakAtRisk(streak: StreakInfo): boolean {
  if (!streak.lastActiveDate || streak.currentStreak === 0) return false;

  const today = getTodayDateString();
  if (streak.lastActiveDate === today) return false;

  const daysDiff = getDaysDifference(streak.lastActiveDate, today);
  return daysDiff === 1;
}

// ========================================
// バッジ判定
// ========================================

interface BadgeCheckContext {
  streak: StreakInfo;
  stats: QuizStats;
  sessionCorrect: number;
  sessionTotal: number;
  sessionTimeMs: number;
  earnedBadges: EarnedBadge[];
}

/**
 * 新しく獲得したバッジを判定
 */
export function checkNewBadges(context: BadgeCheckContext): BadgeType[] {
  const newBadges: BadgeType[] = [];
  const existingTypes = new Set(context.earnedBadges.map((b) => b.type));

  const checkBadge = (type: BadgeType, condition: boolean) => {
    if (!existingTypes.has(type) && condition) {
      newBadges.push(type);
    }
  };

  // ストリーク系
  checkBadge('streak-3', context.streak.currentStreak >= 3);
  checkBadge('streak-7', context.streak.currentStreak >= 7);
  checkBadge('streak-30', context.streak.currentStreak >= 30);
  checkBadge('streak-100', context.streak.currentStreak >= 100);

  // 正解数系
  checkBadge('correct-10', context.stats.totalCorrect >= 10);
  checkBadge('correct-50', context.stats.totalCorrect >= 50);
  checkBadge('correct-100', context.stats.totalCorrect >= 100);
  checkBadge('correct-500', context.stats.totalCorrect >= 500);

  // カテゴリマスタリー
  checkBadge('master-basics', context.stats.categoryStats.basics.masteredCount >= 20);
  checkBadge('master-roasting', context.stats.categoryStats.roasting.masteredCount >= 20);
  checkBadge('master-brewing', context.stats.categoryStats.brewing.masteredCount >= 20);
  checkBadge('master-history', context.stats.categoryStats.history.masteredCount >= 20);

  // パーフェクト
  checkBadge(
    'perfect-session',
    context.sessionTotal >= 10 && context.sessionCorrect === context.sessionTotal
  );

  // 初挑戦
  checkBadge('first-quiz', context.stats.totalQuestions >= 1);

  // スピードデーモン（10問を2分以内）
  checkBadge(
    'speed-demon',
    context.sessionTotal >= 10 &&
      context.sessionCorrect === context.sessionTotal &&
      context.sessionTimeMs < 120000
  );

  // 時間帯バッジ（デバッグモード対応）
  const hour = getCurrentDate().getHours();
  checkBadge('early-bird', hour < 6);
  checkBadge('night-owl', hour >= 0 && hour < 5);

  return newBadges;
}

/**
 * バッジを獲得済みリストに追加
 */
export function earnBadges(
  existingBadges: EarnedBadge[],
  newBadgeTypes: BadgeType[]
): EarnedBadge[] {
  const now = new Date().toISOString();
  const newBadges: EarnedBadge[] = newBadgeTypes.map((type) => ({
    type,
    earnedAt: now,
  }));
  return [...existingBadges, ...newBadges];
}

// ========================================
// デイリーゴール
// ========================================

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

// ========================================
// 統計更新
// ========================================

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

// ========================================
// 初期状態の作成
// ========================================

export function createInitialLevelInfo(): LevelInfo {
  return { ...INITIAL_LEVEL_INFO };
}

export function createInitialStreakInfo(): StreakInfo {
  return { ...INITIAL_STREAK_INFO };
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateXP,
  calculateXPForNextLevel,
  calculateLevelFromTotalXP,
  addXP,
  getDaysDifference,
  getDailyGoalProgress,
  updateStreak,
  isStreakAtRisk,
  checkNewBadges,
  earnBadges,
  updateDailyGoal,
  getTodayGoal,
  updateStats,
  createInitialLevelInfo,
  createInitialStreakInfo,
  getTodayDateString,
} from './gamification';
import type { StreakInfo, QuizStats, EarnedBadge, DailyGoal } from './types';

// debug.tsのモック
vi.mock('./debug', () => ({
  isDebugMode: vi.fn(() => false),
  getDebugTodayDateString: vi.fn(() => '2026-02-06'),
  getCurrentDate: vi.fn(() => new Date('2026-02-06T12:00:00.000Z')),
}));

describe('calculateXP', () => {
  it('正解時に基本XPを獲得する', () => {
    const xp = calculateXP({
      isCorrect: true,
      difficulty: 'beginner',
      responseTimeMs: 15000,
      isFirstTime: false,
      consecutiveCorrect: 0,
    });
    expect(xp).toBeGreaterThan(0);
  });

  it('不正解時は基本XP（参加賞）のみ獲得', () => {
    const xp = calculateXP({
      isCorrect: false,
      difficulty: 'beginner',
      responseTimeMs: 5000,
      isFirstTime: false,
      consecutiveCorrect: 0,
    });
    // baseXPIncorrect = 2（参加賞として少量のXPを付与）
    expect(xp).toBe(2);
  });

  it('難易度が高いほどXPが多い', () => {
    const params = {
      isCorrect: true,
      responseTimeMs: 15000,
      isFirstTime: false,
      consecutiveCorrect: 0,
    };

    const beginnerXP = calculateXP({ ...params, difficulty: 'beginner' });
    const intermediateXP = calculateXP({ ...params, difficulty: 'intermediate' });
    const advancedXP = calculateXP({ ...params, difficulty: 'advanced' });

    expect(intermediateXP).toBeGreaterThan(beginnerXP);
    expect(advancedXP).toBeGreaterThan(intermediateXP);
  });

  it('速い回答にはスピードボーナスがつく', () => {
    const params = {
      isCorrect: true,
      difficulty: 'beginner',
      isFirstTime: false,
      consecutiveCorrect: 0,
    };

    const fastXP = calculateXP({ ...params, responseTimeMs: 3000 });
    const slowXP = calculateXP({ ...params, responseTimeMs: 15000 });

    expect(fastXP).toBeGreaterThan(slowXP);
  });
});

describe('calculateXPForNextLevel', () => {
  it('レベル1から2に必要なXPを計算する', () => {
    const xp = calculateXPForNextLevel(1);
    expect(xp).toBeGreaterThan(0);
    expect(Number.isFinite(xp)).toBe(true);
  });

  it('レベルが上がるほど必要XPが増える', () => {
    const xpLevel1 = calculateXPForNextLevel(1);
    const xpLevel5 = calculateXPForNextLevel(5);
    const xpLevel10 = calculateXPForNextLevel(10);

    expect(xpLevel5).toBeGreaterThan(xpLevel1);
    expect(xpLevel10).toBeGreaterThan(xpLevel5);
  });
});

describe('calculateLevelFromTotalXP', () => {
  it('XP 0はレベル1', () => {
    const info = calculateLevelFromTotalXP(0);
    expect(info.level).toBe(1);
    expect(info.totalXP).toBe(0);
  });

  it('XPが増えるとレベルが上がる', () => {
    const info = calculateLevelFromTotalXP(10000);
    expect(info.level).toBeGreaterThan(1);
  });
});

describe('getDaysDifference', () => {
  it('同じ日は差が0', () => {
    const diff = getDaysDifference('2024-01-15', '2024-01-15');
    expect(diff).toBe(0);
  });

  it('1日の差を正しく計算する', () => {
    const diff = getDaysDifference('2024-01-15', '2024-01-16');
    expect(diff).toBe(1);
  });

  it('順序に関係なく絶対値を返す', () => {
    const diff1 = getDaysDifference('2024-01-15', '2024-01-20');
    const diff2 = getDaysDifference('2024-01-20', '2024-01-15');
    expect(diff1).toBe(diff2);
    expect(diff1).toBe(5);
  });
});

describe('getDailyGoalProgress', () => {
  it('ゴールがnullの場合は0を返す', () => {
    const progress = getDailyGoalProgress(null);
    expect(progress).toBe(0);
  });

  it('達成率を正しく計算する', () => {
    const progress = getDailyGoalProgress({
      date: '2024-01-15',
      targetQuestions: 10,
      completedQuestions: 5,
      correctAnswers: 4,
      xpEarned: 100,
    });
    expect(progress).toBe(50);
  });

  it('100%を超えない', () => {
    const progress = getDailyGoalProgress({
      date: '2024-01-15',
      targetQuestions: 10,
      completedQuestions: 15,
      correctAnswers: 12,
      xpEarned: 200,
    });
    expect(progress).toBe(100);
  });
});

// ========================================
// 追加テスト（カバレッジ向上）
// ========================================

describe('addXP', () => {
  it('XPを追加して新しいレベル情報を返す', () => {
    const levelInfo = { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 150 };
    const { newLevelInfo } = addXP(levelInfo, 50);

    expect(newLevelInfo.totalXP).toBe(50);
    expect(newLevelInfo.currentXP).toBe(50);
  });

  it('レベルアップ時にleveledUp=trueを返す', () => {
    const levelInfo = { level: 1, currentXP: 140, totalXP: 140, xpToNextLevel: 150 };
    const { leveledUp, newLevel } = addXP(levelInfo, 20);

    expect(leveledUp).toBe(true);
    expect(newLevel).toBe(2);
  });

  it('レベルアップしない場合はleveledUp=false', () => {
    const levelInfo = { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 150 };
    const { leveledUp, newLevel } = addXP(levelInfo, 10);

    expect(leveledUp).toBe(false);
    expect(newLevel).toBeUndefined();
  });

  it('大量のXPで複数レベルアップ', () => {
    const levelInfo = { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 150 };
    const { newLevelInfo } = addXP(levelInfo, 10000);

    expect(newLevelInfo.level).toBeGreaterThan(1);
    expect(newLevelInfo.totalXP).toBe(10000);
  });
});

describe('updateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初回活動でストリーク1を作成', () => {
    const streak: StreakInfo = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      streakStartDate: '',
    };

    const updated = updateStreak(streak);

    expect(updated.currentStreak).toBe(1);
    expect(updated.lastActiveDate).toBe('2026-02-06');
  });

  it('連続日でストリークが増加', () => {
    const streak: StreakInfo = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-02-05', // 昨日
      streakStartDate: '2026-02-01',
    };

    const updated = updateStreak(streak);

    expect(updated.currentStreak).toBe(6);
    expect(updated.longestStreak).toBe(6);
  });

  it('同日の活動ではストリークが変化しない', () => {
    const streak: StreakInfo = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-02-06', // 今日
      streakStartDate: '2026-02-01',
    };

    const updated = updateStreak(streak);

    expect(updated.currentStreak).toBe(5);
    expect(updated).toEqual(streak);
  });

  it('2日以上空くとストリークがリセット', () => {
    const streak: StreakInfo = {
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: '2026-02-03', // 3日前
      streakStartDate: '2026-01-24',
    };

    const updated = updateStreak(streak);

    expect(updated.currentStreak).toBe(1);
    expect(updated.longestStreak).toBe(10); // longestは維持
  });

  it('longestStreakが更新される', () => {
    const streak: StreakInfo = {
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: '2026-02-05', // 昨日
      streakStartDate: '2026-01-26',
    };

    const updated = updateStreak(streak);

    expect(updated.currentStreak).toBe(11);
    expect(updated.longestStreak).toBe(11);
  });
});

describe('isStreakAtRisk', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('昨日活動していた場合はtrue（今日やらないと切れる）', () => {
    const streak: StreakInfo = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-02-05', // 昨日
      streakStartDate: '2026-02-01',
    };

    expect(isStreakAtRisk(streak)).toBe(true);
  });

  it('今日活動していた場合はfalse', () => {
    const streak: StreakInfo = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-02-06', // 今日
      streakStartDate: '2026-02-01',
    };

    expect(isStreakAtRisk(streak)).toBe(false);
  });

  it('2日以上前の場合はfalse（すでに切れている）', () => {
    const streak: StreakInfo = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-02-04', // 2日前
      streakStartDate: '2026-01-30',
    };

    expect(isStreakAtRisk(streak)).toBe(false);
  });

  it('ストリーク0の場合はfalse', () => {
    const streak: StreakInfo = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      streakStartDate: '',
    };

    expect(isStreakAtRisk(streak)).toBe(false);
  });
});

describe('checkNewBadges', () => {
  const createMockStats = (): QuizStats => ({
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    averageAccuracy: 0,
    categoryStats: {
      basics: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
      roasting: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
      brewing: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
      history: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
    },
    difficultyStats: {
      beginner: { total: 0, correct: 0, accuracy: 0 },
      intermediate: { total: 0, correct: 0, accuracy: 0 },
      advanced: { total: 0, correct: 0, accuracy: 0 },
    },
    weeklyActivity: [],
  });

  it('first-quizバッジを獲得できる', () => {
    const context = {
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '', streakStartDate: '' },
      stats: { ...createMockStats(), totalQuestions: 1 },
      sessionCorrect: 1,
      sessionTotal: 1,
      sessionTimeMs: 10000,
      earnedBadges: [],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).toContain('first-quiz');
  });

  it('streak-3バッジを獲得できる', () => {
    const context = {
      streak: { currentStreak: 3, longestStreak: 3, lastActiveDate: '2026-02-06', streakStartDate: '2026-02-04' },
      stats: createMockStats(),
      sessionCorrect: 1,
      sessionTotal: 1,
      sessionTimeMs: 10000,
      earnedBadges: [],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).toContain('streak-3');
  });

  it('correct-10バッジを獲得できる', () => {
    const context = {
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '', streakStartDate: '' },
      stats: { ...createMockStats(), totalCorrect: 10 },
      sessionCorrect: 1,
      sessionTotal: 1,
      sessionTimeMs: 10000,
      earnedBadges: [],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).toContain('correct-10');
  });

  it('perfect-sessionバッジを獲得できる（10問以上全問正解）', () => {
    const context = {
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '', streakStartDate: '' },
      stats: createMockStats(),
      sessionCorrect: 10,
      sessionTotal: 10,
      sessionTimeMs: 300000,
      earnedBadges: [],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).toContain('perfect-session');
  });

  it('speed-demonバッジを獲得できる（10問2分以内全問正解）', () => {
    const context = {
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '', streakStartDate: '' },
      stats: createMockStats(),
      sessionCorrect: 10,
      sessionTotal: 10,
      sessionTimeMs: 100000, // 2分未満
      earnedBadges: [],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).toContain('speed-demon');
  });

  it('既に獲得済みのバッジは返さない', () => {
    const context = {
      streak: { currentStreak: 3, longestStreak: 3, lastActiveDate: '2026-02-06', streakStartDate: '2026-02-04' },
      stats: createMockStats(),
      sessionCorrect: 1,
      sessionTotal: 1,
      sessionTimeMs: 10000,
      earnedBadges: [{ type: 'streak-3' as const, earnedAt: '2026-02-05' }],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).not.toContain('streak-3');
  });

  it('複数バッジを同時に獲得できる', () => {
    const context = {
      streak: { currentStreak: 7, longestStreak: 7, lastActiveDate: '2026-02-06', streakStartDate: '2026-01-31' },
      stats: { ...createMockStats(), totalQuestions: 1, totalCorrect: 10 },
      sessionCorrect: 1,
      sessionTotal: 1,
      sessionTimeMs: 10000,
      earnedBadges: [],
    };

    const newBadges = checkNewBadges(context);
    expect(newBadges).toContain('streak-3');
    expect(newBadges).toContain('streak-7');
    expect(newBadges).toContain('correct-10');
    expect(newBadges).toContain('first-quiz');
  });
});

describe('earnBadges', () => {
  it('新しいバッジを追加する', () => {
    const existingBadges: EarnedBadge[] = [{ type: 'first-quiz', earnedAt: '2026-02-01' }];
    const newBadgeTypes: ('streak-3' | 'correct-10')[] = ['streak-3', 'correct-10'];

    const result = earnBadges(existingBadges, newBadgeTypes);

    expect(result.length).toBe(3);
    expect(result[0].type).toBe('first-quiz');
    expect(result[1].type).toBe('streak-3');
    expect(result[2].type).toBe('correct-10');
  });

  it('earnedAtが設定される', () => {
    const result = earnBadges([], ['first-quiz']);

    expect(result[0].earnedAt).toBeDefined();
    expect(result[0].earnedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('空配列でも動作する', () => {
    const result = earnBadges([], []);
    expect(result).toEqual([]);
  });
});

describe('updateDailyGoal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('新しいデイリーゴールを作成する', () => {
    const dailyGoals: DailyGoal[] = [];
    const result = updateDailyGoal(dailyGoals, true, 50, 10);

    expect(result.length).toBe(1);
    expect(result[0].date).toBe('2026-02-06');
    expect(result[0].completedQuestions).toBe(1);
    expect(result[0].correctAnswers).toBe(1);
    expect(result[0].xpEarned).toBe(50);
  });

  it('既存のデイリーゴールを更新する', () => {
    const dailyGoals: DailyGoal[] = [
      { date: '2026-02-06', targetQuestions: 10, completedQuestions: 5, correctAnswers: 4, xpEarned: 200 },
    ];
    const result = updateDailyGoal(dailyGoals, false, 10, 10);

    expect(result[0].completedQuestions).toBe(6);
    expect(result[0].correctAnswers).toBe(4); // 不正解なので増えない
    expect(result[0].xpEarned).toBe(210);
  });

  it('最新7日間のみ保持する', () => {
    const dailyGoals: DailyGoal[] = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-02-0${i}`,
      targetQuestions: 10,
      completedQuestions: 5,
      correctAnswers: 4,
      xpEarned: 100,
    }));

    const result = updateDailyGoal(dailyGoals, true, 50, 10);

    expect(result.length).toBe(7); // 7日間のみ
    expect(result[result.length - 1].date).toBe('2026-02-06');
  });
});

describe('getTodayGoal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('今日のゴールを返す', () => {
    const dailyGoals: DailyGoal[] = [
      { date: '2026-02-05', targetQuestions: 10, completedQuestions: 5, correctAnswers: 4, xpEarned: 200 },
      { date: '2026-02-06', targetQuestions: 10, completedQuestions: 3, correctAnswers: 2, xpEarned: 100 },
    ];

    const result = getTodayGoal(dailyGoals);

    expect(result?.date).toBe('2026-02-06');
    expect(result?.completedQuestions).toBe(3);
  });

  it('今日のゴールがない場合はnullを返す', () => {
    const dailyGoals: DailyGoal[] = [
      { date: '2026-02-04', targetQuestions: 10, completedQuestions: 5, correctAnswers: 4, xpEarned: 200 },
    ];

    const result = getTodayGoal(dailyGoals);

    expect(result).toBeNull();
  });
});

describe('updateStats', () => {
  const createEmptyStats = (): QuizStats => ({
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    averageAccuracy: 0,
    categoryStats: {
      basics: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
      roasting: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
      brewing: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
      history: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
    },
    difficultyStats: {
      beginner: { total: 0, correct: 0, accuracy: 0 },
      intermediate: { total: 0, correct: 0, accuracy: 0 },
      advanced: { total: 0, correct: 0, accuracy: 0 },
    },
    weeklyActivity: [],
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('正解時に統計を更新する', () => {
    const stats = createEmptyStats();
    const result = updateStats(stats, true, 'basics', 'beginner', false);

    expect(result.totalQuestions).toBe(1);
    expect(result.totalCorrect).toBe(1);
    expect(result.totalIncorrect).toBe(0);
    expect(result.averageAccuracy).toBe(100);
  });

  it('不正解時に統計を更新する', () => {
    const stats = createEmptyStats();
    const result = updateStats(stats, false, 'basics', 'beginner', false);

    expect(result.totalQuestions).toBe(1);
    expect(result.totalCorrect).toBe(0);
    expect(result.totalIncorrect).toBe(1);
    expect(result.averageAccuracy).toBe(0);
  });

  it('カテゴリ別統計を更新する', () => {
    const stats = createEmptyStats();
    const result = updateStats(stats, true, 'roasting', 'intermediate', false);

    expect(result.categoryStats.roasting.total).toBe(1);
    expect(result.categoryStats.roasting.correct).toBe(1);
    expect(result.categoryStats.roasting.accuracy).toBe(100);
  });

  it('難易度別統計を更新する', () => {
    const stats = createEmptyStats();
    const result = updateStats(stats, true, 'basics', 'advanced', false);

    expect(result.difficultyStats.advanced.total).toBe(1);
    expect(result.difficultyStats.advanced.correct).toBe(1);
    expect(result.difficultyStats.advanced.accuracy).toBe(100);
  });

  it('マスター済みカウントを更新する', () => {
    const stats = createEmptyStats();
    const result = updateStats(stats, true, 'basics', 'beginner', true);

    expect(result.categoryStats.basics.masteredCount).toBe(1);
  });

  it('週間アクティビティを更新する', () => {
    const stats = createEmptyStats();
    const result = updateStats(stats, true, 'basics', 'beginner', false);

    expect(result.weeklyActivity.length).toBe(1);
    expect(result.weeklyActivity[0].date).toBe('2026-02-06');
    expect(result.weeklyActivity[0].questionsAnswered).toBe(1);
    expect(result.weeklyActivity[0].correctAnswers).toBe(1);
  });
});

describe('createInitialLevelInfo', () => {
  it('初期レベル情報を返す', () => {
    const info = createInitialLevelInfo();

    expect(info.level).toBe(1);
    expect(info.currentXP).toBe(0);
    expect(info.totalXP).toBe(0);
  });
});

describe('createInitialStreakInfo', () => {
  it('初期ストリーク情報を返す', () => {
    const info = createInitialStreakInfo();

    expect(info.currentStreak).toBe(0);
    expect(info.longestStreak).toBe(0);
    expect(info.lastActiveDate).toBe('');
  });
});

describe('getTodayDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('YYYY-MM-DD形式の日付文字列を返す', () => {
    const dateString = getTodayDateString();
    expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('calculateXP 詳細テスト', () => {
  it('初回ボーナスが加算される', () => {
    const params = {
      isCorrect: true,
      difficulty: 'beginner' as const,
      responseTimeMs: 15000,
      isFirstTime: true,
      consecutiveCorrect: 0,
    };
    const firstTimeXP = calculateXP(params);
    const repeatXP = calculateXP({ ...params, isFirstTime: false });

    expect(firstTimeXP).toBeGreaterThan(repeatXP);
  });

  it('連続正解でストリーク倍率が適用される', () => {
    const params = {
      isCorrect: true,
      difficulty: 'beginner' as const,
      responseTimeMs: 15000,
      isFirstTime: false,
      consecutiveCorrect: 0,
    };

    const noStreakXP = calculateXP({ ...params, consecutiveCorrect: 0 });
    const streak5XP = calculateXP({ ...params, consecutiveCorrect: 5 });

    expect(streak5XP).toBeGreaterThan(noStreakXP);
  });

  it('不正解時はストリーク倍率が適用されない', () => {
    const params = {
      isCorrect: false,
      difficulty: 'beginner' as const,
      responseTimeMs: 15000,
      isFirstTime: false,
      consecutiveCorrect: 5,
    };

    const xp = calculateXP(params);
    expect(xp).toBe(2); // 基本参加賞のみ
  });
});

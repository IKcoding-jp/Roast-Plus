import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  calculateXPForNextLevel,
  calculateLevelFromTotalXP,
  getDaysDifference,
  getDailyGoalProgress,
} from './gamification';

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

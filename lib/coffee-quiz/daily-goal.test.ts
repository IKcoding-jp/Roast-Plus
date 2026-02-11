import { describe, it, expect, vi } from 'vitest';
import { updateDailyGoal, getTodayGoal, getDailyGoalProgress } from './daily-goal';
import type { DailyGoal } from './types';

vi.mock('./streak', () => ({
  getTodayDateString: () => '2026-02-11',
}));

describe('updateDailyGoal', () => {
  it('新しいゴールを作成', () => {
    const result = updateDailyGoal([], true, 10, 5);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: '2026-02-11',
      targetQuestions: 5,
      completedQuestions: 1,
      correctAnswers: 1,
      xpEarned: 10,
    });
  });

  it('不正解の場合 correctAnswers は 0', () => {
    const result = updateDailyGoal([], false, 2, 5);
    expect(result[0].correctAnswers).toBe(0);
    expect(result[0].completedQuestions).toBe(1);
  });

  it('既存ゴール更新', () => {
    const existing: DailyGoal[] = [
      {
        date: '2026-02-11',
        targetQuestions: 10,
        completedQuestions: 3,
        correctAnswers: 2,
        xpEarned: 30,
      },
    ];
    const result = updateDailyGoal(existing, true, 15, 10);
    expect(result).toHaveLength(1);
    expect(result[0].completedQuestions).toBe(4);
    expect(result[0].correctAnswers).toBe(3);
    expect(result[0].xpEarned).toBe(45);
  });

  it('7日超のデータ削除（最新7日間のみ保持）', () => {
    const goals: DailyGoal[] = Array.from({ length: 8 }, (_, i) => ({
      date: `2026-02-0${i + 1}`,
      targetQuestions: 10,
      completedQuestions: 5,
      correctAnswers: 3,
      xpEarned: 50,
    }));
    // 8件ある状態で新規追加 → 末尾6件 + 新規 = 7件
    const result = updateDailyGoal(goals, true, 10, 10);
    expect(result).toHaveLength(7);
    expect(result[result.length - 1].date).toBe('2026-02-11');
  });
});

describe('getTodayGoal', () => {
  it('今日のゴールが存在する場合', () => {
    const goals: DailyGoal[] = [
      { date: '2026-02-10', targetQuestions: 10, completedQuestions: 5, correctAnswers: 3, xpEarned: 50 },
      { date: '2026-02-11', targetQuestions: 10, completedQuestions: 3, correctAnswers: 2, xpEarned: 30 },
    ];
    const result = getTodayGoal(goals);
    expect(result).not.toBeNull();
    expect(result!.date).toBe('2026-02-11');
    expect(result!.completedQuestions).toBe(3);
  });

  it('今日のゴールが存在しない場合', () => {
    const goals: DailyGoal[] = [
      { date: '2026-02-10', targetQuestions: 10, completedQuestions: 5, correctAnswers: 3, xpEarned: 50 },
    ];
    expect(getTodayGoal(goals)).toBeNull();
  });

  it('空配列の場合', () => {
    expect(getTodayGoal([])).toBeNull();
  });
});

describe('getDailyGoalProgress', () => {
  it('goalがnullの場合 → 0', () => {
    expect(getDailyGoalProgress(null)).toBe(0);
  });

  it('0問回答 → 0%', () => {
    const goal: DailyGoal = {
      date: '2026-02-11',
      targetQuestions: 10,
      completedQuestions: 0,
      correctAnswers: 0,
      xpEarned: 0,
    };
    expect(getDailyGoalProgress(goal)).toBe(0);
  });

  it('半分達成 → 50%', () => {
    const goal: DailyGoal = {
      date: '2026-02-11',
      targetQuestions: 10,
      completedQuestions: 5,
      correctAnswers: 3,
      xpEarned: 50,
    };
    expect(getDailyGoalProgress(goal)).toBe(50);
  });

  it('目標達成 → 100%', () => {
    const goal: DailyGoal = {
      date: '2026-02-11',
      targetQuestions: 10,
      completedQuestions: 10,
      correctAnswers: 7,
      xpEarned: 100,
    };
    expect(getDailyGoalProgress(goal)).toBe(100);
  });

  it('目標超過 → 100%（上限クランプ）', () => {
    const goal: DailyGoal = {
      date: '2026-02-11',
      targetQuestions: 10,
      completedQuestions: 15,
      correctAnswers: 12,
      xpEarned: 150,
    };
    expect(getDailyGoalProgress(goal)).toBe(100);
  });
});

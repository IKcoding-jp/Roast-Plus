import { describe, it, expect, vi } from 'vitest';
import { updateStats } from './stats';
import { INITIAL_QUIZ_STATS } from './types';

vi.mock('./streak', () => ({
  getTodayDateString: () => '2026-02-11',
}));

describe('updateStats', () => {
  describe('基本統計', () => {
    it('正解時の統計更新', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.totalQuestions).toBe(1);
      expect(result.totalCorrect).toBe(1);
      expect(result.totalIncorrect).toBe(0);
    });

    it('不正解時の統計更新', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, false, 'basics', 'beginner', false);
      expect(result.totalQuestions).toBe(1);
      expect(result.totalCorrect).toBe(0);
      expect(result.totalIncorrect).toBe(1);
    });
  });

  describe('正解率計算', () => {
    it('1問正解 → 100%', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.averageAccuracy).toBe(100);
    });

    it('1正解1不正解 → 50%', () => {
      const after1 = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      const result = updateStats(after1, false, 'basics', 'beginner', false);
      expect(result.averageAccuracy).toBe(50);
    });

    it('2正解1不正解 → 67%', () => {
      let stats = INITIAL_QUIZ_STATS;
      stats = updateStats(stats, true, 'basics', 'beginner', false);
      stats = updateStats(stats, true, 'basics', 'beginner', false);
      stats = updateStats(stats, false, 'basics', 'beginner', false);
      expect(stats.averageAccuracy).toBe(67);
    });
  });

  describe('カテゴリ統計', () => {
    it('basics正解 → basicsのtotal/correct/accuracy更新', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.categoryStats.basics.total).toBe(1);
      expect(result.categoryStats.basics.correct).toBe(1);
      expect(result.categoryStats.basics.accuracy).toBe(100);
    });

    it('他カテゴリは変更なし', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.categoryStats.roasting.total).toBe(0);
      expect(result.categoryStats.brewing.total).toBe(0);
      expect(result.categoryStats.history.total).toBe(0);
    });

    it('マスター済みの場合 masteredCount 増加', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', true);
      expect(result.categoryStats.basics.masteredCount).toBe(1);
    });

    it('マスター未済の場合 masteredCount 変化なし', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.categoryStats.basics.masteredCount).toBe(0);
    });
  });

  describe('難易度統計', () => {
    it('beginner正解 → beginnerのtotal/correct更新', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.difficultyStats.beginner.total).toBe(1);
      expect(result.difficultyStats.beginner.correct).toBe(1);
      expect(result.difficultyStats.beginner.accuracy).toBe(100);
    });

    it('intermediate不正解', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, false, 'basics', 'intermediate', false);
      expect(result.difficultyStats.intermediate.total).toBe(1);
      expect(result.difficultyStats.intermediate.correct).toBe(0);
      expect(result.difficultyStats.intermediate.accuracy).toBe(0);
    });

    it('他の難易度は変更なし', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'advanced', false);
      expect(result.difficultyStats.beginner.total).toBe(0);
      expect(result.difficultyStats.intermediate.total).toBe(0);
    });
  });

  describe('週間アクティビティ', () => {
    it('今日のエントリ新規作成', () => {
      const result = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(result.weeklyActivity).toHaveLength(1);
      expect(result.weeklyActivity[0]).toEqual({
        date: '2026-02-11',
        questionsAnswered: 1,
        correctAnswers: 1,
      });
    });

    it('今日のエントリ更新', () => {
      const first = updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      const result = updateStats(first, false, 'roasting', 'intermediate', false);
      expect(result.weeklyActivity).toHaveLength(1);
      expect(result.weeklyActivity[0].questionsAnswered).toBe(2);
      expect(result.weeklyActivity[0].correctAnswers).toBe(1);
    });

    it('7日超のデータ削除', () => {
      const statsWithActivity = {
        ...INITIAL_QUIZ_STATS,
        weeklyActivity: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-02-0${i + 1}`,
          questionsAnswered: 5,
          correctAnswers: 3,
        })),
      };
      const result = updateStats(statsWithActivity, true, 'basics', 'beginner', false);
      // 7件 → slice(-6)で6件 + 新規1件 = 7件
      expect(result.weeklyActivity).toHaveLength(7);
      expect(result.weeklyActivity[result.weeklyActivity.length - 1].date).toBe('2026-02-11');
    });
  });

  describe('イミュータビリティ', () => {
    it('元のstatsは変更されない', () => {
      const original = { ...INITIAL_QUIZ_STATS };
      updateStats(INITIAL_QUIZ_STATS, true, 'basics', 'beginner', false);
      expect(INITIAL_QUIZ_STATS.totalQuestions).toBe(original.totalQuestions);
    });
  });
});

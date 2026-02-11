import { describe, it, expect, vi } from 'vitest';
import { checkNewBadges, earnBadges, type BadgeCheckContext } from './badge';
import type { QuizStats } from './types';
import { INITIAL_QUIZ_STATS } from './types';

vi.mock('./debug', () => ({
  getCurrentDate: () => new Date('2026-02-11T10:00:00Z'), // 10時（通常時間帯）
}));

function createBaseContext(overrides: Partial<BadgeCheckContext> = {}): BadgeCheckContext {
  return {
    streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '' },
    stats: { ...INITIAL_QUIZ_STATS },
    sessionCorrect: 0,
    sessionTotal: 0,
    sessionTimeMs: 600000,
    earnedBadges: [],
    ...overrides,
  };
}

function createStatsWithCorrect(totalCorrect: number, totalQuestions?: number): QuizStats {
  return {
    ...INITIAL_QUIZ_STATS,
    totalCorrect,
    totalQuestions: totalQuestions ?? totalCorrect,
  };
}

describe('checkNewBadges', () => {
  describe('ストリーク系', () => {
    it('streak 3で streak-3 獲得', () => {
      const ctx = createBaseContext({
        streak: { currentStreak: 3, longestStreak: 3, lastActiveDate: '2026-02-11' },
      });
      expect(checkNewBadges(ctx)).toContain('streak-3');
    });

    it('streak 7で streak-7 獲得', () => {
      const ctx = createBaseContext({
        streak: { currentStreak: 7, longestStreak: 7, lastActiveDate: '2026-02-11' },
      });
      expect(checkNewBadges(ctx)).toContain('streak-7');
    });

    it('streak 30で streak-30 獲得', () => {
      const ctx = createBaseContext({
        streak: { currentStreak: 30, longestStreak: 30, lastActiveDate: '2026-02-11' },
      });
      expect(checkNewBadges(ctx)).toContain('streak-30');
    });

    it('streak 100で streak-100 獲得', () => {
      const ctx = createBaseContext({
        streak: { currentStreak: 100, longestStreak: 100, lastActiveDate: '2026-02-11' },
      });
      expect(checkNewBadges(ctx)).toContain('streak-100');
    });

    it('streak 2では streak-3 未獲得', () => {
      const ctx = createBaseContext({
        streak: { currentStreak: 2, longestStreak: 2, lastActiveDate: '2026-02-11' },
      });
      expect(checkNewBadges(ctx)).not.toContain('streak-3');
    });
  });

  describe('正解数系', () => {
    it('10問正解で correct-10', () => {
      const ctx = createBaseContext({ stats: createStatsWithCorrect(10) });
      expect(checkNewBadges(ctx)).toContain('correct-10');
    });

    it('50問正解で correct-50', () => {
      const ctx = createBaseContext({ stats: createStatsWithCorrect(50) });
      expect(checkNewBadges(ctx)).toContain('correct-50');
    });

    it('100問正解で correct-100', () => {
      const ctx = createBaseContext({ stats: createStatsWithCorrect(100) });
      expect(checkNewBadges(ctx)).toContain('correct-100');
    });

    it('500問正解で correct-500', () => {
      const ctx = createBaseContext({ stats: createStatsWithCorrect(500) });
      expect(checkNewBadges(ctx)).toContain('correct-500');
    });
  });

  describe('カテゴリマスタリー', () => {
    it('basics 20問マスターで master-basics', () => {
      const stats: QuizStats = {
        ...INITIAL_QUIZ_STATS,
        categoryStats: {
          ...INITIAL_QUIZ_STATS.categoryStats,
          basics: { total: 30, correct: 25, accuracy: 83, masteredCount: 20 },
        },
      };
      const ctx = createBaseContext({ stats });
      expect(checkNewBadges(ctx)).toContain('master-basics');
    });

    it('roasting 20問マスターで master-roasting', () => {
      const stats: QuizStats = {
        ...INITIAL_QUIZ_STATS,
        categoryStats: {
          ...INITIAL_QUIZ_STATS.categoryStats,
          roasting: { total: 30, correct: 25, accuracy: 83, masteredCount: 20 },
        },
      };
      const ctx = createBaseContext({ stats });
      expect(checkNewBadges(ctx)).toContain('master-roasting');
    });

    it('brewing 20問マスターで master-brewing', () => {
      const stats: QuizStats = {
        ...INITIAL_QUIZ_STATS,
        categoryStats: {
          ...INITIAL_QUIZ_STATS.categoryStats,
          brewing: { total: 30, correct: 25, accuracy: 83, masteredCount: 20 },
        },
      };
      const ctx = createBaseContext({ stats });
      expect(checkNewBadges(ctx)).toContain('master-brewing');
    });

    it('history 20問マスターで master-history', () => {
      const stats: QuizStats = {
        ...INITIAL_QUIZ_STATS,
        categoryStats: {
          ...INITIAL_QUIZ_STATS.categoryStats,
          history: { total: 30, correct: 25, accuracy: 83, masteredCount: 20 },
        },
      };
      const ctx = createBaseContext({ stats });
      expect(checkNewBadges(ctx)).toContain('master-history');
    });
  });

  describe('パーフェクトセッション', () => {
    it('10問以上全問正解で perfect-session', () => {
      const ctx = createBaseContext({ sessionCorrect: 10, sessionTotal: 10 });
      expect(checkNewBadges(ctx)).toContain('perfect-session');
    });

    it('10問未満では perfect-session 未獲得', () => {
      const ctx = createBaseContext({ sessionCorrect: 9, sessionTotal: 9 });
      expect(checkNewBadges(ctx)).not.toContain('perfect-session');
    });

    it('10問中9問正解では未獲得', () => {
      const ctx = createBaseContext({ sessionCorrect: 9, sessionTotal: 10 });
      expect(checkNewBadges(ctx)).not.toContain('perfect-session');
    });
  });

  describe('初挑戦', () => {
    it('1問以上回答で first-quiz', () => {
      const ctx = createBaseContext({ stats: createStatsWithCorrect(0, 1) });
      expect(checkNewBadges(ctx)).toContain('first-quiz');
    });

    it('0問では未獲得', () => {
      const ctx = createBaseContext();
      expect(checkNewBadges(ctx)).not.toContain('first-quiz');
    });
  });

  describe('スピードデーモン', () => {
    it('10問全問正解かつ2分以内で speed-demon', () => {
      const ctx = createBaseContext({
        sessionCorrect: 10,
        sessionTotal: 10,
        sessionTimeMs: 119999,
      });
      expect(checkNewBadges(ctx)).toContain('speed-demon');
    });

    it('2分以上では未獲得', () => {
      const ctx = createBaseContext({
        sessionCorrect: 10,
        sessionTotal: 10,
        sessionTimeMs: 120000,
      });
      expect(checkNewBadges(ctx)).not.toContain('speed-demon');
    });

    it('全問正解でなければ未獲得', () => {
      const ctx = createBaseContext({
        sessionCorrect: 9,
        sessionTotal: 10,
        sessionTimeMs: 60000,
      });
      expect(checkNewBadges(ctx)).not.toContain('speed-demon');
    });
  });

  describe('時間帯バッジ', () => {
    it('通常時間帯（10時）では early-bird/night-owl 未獲得', () => {
      const ctx = createBaseContext();
      const badges = checkNewBadges(ctx);
      expect(badges).not.toContain('early-bird');
      expect(badges).not.toContain('night-owl');
    });
  });

  describe('既獲得バッジの重複防止', () => {
    it('既に獲得済みのバッジは重複しない', () => {
      const ctx = createBaseContext({
        streak: { currentStreak: 3, longestStreak: 3, lastActiveDate: '2026-02-11' },
        earnedBadges: [{ type: 'streak-3', earnedAt: '2026-02-10T00:00:00Z' }],
      });
      expect(checkNewBadges(ctx)).not.toContain('streak-3');
    });
  });
});

describe('earnBadges', () => {
  it('新バッジが追加される', () => {
    const existing = [{ type: 'first-quiz' as const, earnedAt: '2026-02-10T00:00:00Z' }];
    const result = earnBadges(existing, ['streak-3']);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('first-quiz');
    expect(result[1].type).toBe('streak-3');
  });

  it('既存バッジは保持される', () => {
    const existing = [
      { type: 'first-quiz' as const, earnedAt: '2026-02-10T00:00:00Z' },
      { type: 'correct-10' as const, earnedAt: '2026-02-10T00:00:00Z' },
    ];
    const result = earnBadges(existing, ['streak-3']);
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('first-quiz');
    expect(result[1].type).toBe('correct-10');
  });

  it('空の新バッジリストでは変化なし', () => {
    const existing = [{ type: 'first-quiz' as const, earnedAt: '2026-02-10T00:00:00Z' }];
    const result = earnBadges(existing, []);
    expect(result).toHaveLength(1);
  });

  it('earnedAtがISO文字列', () => {
    const result = earnBadges([], ['first-quiz']);
    expect(result[0].earnedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

import { describe, it, expect } from 'vitest';
import { calculateXP, type XPCalculationParams } from './xp';

const baseParams: XPCalculationParams = {
  isCorrect: true,
  difficulty: 'beginner',
  responseTimeMs: 15000,
  isFirstTime: false,
  consecutiveCorrect: 0,
};

describe('calculateXP', () => {
  describe('基本XP', () => {
    it('正解時: baseXPCorrect(10) * 難易度倍率(1.0) = 10', () => {
      expect(calculateXP({ ...baseParams })).toBe(10);
    });

    it('不正解時: baseXPIncorrect(2)', () => {
      expect(calculateXP({ ...baseParams, isCorrect: false })).toBe(2);
    });
  });

  describe('難易度倍率', () => {
    it('beginner: 10 * 1.0 = 10', () => {
      expect(calculateXP({ ...baseParams, difficulty: 'beginner' })).toBe(10);
    });

    it('intermediate: 10 * 1.5 = 15', () => {
      expect(calculateXP({ ...baseParams, difficulty: 'intermediate' })).toBe(15);
    });

    it('advanced: 10 * 2.0 = 20', () => {
      expect(calculateXP({ ...baseParams, difficulty: 'advanced' })).toBe(20);
    });
  });

  describe('速度ボーナス', () => {
    it('5秒未満: +5', () => {
      expect(calculateXP({ ...baseParams, responseTimeMs: 4000 })).toBe(15);
    });

    it('5秒以上10秒未満: +2', () => {
      expect(calculateXP({ ...baseParams, responseTimeMs: 7000 })).toBe(12);
    });

    it('10秒以上: +0', () => {
      expect(calculateXP({ ...baseParams, responseTimeMs: 15000 })).toBe(10);
    });

    it('不正解時は速度ボーナスなし', () => {
      expect(calculateXP({ ...baseParams, isCorrect: false, responseTimeMs: 3000 })).toBe(2);
    });
  });

  describe('初回ボーナス', () => {
    it('正解かつ初回: +5', () => {
      expect(calculateXP({ ...baseParams, isFirstTime: true })).toBe(15);
    });

    it('不正解時は初回ボーナスなし', () => {
      expect(calculateXP({ ...baseParams, isCorrect: false, isFirstTime: true })).toBe(2);
    });
  });

  describe('ストリーク倍率', () => {
    it('連続正解0: 倍率1.0', () => {
      expect(calculateXP({ ...baseParams, consecutiveCorrect: 0 })).toBe(10);
    });

    it('連続正解5: 倍率1.5 → 10 * 1.5 = 15', () => {
      expect(calculateXP({ ...baseParams, consecutiveCorrect: 5 })).toBe(15);
    });

    it('連続正解10: 倍率2.0（最大）→ 10 * 2.0 = 20', () => {
      expect(calculateXP({ ...baseParams, consecutiveCorrect: 10 })).toBe(20);
    });

    it('連続正解15: 倍率は最大2.0で頭打ち → 10 * 2.0 = 20', () => {
      expect(calculateXP({ ...baseParams, consecutiveCorrect: 15 })).toBe(20);
    });

    it('不正解時はストリーク倍率なし', () => {
      expect(calculateXP({ ...baseParams, isCorrect: false, consecutiveCorrect: 10 })).toBe(2);
    });
  });

  describe('複合条件', () => {
    it('advanced + fast + firstTime + streak5', () => {
      // (10 * 2.0 + 5 + 5) * 1.5 = 30 * 1.5 = 45
      const result = calculateXP({
        isCorrect: true,
        difficulty: 'advanced',
        responseTimeMs: 3000,
        isFirstTime: true,
        consecutiveCorrect: 5,
      });
      expect(result).toBe(45);
    });

    it('intermediate + normal speed + streak3', () => {
      // (10 * 1.5 + 2) * 1.3 = 17 * 1.3 = 22.1 → floor = 22
      const result = calculateXP({
        isCorrect: true,
        difficulty: 'intermediate',
        responseTimeMs: 8000,
        isFirstTime: false,
        consecutiveCorrect: 3,
      });
      expect(result).toBe(22);
    });
  });
});

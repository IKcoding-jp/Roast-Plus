import { describe, it, expect } from 'vitest';
import {
  calculateXPForNextLevel,
  calculateLevelFromTotalXP,
  addXP,
  createInitialLevelInfo,
} from './level';
import { LEVEL_CONFIG } from './types';

describe('calculateXPForNextLevel', () => {
  it('レベル1の必要XP', () => {
    // 50 * 1^1.5 + 50 * 1 = 50 + 50 = 100
    expect(calculateXPForNextLevel(1)).toBe(100);
  });

  it('レベル2の必要XP', () => {
    // 50 * 2^1.5 + 50 * 2 = 50 * 2.828... + 100 = 241.42... → floor = 241
    expect(calculateXPForNextLevel(2)).toBe(241);
  });

  it('レベル5の必要XP', () => {
    const expected = Math.floor(
      LEVEL_CONFIG.baseXP * Math.pow(5, LEVEL_CONFIG.exponent) +
        LEVEL_CONFIG.baseXP * 5
    );
    expect(calculateXPForNextLevel(5)).toBe(expected);
  });

  it('maxLevelではInfinity', () => {
    expect(calculateXPForNextLevel(LEVEL_CONFIG.maxLevel)).toBe(Infinity);
  });

  it('maxLevel超でもInfinity', () => {
    expect(calculateXPForNextLevel(LEVEL_CONFIG.maxLevel + 1)).toBe(Infinity);
  });
});

describe('calculateLevelFromTotalXP', () => {
  it('XP 0 → レベル1', () => {
    const result = calculateLevelFromTotalXP(0);
    expect(result.level).toBe(1);
    expect(result.currentXP).toBe(0);
    expect(result.totalXP).toBe(0);
    expect(result.xpToNextLevel).toBe(100);
  });

  it('XP 50 → レベル1（レベル2には100必要）', () => {
    const result = calculateLevelFromTotalXP(50);
    expect(result.level).toBe(1);
    expect(result.currentXP).toBe(50);
  });

  it('XP 100 → レベル2', () => {
    const result = calculateLevelFromTotalXP(100);
    expect(result.level).toBe(2);
    expect(result.currentXP).toBe(0);
    expect(result.totalXP).toBe(100);
  });

  it('XP 150 → レベル2（レベル3には241追加必要）', () => {
    const result = calculateLevelFromTotalXP(150);
    expect(result.level).toBe(2);
    expect(result.currentXP).toBe(50);
  });
});

describe('addXP', () => {
  it('レベルアップしない場合', () => {
    const levelInfo = { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 100 };
    const { newLevelInfo, leveledUp, newLevel } = addXP(levelInfo, 50);
    expect(leveledUp).toBe(false);
    expect(newLevel).toBeUndefined();
    expect(newLevelInfo.level).toBe(1);
    expect(newLevelInfo.currentXP).toBe(50);
  });

  it('レベルアップする場合', () => {
    const levelInfo = { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 100 };
    const { newLevelInfo, leveledUp, newLevel } = addXP(levelInfo, 100);
    expect(leveledUp).toBe(true);
    expect(newLevel).toBe(2);
    expect(newLevelInfo.level).toBe(2);
  });

  it('複数レベルアップ', () => {
    const levelInfo = { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 100 };
    // レベル1→2: 100, レベル2→3: 241, 合計341で3に到達
    const { newLevelInfo, leveledUp, newLevel } = addXP(levelInfo, 500);
    expect(leveledUp).toBe(true);
    expect(newLevelInfo.level).toBeGreaterThanOrEqual(3);
    expect(newLevel).toBe(newLevelInfo.level);
  });
});

describe('createInitialLevelInfo', () => {
  it('初期値の確認', () => {
    const info = createInitialLevelInfo();
    expect(info.level).toBe(1);
    expect(info.currentXP).toBe(0);
    expect(info.totalXP).toBe(0);
    expect(info.xpToNextLevel).toBe(50);
  });

  it('返り値は新しいオブジェクト', () => {
    const info1 = createInitialLevelInfo();
    const info2 = createInitialLevelInfo();
    expect(info1).not.toBe(info2);
    expect(info1).toEqual(info2);
  });
});

// レベル計算ロジック
import type { LevelInfo } from './types';
import { LEVEL_CONFIG, INITIAL_LEVEL_INFO } from './types';

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

/**
 * 初期レベル情報を作成
 */
export function createInitialLevelInfo(): LevelInfo {
  return { ...INITIAL_LEVEL_INFO };
}

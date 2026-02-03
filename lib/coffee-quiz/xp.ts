// XP計算ロジック
import type { QuizDifficulty } from './types';
import { XP_CONFIG } from './types';

export interface XPCalculationParams {
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

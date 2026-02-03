// バッジ判定ロジック
import type { BadgeType, EarnedBadge, StreakInfo, QuizStats } from './types';
import { getCurrentDate } from './debug';

export interface BadgeCheckContext {
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

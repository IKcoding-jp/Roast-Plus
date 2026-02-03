// ストリーク管理ロジック
import type { StreakInfo } from './types';
import { INITIAL_STREAK_INFO } from './types';
import { getDebugTodayDateString, isDebugMode } from './debug';

/**
 * 今日の日付文字列を取得（YYYY-MM-DD）
 */
export function getTodayDateString(): string {
  // デバッグモードの場合はデバッグ用の日付を使用
  if (isDebugMode()) {
    return getDebugTodayDateString();
  }
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * 2つの日付の差（日数）を計算
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * ストリーク情報を更新
 */
export function updateStreak(streak: StreakInfo): StreakInfo {
  const today = getTodayDateString();

  // 初回またはリセット
  if (!streak.lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(streak.longestStreak, 1),
      lastActiveDate: today,
      streakStartDate: today,
    };
  }

  // すでに今日活動済み
  if (streak.lastActiveDate === today) {
    return streak;
  }

  const daysDiff = getDaysDifference(streak.lastActiveDate, today);

  // 連続（昨日活動していた）
  if (daysDiff === 1) {
    const newStreak = streak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastActiveDate: today,
      streakStartDate: streak.streakStartDate || today,
    };
  }

  // ストリーク切れ
  return {
    currentStreak: 1,
    longestStreak: streak.longestStreak,
    lastActiveDate: today,
    streakStartDate: today,
  };
}

/**
 * ストリークが危機的かどうか（今日やらないと切れる）
 */
export function isStreakAtRisk(streak: StreakInfo): boolean {
  if (!streak.lastActiveDate || streak.currentStreak === 0) return false;

  const today = getTodayDateString();
  if (streak.lastActiveDate === today) return false;

  const daysDiff = getDaysDifference(streak.lastActiveDate, today);
  return daysDiff === 1;
}

/**
 * 初期ストリーク情報を作成
 */
export function createInitialStreakInfo(): StreakInfo {
  return { ...INITIAL_STREAK_INFO };
}

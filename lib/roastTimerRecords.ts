/**
 * ローストタイマー記録の取得
 */

import type { RoastTimerRecord, AppData } from '@/types';

/**
 * ローストタイマー記録を取得
 */
export async function getAllRoastTimerRecords(
  userId: string,
  currentData: AppData
): Promise<RoastTimerRecord[]> {
  // 個人記録を取得
  return currentData.roastTimerRecords || [];
}


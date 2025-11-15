/**
 * ローストタイマー記録の取得
 * 個人記録とグループ記録を結合
 */

import { getUserData } from './firestore';
import type { RoastTimerRecord, AppData } from '@/types';

/**
 * グループ記録を取得（チームに所属している場合）
 * 現在の実装では、グループ記録は個人記録と同じコレクションに保存されているため、
 * 将来的な拡張を考慮したインターフェースを提供
 */
export async function getGroupRoastTimerRecords(
  userId: string,
  teamIds: string[]
): Promise<RoastTimerRecord[]> {
  // 現在の実装では、グループ記録は個人記録と同じコレクションに保存されている
  // 将来的にグループ記録を別コレクションに保存する場合は、ここで取得処理を実装
  // 現時点では空配列を返す
  return [];
}

/**
 * 個人記録とグループ記録を結合して取得
 */
export async function getAllRoastTimerRecords(
  userId: string,
  currentData: AppData
): Promise<RoastTimerRecord[]> {
  // 個人記録を取得
  const personalRecords = currentData.roastTimerRecords || [];

  // チームに所属している場合はグループ記録も取得
  const teamIds = currentData.teams.map((team) => team.id);
  let groupRecords: RoastTimerRecord[] = [];
  
  if (teamIds.length > 0) {
    try {
      groupRecords = await getGroupRoastTimerRecords(userId, teamIds);
    } catch (error) {
      console.error('Failed to load group records:', error);
    }
  }

  // IDベースで重複を除外
  const recordMap = new Map<string, RoastTimerRecord>();
  
  // 個人記録を追加
  personalRecords.forEach((record) => {
    recordMap.set(record.id, record);
  });
  
  // グループ記録を追加（重複は上書きされない）
  groupRecords.forEach((record) => {
    if (!recordMap.has(record.id)) {
      recordMap.set(record.id, record);
    }
  });

  return Array.from(recordMap.values());
}


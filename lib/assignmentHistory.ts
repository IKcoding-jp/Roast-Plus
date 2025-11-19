import type { Assignment } from '@/types';

/**
 * 指定日付の割り当てを取得
 */
export function getAssignmentsForDate(
  assignmentHistory: Assignment[],
  date: string
): Assignment[] {
  return assignmentHistory.filter((a) => a.assignedDate === date);
}

/**
 * 指定日付の割り当てを置き換える
 */
export function replaceAssignmentsForDate(
  assignmentHistory: Assignment[],
  date: string,
  assignments: Assignment[]
): Assignment[] {
  // 指定日付以外の履歴を保持
  const otherHistory = assignmentHistory.filter((a) => a.assignedDate !== date);
  // 新しい割り当てを追加
  return [...otherHistory, ...assignments];
}

/**
 * 条件に一致する割り当てをフィルタリング
 */
export function filterAssignmentHistoryByPredicate(
  assignmentHistory: Assignment[],
  predicate: (assignment: Assignment) => boolean
): Assignment[] {
  return assignmentHistory.filter(predicate);
}

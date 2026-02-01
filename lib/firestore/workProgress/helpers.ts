import type { WorkProgress, ProgressEntry, AppData } from '@/types';

// ===== ユーティリティ関数 =====

/** 数量文字列に対応する正規表現パターン */
const WEIGHT_PATTERN = /^(\d+(?:\.\d+)?)\s*(kg|g|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i;

/**
 * weightフィールド（文字列、例：「10kg」「5個」「3枚」）から目標量（数値）を抽出
 * @param weight 数量文字列（例：「10kg」「5個」「3枚」「10.5kg」）
 * @returns 目標量（数値）。抽出できない場合はundefined
 */
export function extractTargetAmount(weight?: string): number | undefined {
  if (!weight) return undefined;

  const match = weight.match(WEIGHT_PATTERN);
  if (match && match[1]) {
    const amount = parseFloat(match[1]);
    return isNaN(amount) ? undefined : amount;
  }

  return undefined;
}

/**
 * weightフィールドから単位を抽出
 * @param weight 数量文字列（例：「10kg」「5個」「3枚」）
 * @returns 単位（例：「kg」「個」「枚」）。単位がない場合は空文字列
 */
export function extractUnitFromWeight(weight?: string): string {
  if (!weight) return '';

  const match = weight.match(WEIGHT_PATTERN);
  return match && match[1] ? match[1] : '';
}

// ===== 共通ヘルパー =====

/**
 * appData.workProgresses から指定IDのWorkProgressを検索し、存在しなければエラーをスロー
 */
export function findWorkProgressOrThrow(
  appData: AppData,
  workProgressId: string
): { existing: WorkProgress; existingIndex: number; workProgresses: WorkProgress[] } {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  return { existing: workProgresses[existingIndex], existingIndex, workProgresses };
}

/**
 * ステータス遷移に基づいて startedAt / completedAt を解決する
 */
export function resolveStatusTransition(
  oldStatus: WorkProgress['status'],
  newStatus: WorkProgress['status'],
  currentStartedAt: string | undefined,
  currentCompletedAt: string | undefined,
  now: string
): { startedAt: string | undefined; completedAt: string | undefined } {
  let startedAt = currentStartedAt;
  let completedAt = currentCompletedAt;

  if (oldStatus === 'pending' && newStatus === 'in_progress') {
    startedAt = now;
  } else if (oldStatus === 'pending' && newStatus === 'completed') {
    startedAt = now;
    completedAt = now;
  } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
    if (!startedAt) startedAt = now;
    completedAt = now;
  } else if (oldStatus === 'completed' && newStatus === 'in_progress') {
    completedAt = undefined;
  } else if (oldStatus === 'completed' && newStatus === 'pending') {
    startedAt = undefined;
    completedAt = undefined;
  } else if (oldStatus === 'in_progress' && newStatus === 'pending') {
    startedAt = undefined;
  }

  return { startedAt, completedAt };
}

/**
 * progressHistory全体からcurrentAmount / completedCount / ステータスを再計算する
 * updateProgressHistoryEntry と deleteProgressHistoryEntry で共有
 */
export function recalculateFromHistory(
  existing: WorkProgress,
  updatedHistory: ProgressEntry[],
  now: string
): {
  currentAmount: number | undefined;
  completedCount: number | undefined;
  status: WorkProgress['status'];
  startedAt: string | undefined;
  completedAt: string | undefined;
} {
  let currentAmount: number | undefined;
  let completedCount: number | undefined;

  if (existing.targetAmount !== undefined) {
    // 進捗量モード
    currentAmount = Math.max(0, updatedHistory.reduce((sum, entry) => sum + entry.amount, 0));
  } else {
    // 完成数モード
    completedCount = Math.max(0, updatedHistory.reduce((sum, entry) => sum + entry.amount, 0));
  }

  // ステータス自動変更
  let status = existing.status;
  let completedAt = existing.completedAt;
  let startedAt = existing.startedAt;

  if (existing.targetAmount !== undefined && currentAmount !== undefined) {
    // 進捗量モード
    if (currentAmount === 0 && status !== 'pending') {
      status = 'pending';
      startedAt = undefined;
      completedAt = undefined;
    } else if (currentAmount > 0 && status === 'pending') {
      status = 'in_progress';
      if (!startedAt) startedAt = now;
    }

    if (currentAmount >= existing.targetAmount && status !== 'completed') {
      status = 'completed';
      completedAt = now;
      if (!startedAt) startedAt = now;
    } else if (currentAmount < existing.targetAmount && status === 'completed') {
      status = 'in_progress';
      completedAt = undefined;
    }
  } else {
    // 完成数モード
    if (completedCount !== undefined) {
      if (completedCount === 0 && status !== 'pending') {
        status = 'pending';
        startedAt = undefined;
      } else if (completedCount > 0 && status === 'pending') {
        status = 'in_progress';
        if (!startedAt) startedAt = now;
      }
    }
  }

  return { currentAmount, completedCount, status, startedAt, completedAt };
}

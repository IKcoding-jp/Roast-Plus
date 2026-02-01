import { saveUserData } from '../userData';
import type { AppData, WorkProgress, ProgressEntry } from '@/types';
import { findWorkProgressOrThrow, recalculateFromHistory } from './helpers';

/**
 * 作業進捗に完成数を追加
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param count 追加する完成数（数値）
 * @param appData 現在のAppData
 * @param memo メモ（任意）
 */
export async function addCompletedCountToWorkProgress(
  userId: string,
  workProgressId: string,
  count: number,
  appData: AppData,
  memo?: string
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);
  const now = new Date().toISOString();

  // 完成数を累積（マイナスの値も受け付ける）
  const completedCount = Math.max(0, (existing.completedCount || 0) + count);

  // 進捗履歴に新しいエントリを追加
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount: count,
    memo: memo?.trim() || undefined,
  };

  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];

  // 進捗状態の自動変更
  let status = existing.status;
  let startedAt = existing.startedAt;

  const previousCount = existing.completedCount || 0;
  if (previousCount === 0 && completedCount > 0 && status === 'pending') {
    status = 'in_progress';
    if (!startedAt) startedAt = now;
  }

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    completedCount,
    progressHistory,
    status,
    startedAt,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 作業進捗に進捗量を追加
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param amount 追加する進捗量（kg単位、数値）
 * @param appData 現在のAppData
 * @param memo メモ（任意）
 */
export async function addProgressToWorkProgress(
  userId: string,
  workProgressId: string,
  amount: number,
  appData: AppData,
  memo?: string
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);

  if (existing.targetAmount === undefined) {
    throw new Error('Target amount is not set');
  }

  const now = new Date().toISOString();

  // 進捗量を累積
  const currentAmount = Math.max(0, (existing.currentAmount || 0) + amount);

  // 進捗履歴に新しいエントリを追加
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount,
    memo: memo?.trim() || undefined,
  };

  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];

  // 進捗状態の自動変更
  let status = existing.status;
  let completedAt = existing.completedAt;
  let startedAt = existing.startedAt;

  const previousAmount = existing.currentAmount || 0;
  if (previousAmount === 0 && currentAmount > 0 && status === 'pending') {
    status = 'in_progress';
    if (!startedAt) startedAt = now;
  }

  // 目標量に達した場合はcompletedに自動変更
  if (currentAmount >= existing.targetAmount && status !== 'completed') {
    status = 'completed';
    completedAt = now;
    if (!startedAt) startedAt = now;
  }

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    progressHistory,
    status,
    startedAt,
    completedAt,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 作業進捗をアーカイブ
 */
export async function archiveWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);
  const now = new Date().toISOString();

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    archivedAt: now,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 作業進捗のアーカイブを解除
 */
export async function unarchiveWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);
  const now = new Date().toISOString();

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    archivedAt: undefined,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 進捗履歴エントリを更新
 */
export async function updateProgressHistoryEntry(
  userId: string,
  workProgressId: string,
  historyEntryId: string,
  updates: { amount?: number; memo?: string },
  appData: AppData
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);
  const progressHistory = existing.progressHistory || [];
  const historyEntryIndex = progressHistory.findIndex((entry) => entry.id === historyEntryId);

  if (historyEntryIndex < 0) {
    throw new Error(`Progress history entry with id ${historyEntryId} not found`);
  }

  const now = new Date().toISOString();

  // 履歴エントリを更新
  const updatedHistory = [...progressHistory];
  updatedHistory[historyEntryIndex] = {
    ...updatedHistory[historyEntryIndex],
    ...(updates.amount !== undefined && { amount: updates.amount }),
    ...(updates.memo !== undefined && { memo: updates.memo?.trim() || undefined }),
  };

  const recalculated = recalculateFromHistory(existing, updatedHistory, now);

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount: recalculated.currentAmount,
    completedCount: recalculated.completedCount,
    progressHistory: updatedHistory,
    status: recalculated.status,
    startedAt: recalculated.startedAt,
    completedAt: recalculated.completedAt,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 進捗履歴エントリを削除
 */
export async function deleteProgressHistoryEntry(
  userId: string,
  workProgressId: string,
  historyEntryId: string,
  appData: AppData
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);
  const progressHistory = existing.progressHistory || [];
  const historyEntryIndex = progressHistory.findIndex((entry) => entry.id === historyEntryId);

  if (historyEntryIndex < 0) {
    throw new Error(`Progress history entry with id ${historyEntryId} not found`);
  }

  const now = new Date().toISOString();

  // 履歴エントリを削除
  const updatedHistory = progressHistory.filter((entry) => entry.id !== historyEntryId);

  const recalculated = recalculateFromHistory(existing, updatedHistory, now);

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount: recalculated.currentAmount,
    completedCount: recalculated.completedCount,
    progressHistory: updatedHistory.length > 0 ? updatedHistory : undefined,
    status: recalculated.status,
    startedAt: recalculated.startedAt,
    completedAt: recalculated.completedAt,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

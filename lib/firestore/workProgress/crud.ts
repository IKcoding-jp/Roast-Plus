import { saveUserData } from '../userData';
import type { AppData, WorkProgress } from '@/types';
import {
  extractTargetAmount,
  findWorkProgressOrThrow,
  resolveStatusTransition,
} from './helpers';

/**
 * 作業進捗を追加
 * @param userId ユーザーID
 * @param workProgress 作業進捗データ（id, createdAt, updatedAtは自動設定）
 * @param appData 現在のAppData
 */
export async function addWorkProgress(
  userId: string,
  workProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>,
  appData: AppData
): Promise<void> {
  const now = new Date().toISOString();

  // targetAmountが明示的にundefinedとして渡されている場合（完成数で管理する場合など）、
  // extractTargetAmountの結果を無視してundefinedを使用
  let targetAmount: number | undefined;
  if ('targetAmount' in workProgress && workProgress.targetAmount === undefined) {
    targetAmount = undefined;
  } else {
    targetAmount = extractTargetAmount(workProgress.weight);
  }

  const newWorkProgress: WorkProgress = {
    ...workProgress,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    startedAt: workProgress.status === 'in_progress' || workProgress.status === 'completed'
      ? now
      : undefined,
    completedAt: workProgress.status === 'completed'
      ? now
      : undefined,
    targetAmount,
    currentAmount: targetAmount !== undefined ? 0 : undefined,
    progressHistory: targetAmount !== undefined ? [] : undefined,
    completedCount: workProgress.completedCount !== undefined ? workProgress.completedCount : undefined,
  };

  const updatedWorkProgresses = [...(appData.workProgresses || []), newWorkProgress];

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 作業進捗を更新
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param updates 更新するフィールド
 * @param appData 現在のAppData
 */
export async function updateWorkProgress(
  userId: string,
  workProgressId: string,
  updates: Partial<Omit<WorkProgress, 'id' | 'createdAt'>>,
  appData: AppData
): Promise<void> {
  const { existing, existingIndex, workProgresses } = findWorkProgressOrThrow(appData, workProgressId);
  const now = new Date().toISOString();

  // weightフィールドが変更された場合、目標量を再計算
  let targetAmount = existing.targetAmount;
  if (updates.weight !== undefined && updates.weight !== existing.weight) {
    targetAmount = extractTargetAmount(updates.weight);
    if (targetAmount === undefined) {
      updates.currentAmount = undefined;
      updates.progressHistory = undefined;
    } else if (existing.currentAmount === undefined) {
      updates.currentAmount = 0;
    }
  }

  // targetAmountが明示的にundefinedとして渡された場合（進捗管理方式の変更など）
  if ('targetAmount' in updates && updates.targetAmount === undefined) {
    targetAmount = undefined;
    updates.currentAmount = undefined;
    updates.progressHistory = undefined;
  }

  // ステータス遷移
  let startedAt = existing.startedAt;
  let completedAt = existing.completedAt;

  if (updates.status !== undefined && updates.status !== existing.status) {
    ({ startedAt, completedAt } = resolveStatusTransition(
      existing.status, updates.status, startedAt, completedAt, now
    ));
  }

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    ...updates,
    updatedAt: now,
    startedAt,
    completedAt,
    targetAmount: 'targetAmount' in updates ? updates.targetAmount : targetAmount,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

/**
 * 複数の作業進捗を一度に更新（グループ名の一括更新などに使用）
 * @param userId ユーザーID
 * @param updates 更新対象の作業進捗IDと更新内容のマップ
 * @param appData 現在のAppData
 */
export async function updateWorkProgresses(
  userId: string,
  updates: Map<string, Partial<Omit<WorkProgress, 'id' | 'createdAt'>>>,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const now = new Date().toISOString();
  const updatedWorkProgresses = [...workProgresses];
  let hasChanges = false;

  for (const [workProgressId, updateData] of updates.entries()) {
    const existingIndex = updatedWorkProgresses.findIndex((wp) => wp.id === workProgressId);

    if (existingIndex < 0) {
      console.warn(`WorkProgress with id ${workProgressId} not found`);
      continue;
    }

    const existing = updatedWorkProgresses[existingIndex];

    // weightフィールドが変更された場合、目標量を再計算
    let targetAmount = existing.targetAmount;
    if (updateData.weight !== undefined && updateData.weight !== existing.weight) {
      targetAmount = extractTargetAmount(updateData.weight);
      if (targetAmount === undefined) {
        updateData.currentAmount = undefined;
        updateData.progressHistory = undefined;
      } else if (existing.currentAmount === undefined) {
        updateData.currentAmount = 0;
      }
    }

    // ステータス遷移
    let startedAt = existing.startedAt;
    let completedAt = existing.completedAt;

    if (updateData.status !== undefined && updateData.status !== existing.status) {
      ({ startedAt, completedAt } = resolveStatusTransition(
        existing.status, updateData.status, startedAt, completedAt, now
      ));
    }

    const updatedWorkProgress: WorkProgress = {
      ...existing,
      ...updateData,
      updatedAt: now,
      startedAt,
      completedAt,
      targetAmount: targetAmount !== undefined ? targetAmount : updateData.targetAmount,
    };

    updatedWorkProgresses[existingIndex] = updatedWorkProgress;
    hasChanges = true;
  }

  if (hasChanges) {
    await saveUserData(userId, {
      ...appData,
      workProgresses: updatedWorkProgresses,
    });
  }
}

/**
 * 作業進捗を削除
 * @param userId ユーザーID
 * @param workProgressId 削除する作業進捗ID
 * @param appData 現在のAppData
 */
export async function deleteWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const updatedWorkProgresses = (appData.workProgresses || []).filter(
    (wp) => wp.id !== workProgressId
  );

  await saveUserData(userId, {
    ...appData,
    workProgresses: updatedWorkProgresses,
  });
}

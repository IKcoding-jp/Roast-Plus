import { saveUserData } from './userData';
import type { AppData, WorkProgress, ProgressEntry } from '@/types';

// ===== 作業進捗関連の関数 =====

/**
 * weightフィールド（文字列、例：「10kg」「5個」「3枚」）から目標量（数値）を抽出
 * @param weight 数量文字列（例：「10kg」「5個」「3枚」「10.5kg」）
 * @returns 目標量（数値）。抽出できない場合はundefined
 */
export function extractTargetAmount(weight?: string): number | undefined {
  if (!weight) return undefined;

  // 正規表現で数値を抽出（小数点を含む、単位はkg、g、個、枚などに対応）
  const match = weight.match(/^(\d+(?:\.\d+)?)\s*(kg|g|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
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

  // 正規表現で単位を抽出
  const match = weight.match(/^\d+(?:\.\d+)?\s*(kg|g|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
  return match && match[1] ? match[1] : '';
}

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
    // weightフィールドから目標量を抽出
    targetAmount = extractTargetAmount(workProgress.weight);
  }

  const newWorkProgress: WorkProgress = {
    ...workProgress,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    // 進捗状態に応じて日時を設定
    startedAt: workProgress.status === 'in_progress' || workProgress.status === 'completed'
      ? now
      : undefined,
    completedAt: workProgress.status === 'completed'
      ? now
      : undefined,
    // 目標量と現在の進捗量を設定
    targetAmount,
    currentAmount: targetAmount !== undefined ? 0 : undefined,
    // 完成数で管理する場合（targetAmount === undefined）、progressHistoryもundefinedにする
    progressHistory: targetAmount !== undefined ? [] : undefined,
    // 完成数の初期化（指定されていない場合は0で初期化、またはundefinedのまま）
    completedCount: workProgress.completedCount !== undefined ? workProgress.completedCount : undefined,
  };

  const updatedWorkProgresses = [...(appData.workProgresses || []), newWorkProgress];

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
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
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();

  // weightフィールドが変更された場合、目標量を再計算
  let targetAmount = existing.targetAmount;
  if (updates.weight !== undefined && updates.weight !== existing.weight) {
    targetAmount = extractTargetAmount(updates.weight);
    // 目標量が変更された場合、現在の進捗量を調整（目標量が削除された場合はundefined）
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
    // 目標量が削除される場合、関連するデータもクリア
    updates.currentAmount = undefined;
    updates.progressHistory = undefined;
  }

  // 進捗状態の変更を検出して日時を適切に設定
  let startedAt = existing.startedAt;
  let completedAt = existing.completedAt;

  if (updates.status !== undefined && updates.status !== existing.status) {
    const oldStatus = existing.status;
    const newStatus = updates.status;

    if (oldStatus === 'pending' && newStatus === 'in_progress') {
      // pending → in_progress: startedAtを設定
      startedAt = now;
    } else if (oldStatus === 'pending' && newStatus === 'completed') {
      // pending → completed: startedAtとcompletedAtを設定
      startedAt = now;
      completedAt = now;
    } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
      // in_progress → completed: completedAtを設定（startedAtがない場合は設定）
      if (!startedAt) {
        startedAt = now;
      }
      completedAt = now;
    } else if (oldStatus === 'completed' && newStatus === 'in_progress') {
      // completed → in_progress: completedAtを削除
      completedAt = undefined;
    } else if (oldStatus === 'completed' && newStatus === 'pending') {
      // completed → pending: startedAtとcompletedAtを削除
      startedAt = undefined;
      completedAt = undefined;
    } else if (oldStatus === 'in_progress' && newStatus === 'pending') {
      // in_progress → pending: startedAtを削除
      startedAt = undefined;
    }
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

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
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
      // 目標量が変更された場合、現在の進捗量を調整（目標量が削除された場合はundefined）
      if (targetAmount === undefined) {
        updateData.currentAmount = undefined;
        updateData.progressHistory = undefined;
      } else if (existing.currentAmount === undefined) {
        updateData.currentAmount = 0;
      }
    }

    // 進捗状態の変更を検出して日時を適切に設定
    let startedAt = existing.startedAt;
    let completedAt = existing.completedAt;

    if (updateData.status !== undefined && updateData.status !== existing.status) {
      const oldStatus = existing.status;
      const newStatus = updateData.status;

      if (oldStatus === 'pending' && newStatus === 'in_progress') {
        startedAt = now;
      } else if (oldStatus === 'pending' && newStatus === 'completed') {
        startedAt = now;
        completedAt = now;
      } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
        if (!startedAt) {
          startedAt = now;
        }
        completedAt = now;
      } else if (oldStatus === 'completed' && newStatus === 'in_progress') {
        completedAt = undefined;
      } else if (oldStatus === 'completed' && newStatus === 'pending') {
        startedAt = undefined;
        completedAt = undefined;
      } else if (oldStatus === 'in_progress' && newStatus === 'pending') {
        startedAt = undefined;
      }
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
    const updatedData: AppData = {
      ...appData,
      workProgresses: updatedWorkProgresses,
    };

    await saveUserData(userId, updatedData);
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

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗に完成数を追加
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param count 追加する完成数（数値）
 * @param memo メモ（任意）
 * @param appData 現在のAppData
 */
export async function addCompletedCountToWorkProgress(
  userId: string,
  workProgressId: string,
  count: number,
  appData: AppData,
  memo?: string
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();

  // 完成数を累積（マイナスの値も受け付ける）
  const completedCount = Math.max(0, (existing.completedCount || 0) + count);

  // 進捗履歴に新しいエントリを追加（完成数の追加も履歴として記録）
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount: count, // 完成数もamountとして記録（単位は異なるが、履歴として統一）
    memo: memo?.trim() || undefined,
  };

  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];

  // 進捗状態の自動変更
  let status = existing.status;
  let startedAt = existing.startedAt;

  // 完成数が0から増えた場合、pending → in_progress に自動変更
  const previousCount = existing.completedCount || 0;
  if (previousCount === 0 && completedCount > 0 && status === 'pending') {
    status = 'in_progress';
    // startedAtがない場合は設定
    if (!startedAt) {
      startedAt = now;
    }
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

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗に進捗量を追加
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param amount 追加する進捗量（kg単位、数値）
 * @param memo メモ（任意）
 * @param appData 現在のAppData
 */
export async function addProgressToWorkProgress(
  userId: string,
  workProgressId: string,
  amount: number,
  appData: AppData,
  memo?: string
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];

  // 目標量が設定されていない場合はエラー
  if (existing.targetAmount === undefined) {
    throw new Error('Target amount is not set');
  }

  const now = new Date().toISOString();

  // 進捗量を累積（負の値にならないように保護）
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

  // 進捗量が0から増えた場合、pending → in_progress に自動変更
  const previousAmount = existing.currentAmount || 0;
  if (previousAmount === 0 && currentAmount > 0 && status === 'pending') {
    status = 'in_progress';
    // startedAtがない場合は設定
    if (!startedAt) {
      startedAt = now;
    }
  }

  // 目標量に達した場合は進捗状態をcompletedに自動変更
  if (currentAmount >= existing.targetAmount && status !== 'completed') {
    status = 'completed';
    completedAt = now;
    // startedAtがない場合は設定
    if (!startedAt) {
      startedAt = now;
    }
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

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗をアーカイブ
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param appData 現在のAppData
 */
export async function archiveWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    archivedAt: now,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗のアーカイブを解除
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param appData 現在のAppData
 */
export async function unarchiveWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    archivedAt: undefined,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

/**
 * 進捗履歴エントリを更新
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param historyEntryId 更新する履歴エントリID
 * @param updates 更新するフィールド（amount, memo）
 * @param appData 現在のAppData
 */
export async function updateProgressHistoryEntry(
  userId: string,
  workProgressId: string,
  historyEntryId: string,
  updates: { amount?: number; memo?: string },
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];
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

  // progressHistory全体からcurrentAmountまたはcompletedCountを再計算
  let currentAmount: number | undefined;
  let completedCount: number | undefined;

  if (existing.targetAmount !== undefined) {
    // 進捗量モード：progressHistoryのamountの合計を計算
    currentAmount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    currentAmount = Math.max(0, currentAmount);
  } else {
    // 完成数モード：progressHistoryのamountの合計を計算（完成数として扱う）
    completedCount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    completedCount = Math.max(0, completedCount);
  }

  // 進捗状態の自動変更
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
      if (!startedAt) {
        startedAt = now;
      }
    }

    if (currentAmount >= existing.targetAmount && status !== 'completed') {
      status = 'completed';
      completedAt = now;
      if (!startedAt) {
        startedAt = now;
      }
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
        if (!startedAt) {
          startedAt = now;
        }
      }
    }
  }

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    completedCount,
    progressHistory: updatedHistory,
    status,
    startedAt,
    completedAt,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

/**
 * 進捗履歴エントリを削除
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param historyEntryId 削除する履歴エントリID
 * @param appData 現在のAppData
 */
export async function deleteProgressHistoryEntry(
  userId: string,
  workProgressId: string,
  historyEntryId: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);

  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }

  const existing = workProgresses[existingIndex];
  const progressHistory = existing.progressHistory || [];
  const historyEntryIndex = progressHistory.findIndex((entry) => entry.id === historyEntryId);

  if (historyEntryIndex < 0) {
    throw new Error(`Progress history entry with id ${historyEntryId} not found`);
  }

  const now = new Date().toISOString();

  // 履歴エントリを削除
  const updatedHistory = progressHistory.filter((entry) => entry.id !== historyEntryId);

  // progressHistory全体からcurrentAmountまたはcompletedCountを再計算
  let currentAmount: number | undefined;
  let completedCount: number | undefined;

  if (existing.targetAmount !== undefined) {
    // 進捗量モード：progressHistoryのamountの合計を計算
    currentAmount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    currentAmount = Math.max(0, currentAmount);
  } else {
    // 完成数モード：progressHistoryのamountの合計を計算（完成数として扱う）
    completedCount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    completedCount = Math.max(0, completedCount);
  }

  // 進捗状態の自動変更
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
      if (!startedAt) {
        startedAt = now;
      }
    }

    if (currentAmount >= existing.targetAmount && status !== 'completed') {
      status = 'completed';
      completedAt = now;
      if (!startedAt) {
        startedAt = now;
      }
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
        if (!startedAt) {
          startedAt = now;
        }
      }
    }
  }

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    completedCount,
    progressHistory: updatedHistory.length > 0 ? updatedHistory : undefined,
    status,
    startedAt,
    completedAt,
    updatedAt: now,
  };

  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;

  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };

  await saveUserData(userId, updatedData);
}

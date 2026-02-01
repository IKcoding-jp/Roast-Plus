import { useState } from 'react';
import type { AppData, WorkProgress, WorkProgressStatus } from '@/types';
import {
  addWorkProgress,
  updateWorkProgress,
  updateWorkProgresses,
  deleteWorkProgress,
  addProgressToWorkProgress,
  addCompletedCountToWorkProgress,
  archiveWorkProgress,
  unarchiveWorkProgress,
  updateProgressHistoryEntry,
  deleteProgressHistoryEntry,
} from '@/lib/firestore';

type WorkProgressInput = Partial<Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>>;

export function useWorkProgressActions(userId: string | undefined, data: AppData | undefined) {
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());
  const [editingHistoryEntryId, setEditingHistoryEntryId] = useState<string | null>(null);
  const [editingHistoryWorkProgressId, setEditingHistoryWorkProgressId] = useState<string | null>(null);

  const handleAddWorkProgress = async (workProgressData: WorkProgressInput) => {
    if (!userId || !data) return;
    const payload: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      ...workProgressData,
      status: workProgressData.status ?? 'pending',
    };
    await addWorkProgress(userId, payload, data);
  };

  const handleUpdateWorkProgress = async (id: string, updates: Partial<WorkProgress>) => {
    if (!userId || !data) return;
    await updateWorkProgress(userId, id, updates, data);
  };

  const handleDeleteWorkProgress = async (id: string) => {
    if (!userId || !data) return;
    await deleteWorkProgress(userId, id, data);
  };

  const handleStatusChange = async (id: string, status: WorkProgressStatus) => {
    if (!userId || !data) return;
    await updateWorkProgress(userId, id, { status }, data);
  };

  const handleArchiveWorkProgress = async (id: string) => {
    if (!userId || !data) return;
    await archiveWorkProgress(userId, id, data);
  };

  const handleUnarchiveWorkProgress = async (id: string) => {
    if (!userId || !data) return;
    await unarchiveWorkProgress(userId, id, data);
  };

  const handleAddProgress = async (id: string, amount: number, memo?: string) => {
    if (!userId || !data) return;
    const workProgress = data.workProgresses?.find((wp) => wp.id === id);
    if (!workProgress) return;

    if (workProgress.targetAmount !== undefined) {
      await addProgressToWorkProgress(userId, id, amount, data, memo);
    } else {
      await addCompletedCountToWorkProgress(userId, id, Math.floor(amount), data, memo);
    }
  };

  const handleUpdateGroup = async (oldGroupName: string, newData: { groupName: string }) => {
    if (!userId || !data?.workProgresses) return;
    const workProgresses = data.workProgresses.filter((wp) => wp.groupName === oldGroupName);
    const updates = new Map<string, Partial<Omit<WorkProgress, 'id' | 'createdAt'>>>();
    workProgresses.forEach((wp) => {
      updates.set(wp.id, { groupName: newData.groupName });
    });
    await updateWorkProgresses(userId, updates, data);
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!userId || !data?.workProgresses) return;
    const workProgresses = data.workProgresses.filter((wp) => wp.groupName === groupName);
    for (const wp of workProgresses) {
      await deleteWorkProgress(userId, wp.id, data);
    }
  };

  const handleEditHistory = (workProgressId: string, entryId: string) => {
    setEditingHistoryWorkProgressId(workProgressId);
    setEditingHistoryEntryId(entryId);
  };

  const handleUpdateProgressHistory = async (workProgressId: string, entryId: string, amount: number, memo?: string) => {
    if (!userId || !data) return;
    await updateProgressHistoryEntry(userId, workProgressId, entryId, { amount, memo }, data);
    setEditingHistoryWorkProgressId(null);
    setEditingHistoryEntryId(null);
  };

  const handleDeleteProgressHistory = async (workProgressId: string, entryId: string) => {
    if (!userId || !data) return;
    await deleteProgressHistoryEntry(userId, workProgressId, entryId, data);
    setEditingHistoryWorkProgressId(null);
    setEditingHistoryEntryId(null);
  };

  const clearEditingHistory = () => {
    setEditingHistoryWorkProgressId(null);
    setEditingHistoryEntryId(null);
  };

  const toggleHistory = (id: string) => {
    setExpandedHistoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return {
    expandedHistoryIds,
    editingHistoryEntryId,
    editingHistoryWorkProgressId,
    handleAddWorkProgress,
    handleUpdateWorkProgress,
    handleDeleteWorkProgress,
    handleStatusChange,
    handleArchiveWorkProgress,
    handleUnarchiveWorkProgress,
    handleAddProgress,
    handleUpdateGroup,
    handleDeleteGroup,
    handleEditHistory,
    handleUpdateProgressHistory,
    handleDeleteProgressHistory,
    clearEditingHistory,
    toggleHistory,
  };
}

export type { WorkProgressInput };

import { doc, getFirestore, runTransaction, serverTimestamp } from 'firebase/firestore';
import app from './firebase';
import type { WorkProgress, WorkProgressGoal, WorkProgressProgress, WorkProgressStatus } from '@/types';
import { normalizeWorkProgress, removeUndefinedFields, withStatusTransition, extractTargetAmount, extractUnit } from './workProgress';

export type WorkProgressDraft = {
  groupName?: string;
  taskName?: string;
  memo?: string;
  status?: WorkProgressStatus;
  goal?: Partial<WorkProgressGoal>;
  progress?: Partial<WorkProgressProgress>;
  weight?: string;
};

function getUserDocRef(userId: string) {
  return doc(getFirestore(app), 'users', userId);
}

function serializeWorkProgress(wp: WorkProgress) {
  return removeUndefinedFields({
    ...wp,
    goal: removeUndefinedFields(wp.goal),
    progress: removeUndefinedFields({
      ...wp.progress,
      history: wp.progress.history?.map((h) => removeUndefinedFields(h)),
    }),
  });
}

async function mutateWorkProgresses(
  userId: string,
  mutate: (list: WorkProgress[], nowIso: string) => WorkProgress[]
): Promise<WorkProgress[]> {
  const userDocRef = getUserDocRef(userId);
  const db = getFirestore(app);
  const nowIso = new Date().toISOString();

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(userDocRef);
    const data = snap.exists() ? snap.data() : { workProgresses: [] };
    const currentList: WorkProgress[] = Array.isArray(data.workProgresses)
      ? data.workProgresses.map(normalizeWorkProgress)
      : [];

    const nextList = mutate(currentList, nowIso).map((wp) => withStatusTransition(wp, nowIso));

    tx.set(
      userDocRef,
      {
        workProgresses: nextList.map((wp) => serializeWorkProgress(wp)),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return nextList;
  });

  return result;
}

function buildInitialFromDraft(draft: WorkProgressDraft, nowIso: string): WorkProgress {
  const mode = draft.goal?.mode ?? 'unset';
  const weight = draft.weight;
  const derivedTarget = draft.goal?.targetAmount ?? extractTargetAmount(weight);
  const unit = draft.goal?.unit ?? extractUnit(weight);
  const goal: WorkProgressGoal = {
    mode,
    targetAmount: mode === 'target' ? derivedTarget : undefined,
    unit: unit || undefined,
  };

  const progress: WorkProgressProgress = {
    currentAmount: mode === 'target' ? draft.progress?.currentAmount ?? 0 : undefined,
    completedCount: mode === 'count' ? draft.progress?.completedCount ?? 0 : undefined,
    history: undefined,
  };

  return {
    id: crypto.randomUUID(),
    groupName: draft.groupName?.trim() || undefined,
    taskName: draft.taskName?.trim() || undefined,
    memo: draft.memo?.trim() || undefined,
    status: draft.status ?? 'pending',
    startedAt: undefined,
    completedAt: undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
    goal,
    progress,
    weight,
    archivedAt: undefined,
  };
}

export async function addWorkProgressTx(userId: string, draft: WorkProgressDraft): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) => {
    const next = buildInitialFromDraft(draft, nowIso);
    return [...list, next];
  });
}

export async function updateWorkProgressTx(
  userId: string,
  workProgressId: string,
  updates: WorkProgressDraft
): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) => {
    const idx = list.findIndex((w) => w.id === workProgressId);
    if (idx < 0) return list;

    const existing = list[idx];
    const nextGoal: WorkProgressGoal = {
      mode: updates.goal?.mode ?? existing.goal.mode,
      targetAmount: updates.goal?.targetAmount ?? existing.goal.targetAmount,
      unit: updates.goal?.unit ?? existing.goal.unit,
    };

    const nextProgress: WorkProgressProgress = {
      currentAmount:
        updates.progress?.currentAmount !== undefined
          ? updates.progress.currentAmount
          : existing.progress.currentAmount,
      completedCount:
        updates.progress?.completedCount !== undefined
          ? updates.progress.completedCount
          : existing.progress.completedCount,
      history: existing.progress.history,
    };

    // モード切替時のクリア処理
    if (existing.goal.mode !== nextGoal.mode) {
      if (nextGoal.mode === 'target') {
        nextProgress.completedCount = undefined;
        nextProgress.currentAmount = nextProgress.currentAmount ?? 0;
      } else if (nextGoal.mode === 'count') {
        nextProgress.currentAmount = undefined;
        nextProgress.completedCount = nextProgress.completedCount ?? 0;
      } else {
        nextProgress.currentAmount = undefined;
        nextProgress.completedCount = undefined;
        nextProgress.history = undefined;
      }
    }

    const next: WorkProgress = {
      ...existing,
      groupName: updates.groupName?.trim() ?? existing.groupName,
      taskName: updates.taskName?.trim() ?? existing.taskName,
      memo: updates.memo?.trim() ?? existing.memo,
      status: updates.status ?? existing.status,
      goal: nextGoal,
      progress: nextProgress,
      weight: updates.weight ?? existing.weight,
      updatedAt: nowIso,
    };

    const copy = [...list];
    copy[idx] = next;
    return copy;
  });
}

export async function deleteWorkProgressTx(userId: string, workProgressId: string): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list) => list.filter((w) => w.id !== workProgressId));
}

export async function addProgressAmountTx(
  userId: string,
  workProgressId: string,
  amount: number,
  memo?: string
): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) => {
    const idx = list.findIndex((w) => w.id === workProgressId);
    if (idx < 0) return list;
    const wp = { ...list[idx] };

    if (wp.goal.mode !== 'target' || wp.goal.targetAmount === undefined) {
      throw new Error('Target amount is not set');
    }

    const current = Math.max(0, (wp.progress.currentAmount ?? 0) + amount);
    const history = [...(wp.progress.history ?? [])];
    history.push({
      id: crypto.randomUUID(),
      date: nowIso,
      amount,
      memo: memo?.trim() || undefined,
    });

    wp.progress = {
      ...wp.progress,
      currentAmount: current,
      history,
    };

    wp.updatedAt = nowIso;
    list[idx] = wp;
    return list;
  });
}

export async function addCompletedCountTx(
  userId: string,
  workProgressId: string,
  count: number,
  memo?: string
): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) => {
    const idx = list.findIndex((w) => w.id === workProgressId);
    if (idx < 0) return list;
    const wp = { ...list[idx] };

    if (wp.goal.mode === 'target') {
      throw new Error('This progress is managed by target amount');
    }

    const completed = Math.max(0, (wp.progress.completedCount ?? 0) + count);
    const history = [...(wp.progress.history ?? [])];
    history.push({
      id: crypto.randomUUID(),
      date: nowIso,
      amount: count,
      memo: memo?.trim() || undefined,
    });

    wp.goal = {
      ...wp.goal,
      mode: wp.goal.mode === 'unset' ? 'count' : wp.goal.mode,
    };
    wp.progress = {
      ...wp.progress,
      completedCount: completed,
      history,
    };
    wp.updatedAt = nowIso;
    list[idx] = wp;
    return list;
  });
}

export async function archiveWorkProgressTx(userId: string, workProgressId: string): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) => {
    return list.map((w) => (w.id === workProgressId ? { ...w, archivedAt: nowIso, updatedAt: nowIso } : w));
  });
}

export async function unarchiveWorkProgressTx(userId: string, workProgressId: string): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) => {
    return list.map((w) => (w.id === workProgressId ? { ...w, archivedAt: undefined, updatedAt: nowIso } : w));
  });
}

export async function bulkRenameGroupTx(
  userId: string,
  currentGroupName: string,
  nextGroupName?: string
): Promise<WorkProgress[]> {
  return mutateWorkProgresses(userId, (list, nowIso) =>
    list.map((w) =>
      w.groupName === currentGroupName
        ? {
            ...w,
            groupName: nextGroupName?.trim() || undefined,
            updatedAt: nowIso,
          }
        : w
    )
  );
}

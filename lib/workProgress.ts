import { Timestamp } from 'firebase/firestore';
import type {
  ProgressEntry,
  WorkProgress,
  WorkProgressGoal,
  WorkProgressMode,
  WorkProgressProgress,
  WorkProgressStatus,
} from '@/types';

const WEIGHT_REGEX = /^(\d+(?:\.\d+)?)(?:\s*(kg|g|個|枚|本|箱|袋|パック|セット|回|時間|日|週|ヶ月|年))?$/i;

export function toIsoString(value: any, fallback?: string): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const d = fallback ? new Date(fallback) : new Date();
  return d.toISOString();
}

export function extractTargetAmount(weight?: string): number | undefined {
  if (!weight) return undefined;
  const match = weight.trim().match(WEIGHT_REGEX);
  if (!match) return undefined;
  const amount = parseFloat(match[1]);
  if (Number.isNaN(amount)) return undefined;
  const unit = match[2]?.toLowerCase();
  if (unit === 'g') {
    // g表記はkg換算（将来の要件次第で拡張）
    return amount / 1000;
  }
  return amount;
}

export function extractUnit(weight?: string): string {
  if (!weight) return '';
  const match = weight.trim().match(WEIGHT_REGEX);
  return match && match[2] ? match[2] : '';
}

export function normalizeProgressEntry(entry: any, nowIso: string): ProgressEntry {
  return {
    id: typeof entry?.id === 'string' ? entry.id : crypto.randomUUID(),
    date: toIsoString(entry?.date, nowIso),
    amount: typeof entry?.amount === 'number' ? entry.amount : 0,
    memo: typeof entry?.memo === 'string' && entry.memo.trim().length > 0 ? entry.memo.trim() : undefined,
  };
}

export function normalizeWorkProgress(raw: any): WorkProgress {
  const nowIso = new Date().toISOString();
  const weight = typeof raw?.weight === 'string' ? raw.weight : undefined;
  const status: WorkProgressStatus = raw?.status ?? 'pending';
  const createdAt = toIsoString(raw?.createdAt, nowIso);
  const updatedAt = toIsoString(raw?.updatedAt, createdAt);
  const startedAt = raw?.startedAt ? toIsoString(raw.startedAt, createdAt) : undefined;
  const completedAt = raw?.completedAt ? toIsoString(raw.completedAt, createdAt) : undefined;
  const archivedAt = raw?.archivedAt ? toIsoString(raw.archivedAt, createdAt) : undefined;

  // goal
  let mode: WorkProgressMode = 'unset';
  let targetAmount: number | undefined;
  let unit: string | undefined;

  if (raw?.goal?.mode) {
    mode = raw.goal.mode as WorkProgressMode;
    targetAmount = typeof raw.goal.targetAmount === 'number' ? raw.goal.targetAmount : undefined;
    unit = typeof raw.goal.unit === 'string' ? raw.goal.unit : undefined;
  } else {
    const derivedTarget = typeof raw?.targetAmount === 'number' ? raw.targetAmount : extractTargetAmount(weight);
    const derivedUnit = extractUnit(weight);
    const hasCount = typeof raw?.completedCount === 'number';
    if (derivedTarget !== undefined) {
      mode = 'target';
      targetAmount = derivedTarget;
      unit = derivedUnit || unit;
    } else if (hasCount) {
      mode = 'count';
      unit = derivedUnit || unit;
    }
  }

  const goal: WorkProgressGoal = {
    mode,
    targetAmount,
    unit,
  };

  // progress
  const historyRaw = Array.isArray(raw?.progressHistory)
    ? raw.progressHistory
    : Array.isArray(raw?.progress?.history)
    ? raw.progress.history
    : [];

  const history: ProgressEntry[] = historyRaw.map((h: any) => normalizeProgressEntry(h, nowIso));

  const progress: WorkProgressProgress = {
    currentAmount:
      typeof raw?.progress?.currentAmount === 'number'
        ? raw.progress.currentAmount
        : typeof raw?.currentAmount === 'number'
        ? raw.currentAmount
        : undefined,
    completedCount:
      typeof raw?.progress?.completedCount === 'number'
        ? raw.progress.completedCount
        : typeof raw?.completedCount === 'number'
        ? raw.completedCount
        : undefined,
    history: history.length > 0 ? history : undefined,
  };

  return {
    id: typeof raw?.id === 'string' ? raw.id : crypto.randomUUID(),
    groupName: typeof raw?.groupName === 'string' && raw.groupName.trim() ? raw.groupName.trim() : undefined,
    taskName: typeof raw?.taskName === 'string' && raw.taskName.trim() ? raw.taskName.trim() : undefined,
    weight,
    status,
    memo: typeof raw?.memo === 'string' && raw.memo.trim() ? raw.memo.trim() : undefined,
    startedAt,
    completedAt,
    createdAt,
    updatedAt,
    goal,
    progress,
    archivedAt,
  };
}

export function progressPercentage(wp: WorkProgress): number {
  if (wp.goal.mode !== 'target' || wp.goal.targetAmount === undefined || wp.goal.targetAmount === 0) return 0;
  const percentage = ((wp.progress.currentAmount ?? 0) / wp.goal.targetAmount) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}

export function remainingAmount(wp: WorkProgress): number | null {
  if (wp.goal.mode !== 'target' || wp.goal.targetAmount === undefined) return null;
  return wp.goal.targetAmount - (wp.progress.currentAmount ?? 0);
}

export function formatAmount(amount: number, unit?: string): string {
  if (unit?.toLowerCase() === 'kg') {
    return amount.toFixed(1);
  }
  return Math.round(amount).toString();
}

export function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    Object.entries(obj as Record<string, any>).forEach(([k, v]) => {
      if (v === undefined) return;
      const cleanedValue = removeUndefinedFields(v);
      if (cleanedValue === undefined) return;
      if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) return;
      cleaned[k] = cleanedValue;
    });
    return cleaned as T;
  }
  return obj;
}

export function withStatusTransition(wp: WorkProgress, nowIso: string): WorkProgress {
  let startedAt = wp.startedAt;
  let completedAt = wp.completedAt;
  let status = wp.status;

  const progressMadeTarget = wp.goal.mode === 'target' && (wp.progress.currentAmount ?? 0) > 0;
  const progressMadeCount = wp.goal.mode === 'count' && (wp.progress.completedCount ?? 0) > 0;

  if (status === 'pending' && (progressMadeTarget || progressMadeCount)) {
    status = 'in_progress';
    if (!startedAt) startedAt = nowIso;
  }

  if (wp.goal.mode === 'target' && wp.goal.targetAmount !== undefined) {
    if ((wp.progress.currentAmount ?? 0) >= wp.goal.targetAmount && status !== 'completed') {
      status = 'completed';
      if (!startedAt) startedAt = nowIso;
      completedAt = nowIso;
    }
  }

  return {
    ...wp,
    status,
    startedAt,
    completedAt,
    updatedAt: nowIso,
  };
}

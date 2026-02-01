// チーム・メンバー管理の型定義

import type { FirestoreTimestamp } from './common';

export interface Team {
  id: string;
  name: string;
  order?: number;
}

export interface Member {
  id: string;
  name: string;
  teamId: string; // 所属班 ID
  excludedTaskLabelIds: string[]; // 割り当て除外ラベル
  active?: boolean;
  order?: number;
}

export interface Manager {
  id: string;
  name: string;
}

export interface TaskLabel {
  id: string;
  leftLabel: string;
  rightLabel?: string | null;
  order?: number;
}

export interface TaskLabelSnapshot {
  date: string; // YYYY-MM-DD
  labels: TaskLabel[];
}

export interface Assignment {
  teamId: string;
  taskLabelId: string;
  memberId: string | null;
  assignedDate: string; // YYYY-MM-DD
}

export interface AssignmentDay {
  date: string; // YYYY-MM-DD (document id)
  assignments: Assignment[];
  updatedAt?: FirestoreTimestamp;
  createdAt?: FirestoreTimestamp;
}

// シャッフル関連
export interface ShuffleEvent {
  date?: string; // document id (YYYY-MM-DD)
  // Legacy fields
  startTime?: string;
  targetDate?: string;
  shuffledAssignments?: Assignment[];
  // Extended fields for assignment feature
  eventId?: string;
  state?: 'running' | 'done';
  startedAt?: FirestoreTimestamp;
  durationMs?: number;
  resultAssignments?: Assignment[];
}

export interface ShuffleHistory {
  id: string; // UUID
  createdAt: FirestoreTimestamp;
  assignments: Assignment[];
  targetDate: string; // YYYY-MM-DD
}

// ペア除外設定（シャッフル時に同じ行に配置しない組み合わせ）
export interface PairExclusion {
  id: string;
  memberId1: string; // 正規化: memberId1 < memberId2
  memberId2: string;
  createdAt: FirestoreTimestamp; // Firestore Timestamp
}

// ペアのメンバーIDを正規化するヘルパー関数
export const normalizePairIds = (id1: string, id2: string): [string, string] => {
  return id1 < id2 ? [id1, id2] : [id2, id1];
};

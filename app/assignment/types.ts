import { Timestamp } from 'firebase/firestore';

export type Team = {
    id: string;
    name: string; // "A", "B" など
    order: number; // 表示順
};

export type Member = {
    id: string;
    name: string;
    isManager: boolean;              // 管理者かどうか。trueの場合、担当には含めない。
    excludedTaskLabelIds: string[];  // このメンバーが担当できない作業ラベルID一覧
};

export type TaskLabel = {
    id: string;
    name: string;
    order: number; // 表示順
};

export type Assignment = {
    teamId: string;
    taskLabelId: string;
    memberId: string | null; // null の場合は未割り当て
};

export type AssignmentDay = {
    date: string; // "YYYY-MM-DD"
    assignments: Assignment[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type ShuffleEvent = {
    date: string;                  // 対象日 (YYYY-MM-DD)
    eventId: string;               // 毎回ユニークなID
    startedAt: Timestamp;          // サーバー時刻
    durationMs: number;            // ルーレット演出時間（例: 3000）
    resultAssignments: Assignment[]; // 最終的な担当結果
    state: "running" | "done";     // シャッフル中 or 完了
};

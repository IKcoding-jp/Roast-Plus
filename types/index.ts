// 班（チーム）
export interface Team {
  id: string;
  name: string;
  order?: number;
}

// メンバー
export interface Member {
  id: string;
  name: string;
  teamId: string; // 所属班ID
  excludedTaskLabelIds: string[]; // 恒久除外ラベルIDの配列
  active?: boolean;
  order?: number;
}

// 作業ラベル
export interface TaskLabel {
  id: string;
  leftLabel: string; // 左ラベル（必須）
  rightLabel?: string | null; // 右ラベル（任意）
  order?: number;
}

// 割り当て（1つの担当）
export interface Assignment {
  teamId: string;
  taskLabelId: string;
  memberId: string | null;
  assignedDate: string; // YYYY-MM-DD形式
}

// アプリ全体のデータ構造
export interface AppData {
  teams: Team[];
  members: Member[];
  taskLabels: TaskLabel[];
  assignments: Assignment[]; // 現在の担当表（配列形式）
  assignmentHistory: Assignment[]; // 過去の履歴
}


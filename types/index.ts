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

// 時間ラベル（本日のスケジュール用）
export interface TimeLabel {
  id: string;
  time: string; // HH:mm形式
  content: string; // 内容
  memo?: string; // メモ（任意）
  order?: number; // 表示順序
}

// 本日のスケジュール（日次スケジュール）
export interface TodaySchedule {
  id: string;
  date: string; // YYYY-MM-DD形式
  timeLabels: TimeLabel[];
}

// ローストスケジュール
export interface RoastSchedule {
  id: string;
  time: string; // HH:mm形式
  bean: string; // 豆の種類
  settings?: string; // 設定
  roastLevel?: string; // 焙煎度
  bagCount?: number; // 袋数
  flags: {
    preheat?: boolean; // 予熱
    afterPurge?: boolean; // アフターパージ
    roast?: boolean; // ロースト
  };
  order?: number; // 時間順ソート用
}

// アプリ全体のデータ構造
export interface AppData {
  teams: Team[];
  members: Member[];
  taskLabels: TaskLabel[];
  assignments: Assignment[]; // 現在の担当表（配列形式）
  assignmentHistory: Assignment[]; // 過去の履歴
  todaySchedules: TodaySchedule[]; // 本日のスケジュール
  roastSchedules: RoastSchedule[]; // ローストスケジュール
}

// 通知
export type NotificationType = 'update' | 'announcement';

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD形式
  type: NotificationType;
}


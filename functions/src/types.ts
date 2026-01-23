// クライアント側の型定義と一致させる必要があるため、簡易的な型定義をここに配置
// 実際の型定義はクライアント側のtypes/index.tsを参照

export interface SubTask {
  id: string;
  content: string;
  assignee?: string; // 担当者名（自由入力）
  order: number;
}

export interface TimeLabel {
  id: string;
  time: string; // HH:mm形式
  content: string;
  memo?: string;
  order?: number;
  // === スケジュール機能改善で追加 ===
  assignee?: string; // メインタスクの担当者
  subTasks?: SubTask[]; // 連続タスク（小さい↓）
  continuesUntil?: string; // 時間経過終了時間（HH:mm）
}

export interface RoastSchedule {
  id: string;
  date: string; // YYYY-MM-DD形式
  time: string; // HH:mm形式（アフターパージの場合は空文字列も可）
  isRoasterOn?: boolean;
  isRoast?: boolean;
  isAfterPurge?: boolean;
  isChaffCleaning?: boolean;
  roastCount?: number;
  order?: number;
}


// 作業進捗関連の型定義

export type WorkProgressStatus = 'pending' | 'in_progress' | 'completed';

// 進捗記録エントリ
export interface ProgressEntry {
  id: string;
  date: string; // 日付（ISO 8601形式）
  amount: number; // 進捗量（数値、単位はweightフィールドから取得）
  memo?: string; // メモ（任意）
}

// 作業進捗
export interface WorkProgress {
  id: string;
  groupName?: string; // 作業グループ名（任意、グループ化に使用）
  weight?: string; // 数量（文字列、例：「10kg」「5個」「3枚」）（任意）
  taskName?: string; // 作業名（任意）
  status: WorkProgressStatus; // 進捗状態
  memo?: string; // メモ・備考（任意）
  startedAt?: string; // 開始日時（ISO 8601形式、進捗状態が「途中」になったときに記録）
  completedAt?: string; // 完了日時（ISO 8601形式、進捗状態が「済」になったときに記録）
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
  targetAmount?: number; // 目標量（数値、単位はweightフィールドから取得）
  currentAmount?: number; // 現在の進捗量（累積、数値、単位はweightフィールドから取得）
  progressHistory?: ProgressEntry[]; // 進捗記録の履歴
  completedCount?: number; // 完成数（目標量がない場合も記録可能、累積）
  archivedAt?: string; // アーカイブ日時（ISO 8601形式、アーカイブしたときに記録）
}

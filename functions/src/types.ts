// クライアント側の型定義と一致させる必要があるため、簡易的な型定義をここに配置
// 実際の型定義はクライアント側のtypes/index.tsを参照

export interface TimeLabel {
  id: string;
  time: string; // HH:mm形式
  content: string;
  memo?: string;
  order?: number;
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


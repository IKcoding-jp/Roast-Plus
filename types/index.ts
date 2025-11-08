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
  time: string; // HH:mm形式（アフターパージやチャフのお掃除の場合は空文字列も可）
  // メモタイプ（排他的）
  isRoasterOn?: boolean; // 焙煎機予熱
  isRoast?: boolean; // ロースト
  isAfterPurge?: boolean; // アフターパージ
  isChaffCleaning?: boolean; // チャフのお掃除
  // 焙煎機予熱用フィールド
  beanName?: string; // 豆の名前
  roastMachineMode?: 'G1' | 'G2' | 'G3'; // 焙煎機設定モード（豆選択で自動設定）
  weight?: 200 | 300 | 500; // 重さ（g）
  roastLevel?: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'; // 焙煎度合い
  // ロースト用フィールド
  roastCount?: number; // 何回目
  bagCount?: 1 | 2; // 袋数
  order?: number; // 時間順ソート用
}

// 試飲セッション
export interface TastingSession {
  id: string;
  name?: string; // セッション名（任意）
  beanName: string; // 豆の名前（必須）
  roastLevel: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'; // 焙煎度合い（必須）
  memo?: string; // メモ（任意）
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  userId: string; // ユーザーID
}

// 試飲記録
export interface TastingRecord {
  id: string;
  sessionId: string; // セッションID（必須）
  beanName: string; // 豆の名前
  tastingDate: string; // YYYY-MM-DD形式
  roastLevel: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'; // 焙煎度合い
  // 評価項目（1.0〜5.0、0.125刻み）
  bitterness: number; // 苦味
  acidity: number; // 酸味
  body: number; // ボディ
  sweetness: number; // 甘み
  aroma: number; // 香り
  overallRating: number; // 総合（おいしさ）
  overallImpression?: string; // 全体的な印象（テキスト）
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  userId: string; // ユーザーID
  memberId: string; // メンバーID（必須）
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
  tastingSessions: TastingSession[]; // 試飲セッション
  tastingRecords: TastingRecord[]; // 試飲記録
  notifications: Notification[]; // 通知
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


// Shared domain types used across RoastPlus.

// Import DripRecipe types from drip-guide
import type { DripRecipe, DripStep } from '../lib/drip-guide/types';

// Re-export DripRecipe types from drip-guide
export type { DripRecipe, DripStep };

export type RoastLevel = '浅煎り' | '中煎り' | '中深煎り' | '深煎り';
export type RoastWeight = 200 | 300 | 500;

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

export type FirestoreTimestamp = { seconds: number; nanoseconds: number } | string;

export interface AssignmentDay {
  date: string; // YYYY-MM-DD (document id)
  assignments: Assignment[];
  updatedAt?: FirestoreTimestamp;
  createdAt?: FirestoreTimestamp;
}

export interface TimeLabel {
  id: string;
  time: string; // HH:mm
  content: string;
  memo?: string;
  order?: number;
}

export interface TodaySchedule {
  id: string;
  date: string; // YYYY-MM-DD
  timeLabels: TimeLabel[];
}

export interface RoastSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (may be empty for after-purge)
  isRoasterOn?: boolean;
  isRoast?: boolean;
  isAfterPurge?: boolean;
  isChaffCleaning?: boolean;
  beanName?: string;
  beanName2?: string; // remix用の二種類目
  blendRatio?: string; // "3:5" のような表記
  roastMachineMode?: 'G1' | 'G2' | 'G3';
  weight?: RoastWeight;
  roastLevel?: RoastLevel;
  roastCount?: number;
  bagCount?: 1 | 2;
  order?: number;
}

export interface TastingSession {
  id: string;
  name?: string;
  beanName: string;
  roastLevel: RoastLevel;
  memo?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
}

export interface TastingRecord {
  id: string;
  sessionId: string;
  beanName: string;
  tastingDate: string; // YYYY-MM-DD
  roastLevel: RoastLevel;
  bitterness: number;
  acidity: number;
  body: number;
  sweetness: number;
  aroma: number;
  overallRating: number;
  overallImpression?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
  memberId: string;
}

export interface RoastTimerSettings {
  goToRoastRoomTimeSeconds: number;
  timerSoundEnabled: boolean;
  timerSoundFile: string;
  timerSoundVolume: number;
  notificationSoundEnabled: boolean;
  notificationSoundFile: string;
  notificationSoundVolume: number;
}

export interface UserSettings {
  selectedMemberId?: string; // 試飲記録用メンバー
  selectedManagerId?: string; // チェイス利用設定用
  roastTimerSettings?: RoastTimerSettings;
  taskLabelHeaderTextLeft?: string;
  taskLabelHeaderTextRight?: string;
}

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

export interface RoastTimerRecord {
  id: string;
  beanName: string;
  weight: RoastWeight;
  roastLevel: RoastLevel;
  duration: number; // seconds
  roastDate: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  userId: string;
  groupId?: string;
}

export type RoastTimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type RoastTimerDialogState = 'completion' | 'continuousRoast' | 'afterPurge' | null;

export interface RoastTimerState {
  status: RoastTimerStatus;
  duration: number; // seconds
  elapsed: number; // seconds
  remaining: number; // seconds
  pausedElapsed?: number; // cumulative paused seconds
  beanName?: string;
  weight?: RoastWeight;
  roastLevel?: RoastLevel;
  startedAt?: string; // ISO 8601
  pausedAt?: string; // ISO 8601
  lastUpdatedAt: string; // ISO 8601
  notificationId?: number;
  triggeredByDeviceId?: string;
  completedByDeviceId?: string;
  dialogState?: RoastTimerDialogState;
}

export interface TableSettings {
  colWidths: {
    taskLabel: number;
    note: number;
    teams: Record<string, number>;
  };
  rowHeights: Record<string, number>;
  headerLabels: {
    left: string;
    right: string;
  };
}

export interface AppData {
  todaySchedules: TodaySchedule[];
  roastSchedules: RoastSchedule[];
  tastingSessions: TastingSession[];
  tastingRecords: TastingRecord[];
  notifications: Notification[];
  userSettings?: UserSettings;
  shuffleEvent?: ShuffleEvent;
  encouragementCount?: number;
  roastTimerRecords: RoastTimerRecord[];
  roastTimerState?: RoastTimerState;
  defectBeans?: DefectBean[];
  defectBeanSettings?: DefectBeanSettings;
  workProgresses: WorkProgress[];
  dripRecipes?: DripRecipe[];
  changelogEntries?: ChangelogEntry[];
}

export type NotificationType = 'update' | 'announcement' | 'improvement' | 'request' | 'bugfix';

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  type: NotificationType;
  order?: number;
}

export interface DefectBean {
  id: string;
  name: string;
  imageUrl: string;
  characteristics: string;
  tasteImpact: string;
  removalReason: string;
  isMaster: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  createdBy?: string;
}

export type DefectBeanSettings = {
  [defectBeanId: string]: {
    shouldRemove: boolean;
  };
};

// 作業進捗状態

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

// 更新履歴・開発秘話のカテゴリ（レガシー、後方互換用）
export type ChangelogEntryType = 'update' | 'story' | 'feature' | 'bugfix' | 'improvement';

// 更新履歴・開発秘話エントリ（レガシー、後方互換用）
export interface ChangelogEntry {
  id: string;
  type: ChangelogEntryType; // カテゴリ
  title: string; // タイトル
  content: string; // 本文
  version?: string; // バージョン番号（例: "0.5.17"）
  date: string; // YYYY-MM-DD
  tags?: string[]; // タグ（例: ["UI", "焙煎", "Firebase"]）
  order?: number; // 表示順序
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}

// ========================================
// 開発秘話 - キャラクター対話形式
// ========================================

// キャラクターID
export type CharacterId = 'asairi' | 'fukairi';

// キャラクター設定
export interface Character {
  id: CharacterId;
  name: string; // 表示名（例: "アサイリちゃん"）
  shortName: string; // 短縮名（例: "アサイリ"）
  position: 'left' | 'right'; // 対話での表示位置
  bubbleColor: string; // 吹き出しの背景色
  textColor: string; // テキスト色
}

// 対話メッセージ
export interface DialogueMessage {
  id: string;
  characterId: CharacterId;
  content: string; // メッセージ内容（改行対応）
}

// 開発秘話エピソード
export interface DevStoryEpisode {
  id: string;
  title: string; // エピソードタイトル
  subtitle?: string; // サブタイトル（任意）
  imageUrl?: string; // エピソード画像URL（任意）
  dialogues: DialogueMessage[]; // 対話パート
  detailContent: string; // 詳細説明パート
  tags?: string[]; // タグ（例: ["UI", "焙煎", "新機能"]）
  publishedAt: string; // 公開日（YYYY-MM-DD）
  order: number; // 表示順序
}

// 更新履歴（設定ページ用シンプル版）
export interface VersionHistoryEntry {
  version: string; // バージョン番号（例: "0.5.18"）
  date: string; // リリース日（YYYY-MM-DD）
  summary?: string; // 簡単な説明（任意）
}


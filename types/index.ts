// Shared domain types used across RoastPlus.

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

export interface AssignmentDay {
  date: string; // YYYY-MM-DD (document id)
  assignments: Assignment[];
  updatedAt?: any;
  createdAt?: any;
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

export interface HandpickTimerSettings {
  soundEnabled: boolean;
  soundFile?: string;
  soundVolume?: number;
  startSoundEnabled: boolean;
  startSoundFile: string;
  startSoundVolume: number;
  completeSoundEnabled: boolean;
  completeSoundFile: string;
  completeSoundVolume: number;
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
  startedAt?: any;
  durationMs?: number;
  resultAssignments?: Assignment[];
}

export interface ShuffleHistory {
  id: string; // UUID
  createdAt: any;
  assignments: Assignment[];
  targetDate: string; // YYYY-MM-DD
}

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
  counterRecords: CounterRecord[];
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

export type WorkProgressStatus = 'pending' | 'in_progress' | 'completed';

export interface ProgressEntry {
  id: string;
  date: string; // ISO 8601
  amount: number;
  memo?: string;
}

export type WorkProgressMode = 'target' | 'count' | 'unset';

export interface WorkProgressGoal {
  mode: WorkProgressMode;
  targetAmount?: number; // used when mode = target
  unit?: string; // e.g. kg, 回
}

export interface WorkProgressProgress {
  currentAmount?: number; // for mode = target
  completedCount?: number; // for mode = count
  history?: ProgressEntry[];
}

export interface WorkProgress {
  id: string;
  groupName?: string;
  taskName?: string;
  weight?: string;
  status: WorkProgressStatus;
  memo?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  goal: WorkProgressGoal;
  progress: WorkProgressProgress;
  archivedAt?: string;
}

export interface CounterRecord {
  id: string;
  name: string;
  value: number;
  createdAt: string; // ISO 8601
  checked: boolean;
  type?: 'manual' | 'sum' | 'diff';
  sources?: { name: string; value: number }[];
}

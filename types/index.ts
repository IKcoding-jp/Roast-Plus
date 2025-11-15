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

// 管理者
export interface Manager {
  id: string;
  name: string;
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
  time: string; // HH:mm形式（アフターパージの場合は空文字列も可）
  // メモタイプ（排他的）
  isRoasterOn?: boolean; // 焙煎機予熱
  isRoast?: boolean; // ロースト
  isAfterPurge?: boolean; // アフターパージ
  isChaffCleaning?: boolean; // チャフのお掃除
  // 焙煎機予熱用フィールド
  beanName?: string; // 豆の名前
  beanName2?: string; // 2種類目の豆の名前（プレミックス用）
  blendRatio?: string; // ブレンド割合（例：「5:5」「8:2」形式）
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

// ローストタイマー設定
export interface RoastTimerSettings {
  goToRoastRoomTimeSeconds: number; // 焙煎室に行くまでの時間（秒、デフォルト60秒）
  timerSoundEnabled: boolean; // タイマー音の有効/無効
  timerSoundFile: string; // タイマー音ファイルパス（デフォルト: sounds/alarm/alarm01.mp3）
  timerSoundVolume: number; // タイマー音量（0.0～1.0、デフォルト0.5）
  notificationSoundEnabled: boolean; // 通知音の有効/無効
  notificationSoundFile: string; // 通知音ファイルパス
  notificationSoundVolume: number; // 通知音量（0.0～1.0）
}

// ユーザー設定
export interface UserSettings {
  selectedMemberId?: string; // 試飲感想記録用のメンバーID
  selectedManagerId?: string; // デバイス使用者設定用の管理者ID
  roastTimerSettings?: RoastTimerSettings; // ローストタイマー設定
}

// シャッフルイベント（マルチデバイス同期用）
export interface ShuffleEvent {
  startTime: string; // ISO 8601形式のタイムスタンプ
  shuffledAssignments: Assignment[]; // シャッフル結果
}

// ローストタイマー記録
export interface RoastTimerRecord {
  id: string;
  beanName: string; // 豆の名前
  weight: 200 | 300 | 500; // 重さ（g）
  roastLevel: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'; // 焙煎度合い
  duration: number; // 実際のロースト時間（秒）
  roastDate: string; // 焙煎日（YYYY-MM-DD形式）
  createdAt: string; // ISO 8601形式
  userId: string; // ユーザーID
  groupId?: string; // グループID（グループ記録用、オプショナル）
}

// ローストタイマー状態
export type RoastTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface RoastTimerState {
  status: RoastTimerStatus; // タイマーの状態
  duration: number; // 設定時間（秒）
  elapsed: number; // 経過時間（秒）
  remaining: number; // 残り時間（秒）
  beanName?: string; // 豆の名前
  weight?: 200 | 300 | 500; // 重さ（g）
  roastLevel?: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'; // 焙煎度合い
  startedAt?: string; // 開始時刻（ISO 8601形式）
  pausedAt?: string; // 一時停止時刻（ISO 8601形式）
  lastUpdatedAt: string; // 最終更新時刻（ISO 8601形式）
  notificationId?: number; // 通知ID（2=手動、3=おすすめ）
}

// アプリ全体のデータ構造
export interface AppData {
  teams: Team[];
  members: Member[];
  manager?: Manager; // 管理者（全体で1人のみ）
  taskLabels: TaskLabel[];
  assignments: Assignment[]; // 現在の担当表（配列形式）
  assignmentHistory: Assignment[]; // 過去の履歴
  todaySchedules: TodaySchedule[]; // 本日のスケジュール
  roastSchedules: RoastSchedule[]; // ローストスケジュール
  tastingSessions: TastingSession[]; // 試飲セッション
  tastingRecords: TastingRecord[]; // 試飲記録
  notifications: Notification[]; // 通知
  userSettings?: UserSettings; // ユーザー設定
  shuffleEvent?: ShuffleEvent; // シャッフルイベント（マルチデバイス同期用）
  encouragementCount?: number; // 応援カウント（全ユーザーで共有）
  roastTimerRecords: RoastTimerRecord[]; // ローストタイマー記録
  roastTimerState?: RoastTimerState; // ローストタイマー状態
  defectBeans?: DefectBean[]; // ユーザー追加欠点豆データ
  defectBeanSettings?: DefectBeanSettings; // 欠点豆設定（省く/省かない）
  workProgresses: WorkProgress[]; // 作業進捗
}

// 通知
export type NotificationType = 'update' | 'announcement' | 'improvement' | 'request' | 'bugfix';

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD形式
  type: NotificationType;
  order?: number; // 表示順序（開発者モードで並び替え可能）
}

// 欠点豆
export interface DefectBean {
  id: string;
  name: string; // 欠点豆の名称
  imageUrl: string; // Firebase Storageの画像URL
  characteristics: string; // 特徴（見た目の説明）
  tasteImpact: string; // 味への影響
  removalReason: string; // 省く理由
  isMaster: boolean; // マスターデータであることを示すフラグ
  order?: number; // 表示順序
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  userId?: string; // 追加したユーザーID（ユーザー追加データの場合）
  createdBy?: string; // 追加したメンバーID（ユーザー追加データの場合）
}

// 欠点豆設定（省く/省かない）
export type DefectBeanSettings = {
  [defectBeanId: string]: {
    shouldRemove: boolean; // true: 省く, false: 省かない
  };
};

// 作業進捗状態
export type WorkProgressStatus = 'pending' | 'in_progress' | 'completed';

// 進捗記録エントリ
export interface ProgressEntry {
  id: string;
  date: string; // 日付（ISO 8601形式）
  amount: number; // 進捗量（kg単位、数値）
  memo?: string; // メモ（任意）
}

// 作業進捗
export interface WorkProgress {
  id: string;
  beanName?: string; // 豆の名前（任意）
  weight?: string; // 重量（文字列、例：「10kg」）（任意）
  taskName?: string; // 作業名（任意）
  status: WorkProgressStatus; // 進捗状態
  memo?: string; // メモ・備考（任意）
  startedAt?: string; // 開始日時（ISO 8601形式、進捗状態が「途中」になったときに記録）
  completedAt?: string; // 完了日時（ISO 8601形式、進捗状態が「済」になったときに記録）
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
  targetAmount?: number; // 目標量（kg単位、数値）
  currentAmount?: number; // 現在の進捗量（累積、kg単位、数値）
  progressHistory?: ProgressEntry[]; // 進捗記録の履歴
}


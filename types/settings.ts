// 設定関連の型定義

import type { RoastTimerSettings } from './timer';

export interface UserSettings {
  selectedMemberId?: string; // 試飲記録用メンバー
  selectedManagerId?: string; // チェイス利用設定用
  roastTimerSettings?: RoastTimerSettings;
  taskLabelHeaderTextLeft?: string;
  taskLabelHeaderTextRight?: string;
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

// ユーザー同意情報
export interface UserConsent {
  hasAgreed: boolean;              // 同意済みフラグ
  agreedAt: string;                // 同意日時（ISO 8601）
  agreedTermsVersion: string;      // 同意した利用規約バージョン
  agreedPrivacyVersion: string;    // 同意したプライバシーポリシーバージョン
}

// 統合アプリデータ型
import type { TodaySchedule, RoastSchedule } from './schedule';
import type { TastingSession, TastingRecord } from './tasting';
import type { Notification } from './notification';
import type { ShuffleEvent } from './team';
import type { RoastTimerRecord, RoastTimerState } from './timer';
import type { DefectBean, DefectBeanSettings } from './defect-beans';
import type { WorkProgress } from './work-progress';
import type { DripRecipe } from './common';
import type { ChangelogEntry } from './changelog';

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
  userConsent?: UserConsent;
}

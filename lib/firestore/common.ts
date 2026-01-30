import {
  getFirestore,
  doc,
  Firestore,
} from 'firebase/firestore';
import app from '../firebase';
import type { AppData, UserSettings } from '@/types';

// Firestoreインスタンスのシングルトン管理
let db: Firestore | null = null;

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

export function getUserDocRef(userId: string) {
  return doc(getDb(), 'users', userId);
}

// undefinedのフィールドを削除する関数。Firestoreはundefinedを保存できないため。
export function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        const cleanedValue = removeUndefinedFields(value);
        // 空のオブジェクトを削除
        if (cleanedValue !== null && typeof cleanedValue === 'object' && !Array.isArray(cleanedValue)) {
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned as unknown as T;
  }

  return obj;
}

export const defaultData: AppData = {
  // 注意: teams, members, manager, taskLabels, assignments は
  // 別コレクションとして管理されているため、/teams, /members, /taskLabels, /assignmentDays として保存される
  todaySchedules: [],
  roastSchedules: [],
  tastingSessions: [],
  tastingRecords: [],
  notifications: [],
  encouragementCount: 0,
  roastTimerRecords: [],
  workProgresses: [],
  dripRecipes: [],
};

// データを正規化する関数。存在しないフィールドをデフォルト値で補完する。
export function normalizeAppData(data: Partial<AppData> | undefined | null): AppData {
  const normalized: AppData = {
    // 注意: teams, members, manager, taskLabels, assignments は
    // 別コレクションとして管理されているため、/teams, /members, /taskLabels, /assignmentDays として保存される
    todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
    roastSchedules: Array.isArray(data?.roastSchedules)
      ? data.roastSchedules.map((schedule) => ({
        ...schedule,
        // dateが存在しない場合は現在日時から日付部分を取得して補完する。
        date: schedule.date || new Date().toISOString().split('T')[0],
      }))
      : [],
    tastingSessions: Array.isArray(data?.tastingSessions)
      ? data.tastingSessions.map((session) => ({
        ...session,
        // aiAnalysis関連フィールドを保持
        aiAnalysis: typeof session.aiAnalysis === 'string' ? session.aiAnalysis : undefined,
        aiAnalysisUpdatedAt: typeof session.aiAnalysisUpdatedAt === 'string' ? session.aiAnalysisUpdatedAt : undefined,
        aiAnalysisRecordCount: typeof session.aiAnalysisRecordCount === 'number' ? session.aiAnalysisRecordCount : undefined,
      }))
      : [],
    tastingRecords: Array.isArray(data?.tastingRecords) ? data.tastingRecords : [],
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
    encouragementCount: typeof data?.encouragementCount === 'number' ? data.encouragementCount : 0,
    roastTimerRecords: Array.isArray(data?.roastTimerRecords)
      ? data.roastTimerRecords.map((record) => ({
        ...record,
        // roastDateが存在しない場合はcreatedAtから日付部分を取得、それもなければ現在日時の日付部分を使用
        roastDate:
          record.roastDate ||
          (record.createdAt ? record.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      }))
      : [],
    workProgresses: Array.isArray(data?.workProgresses)
      ? data.workProgresses.map((wp) => ({
        ...wp,
        completedCount: typeof wp.completedCount === 'number' ? wp.completedCount : undefined,
      }))
      : [],
  };

  // userSettingsは存在する場合のみ処理。selectedMemberId/selectedManagerIdがundefinedの場合はフィールドを削除する。
  if (data?.userSettings) {
    const cleanedUserSettings: Partial<UserSettings> = {};
    if (data.userSettings.selectedMemberId !== undefined) {
      cleanedUserSettings.selectedMemberId = data.userSettings.selectedMemberId;
    }
    if (data.userSettings.selectedManagerId !== undefined) {
      cleanedUserSettings.selectedManagerId = data.userSettings.selectedManagerId;
    }
    if (typeof data.userSettings.taskLabelHeaderTextLeft === 'string') {
      const trimmedLeft = data.userSettings.taskLabelHeaderTextLeft.trim();
      if (trimmedLeft.length > 0) {
        cleanedUserSettings.taskLabelHeaderTextLeft = trimmedLeft;
      }
    }
    if (typeof data.userSettings.taskLabelHeaderTextRight === 'string') {
      const trimmedRight = data.userSettings.taskLabelHeaderTextRight.trim();
      if (trimmedRight.length > 0) {
        cleanedUserSettings.taskLabelHeaderTextRight = trimmedRight;
      }
    }
    // roastTimerSettingsを正規化
    if (data.userSettings.roastTimerSettings && typeof data.userSettings.roastTimerSettings === 'object') {
      const settings = data.userSettings.roastTimerSettings;
      cleanedUserSettings.roastTimerSettings = {
        goToRoastRoomTimeSeconds: typeof settings.goToRoastRoomTimeSeconds === 'number' ? settings.goToRoastRoomTimeSeconds : 60,
        timerSoundEnabled: typeof settings.timerSoundEnabled === 'boolean' ? settings.timerSoundEnabled : true,
        timerSoundFile: typeof settings.timerSoundFile === 'string'
          ? settings.timerSoundFile.startsWith('/sounds/alarm/')
            ? settings.timerSoundFile.replace('/sounds/alarm/', '/sounds/roasttimer/')
            : settings.timerSoundFile
          : '/sounds/roasttimer/alarm.mp3',
        timerSoundVolume: typeof settings.timerSoundVolume === 'number' ? Math.max(0, Math.min(1, settings.timerSoundVolume)) : 0.5,
        notificationSoundEnabled: typeof settings.notificationSoundEnabled === 'boolean' ? settings.notificationSoundEnabled : true,
        notificationSoundFile: typeof settings.notificationSoundFile === 'string'
          ? settings.notificationSoundFile.startsWith('/sounds/alarm/')
            ? settings.notificationSoundFile.replace('/sounds/alarm/', '/sounds/roasttimer/')
            : settings.notificationSoundFile
          : '/sounds/roasttimer/alarm.mp3',
        notificationSoundVolume: typeof settings.notificationSoundVolume === 'number' ? Math.max(0, Math.min(1, settings.notificationSoundVolume)) : 0.5,
      };
    }
    if (Object.keys(cleanedUserSettings).length > 0) {
      normalized.userSettings = cleanedUserSettings;
    }
  }

  // shuffleEventは存在する場合のみ処理
  if (data?.shuffleEvent && typeof data.shuffleEvent === 'object') {
    if (
      typeof data.shuffleEvent.startTime === 'string' &&
      Array.isArray(data.shuffleEvent.shuffledAssignments)
    ) {
      normalized.shuffleEvent = {
        startTime: data.shuffleEvent.startTime,
        targetDate: typeof data.shuffleEvent.targetDate === 'string' ? data.shuffleEvent.targetDate : undefined,
        shuffledAssignments: data.shuffleEvent.shuffledAssignments,
      };
    }
  }

  // roastTimerStateは存在する場合のみ処理
  if (data?.roastTimerState && typeof data.roastTimerState === 'object') {
    normalized.roastTimerState = data.roastTimerState;
  }

  // defectBeansは存在する場合のみ処理
  if (Array.isArray(data?.defectBeans)) {
    normalized.defectBeans = data.defectBeans;
  }

  // defectBeanSettingsは存在する場合のみ処理
  if (data?.defectBeanSettings && typeof data.defectBeanSettings === 'object') {
    normalized.defectBeanSettings = data.defectBeanSettings;
  }

  // dripRecipesは存在する場合のみ処理
  if (Array.isArray(data?.dripRecipes)) {
    normalized.dripRecipes = data.dripRecipes;
  }

  // changelogEntriesは存在する場合のみ処理
  if (Array.isArray(data?.changelogEntries)) {
    normalized.changelogEntries = data.changelogEntries;
  }

  // userConsentは存在する場合のみ処理
  if (data?.userConsent && typeof data.userConsent === 'object') {
    const consent = data.userConsent;
    if (typeof consent.hasAgreed === 'boolean') {
      normalized.userConsent = {
        hasAgreed: consent.hasAgreed,
        agreedAt: typeof consent.agreedAt === 'string' ? consent.agreedAt : '',
        agreedTermsVersion: typeof consent.agreedTermsVersion === 'string' ? consent.agreedTermsVersion : '',
        agreedPrivacyVersion: typeof consent.agreedPrivacyVersion === 'string' ? consent.agreedPrivacyVersion : '',
      };
    }
  }

  return normalized;
}

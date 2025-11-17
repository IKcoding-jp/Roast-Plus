/**
 * ローストタイマー設定管理
 * Firestoreから設定を読み込み、メモリ上にキャッシュ
 */

import { getUserData, saveUserData } from './firestore';
import type { RoastTimerSettings, UserSettings } from '@/types';

// デフォルト設定
const DEFAULT_SETTINGS: RoastTimerSettings = {
  goToRoastRoomTimeSeconds: 60,
  timerSoundEnabled: false,
  timerSoundFile: '/sounds/alarm/alarm01.mp3',
  timerSoundVolume: 0.5,
  notificationSoundEnabled: true,
  notificationSoundFile: '/sounds/alarm/alarm01.mp3',
  notificationSoundVolume: 0.5,
};

// メモリ上のキャッシュ
let settingsCache: RoastTimerSettings | null = null;
let isLoading = false;
let loadPromise: Promise<RoastTimerSettings> | null = null;

/**
 * 設定を読み込む（キャッシュがあればそれを返す）
 */
export async function loadRoastTimerSettings(userId: string): Promise<RoastTimerSettings> {
  // キャッシュがあればそれを返す
  if (settingsCache) {
    return settingsCache;
  }

  // 既に読み込み中の場合は、そのPromiseを返す
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // 読み込み開始
  isLoading = true;
  loadPromise = (async () => {
    try {
      const data = await getUserData(userId);
      const settings = data.userSettings?.roastTimerSettings;
      
      if (settings) {
        // 設定が存在する場合は、デフォルト値とマージ
        settingsCache = {
          ...DEFAULT_SETTINGS,
          ...settings,
        };
      } else {
        // 設定が存在しない場合はデフォルト値を使用
        settingsCache = { ...DEFAULT_SETTINGS };
      }
      
      return settingsCache;
    } catch (error) {
      console.error('Failed to load roast timer settings:', error);
      // エラー時はデフォルト値を使用
      settingsCache = { ...DEFAULT_SETTINGS };
      return settingsCache;
    } finally {
      isLoading = false;
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * 設定を保存する
 */
export async function saveRoastTimerSettings(
  userId: string,
  settings: RoastTimerSettings,
  currentData: any
): Promise<void> {
  try {
    // キャッシュを更新
    settingsCache = { ...settings };

    // Firestoreに保存
    const updatedUserSettings: UserSettings = {
      ...currentData.userSettings,
      roastTimerSettings: settings,
    };

    const updatedData = {
      ...currentData,
      userSettings: updatedUserSettings,
    };

    await saveUserData(userId, updatedData);
  } catch (error) {
    console.error('Failed to save roast timer settings:', error);
    throw error;
  }
}

/**
 * キャッシュをクリア（設定画面から戻った時に再読み込みするため）
 */
export function clearRoastTimerSettingsCache(): void {
  settingsCache = null;
}

/**
 * 現在のキャッシュされた設定を取得（読み込み済みの場合のみ）
 */
export function getCachedRoastTimerSettings(): RoastTimerSettings | null {
  return settingsCache;
}


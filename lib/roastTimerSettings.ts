/**
 * ローストタイマー設定管理
 * LocalStorageから設定を読み込み、メモリ上にキャッシュ
 * 端末ごとに独立した設定を保存
 */

import { getRoastTimerSettings, setRoastTimerSettings } from './localStorage';
import { roastTimerSoundFiles } from './soundFiles';
import type { RoastTimerSettings } from '@/types';

// デフォルト設定: 実際に存在する最初のファイルを使用（なければ固定パスにフォールバック）
const DEFAULT_TIMER_SOUND = roastTimerSoundFiles[0]?.value || '/sounds/roasttimer/alarm.mp3';
const DEFAULT_SETTINGS: RoastTimerSettings = {
  goToRoastRoomTimeSeconds: 60,
  timerSoundEnabled: false,
  timerSoundFile: DEFAULT_TIMER_SOUND,
  timerSoundVolume: 1,
  notificationSoundEnabled: true,
  notificationSoundFile: DEFAULT_TIMER_SOUND,
  notificationSoundVolume: 1,
};

const allowedTimerSounds = new Set(roastTimerSoundFiles.map((s) => s.value));

const normalizePath = (path?: string): string => {
  if (!path || path.trim() === '') return DEFAULT_TIMER_SOUND;
  let normalized = path;
  if (normalized.startsWith('/sounds/alarm/')) {
    const fileName = normalized.replace('/sounds/alarm/', '');
    normalized = `/sounds/roasttimer/${fileName}`;
  }
  // 許可リストに無い場合はデフォルトにフォールバック
  if (!allowedTimerSounds.has(normalized)) {
    normalized = DEFAULT_TIMER_SOUND;
  }
  return normalized;
};

// メモリ上のキャッシュ
let settingsCache: RoastTimerSettings | null = null;
let isLoading = false;
let loadPromise: Promise<RoastTimerSettings> | null = null;

/**
 * 設定を読み込む（キャッシュがあればそれを返す）
 * userIdパラメータは互換性のため残しているが、使用しない
 */
export async function loadRoastTimerSettings(_userId?: string): Promise<RoastTimerSettings> {
  void _userId;
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
      const storedSettings = getRoastTimerSettings();
      
      if (storedSettings && typeof storedSettings === 'object' && !Array.isArray(storedSettings)) {
        // 設定が存在する場合は、デフォルト値とマージ
        const merged = {
          ...DEFAULT_SETTINGS,
          ...(storedSettings as Partial<RoastTimerSettings>),
        };

        // パスを正規化（存在しないファイルの場合もデフォルトへフォールバック）
        merged.timerSoundFile = normalizePath(merged.timerSoundFile);
        merged.notificationSoundFile = normalizePath(merged.notificationSoundFile);
        
        settingsCache = merged;
        
        // 移行が発生した場合は設定を保存
        if (settingsCache.timerSoundFile !== (storedSettings as Partial<RoastTimerSettings>).timerSoundFile ||
            settingsCache.notificationSoundFile !== (storedSettings as Partial<RoastTimerSettings>).notificationSoundFile) {
          saveRoastTimerSettings(settingsCache).catch((error) => {
            console.error('Failed to save migrated settings:', error);
          });
        }
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
 * 設定を保存する（LocalStorageに保存）
 * updateAppDataパラメータは互換性のため残しているが、使用しない
 */
export async function saveRoastTimerSettings(
  settings: RoastTimerSettings,
  _updateAppData?: unknown
): Promise<void> {
  void _updateAppData;
  try {
    // キャッシュを更新
    settingsCache = { ...settings };

    // LocalStorageに保存
    setRoastTimerSettings(settings);
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


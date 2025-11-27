/**
 * ハンドピックタイマー設定管理
 * LocalStorageから設定を読み込み、メモリ上にキャッシュ
 * 端末ごとに独立した設定を保存
 */

import { getHandpickTimerSettings, setHandpickTimerSettings } from './localStorage';
import type { HandpickTimerSettings } from '@/types';

// デフォルト設定
const DEFAULT_SETTINGS: HandpickTimerSettings = {
  soundEnabled: true,
  startSoundEnabled: true,
  startSoundFile: '/sounds/alarm/アラーム1.mp3',
  startSoundVolume: 0.5,
  completeSoundEnabled: true,
  completeSoundFile: '/sounds/alarm/アラーム1.mp3',
  completeSoundVolume: 0.5,
};

// メモリ上のキャッシュ
let settingsCache: HandpickTimerSettings | null = null;
let isLoading = false;
let loadPromise: Promise<HandpickTimerSettings> | null = null;

/**
 * 設定を読み込む（キャッシュがあればそれを返す）
 */
export async function loadHandpickTimerSettings(): Promise<HandpickTimerSettings> {
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
      const storedSettings = getHandpickTimerSettings();
      
      if (storedSettings && typeof storedSettings === 'object' && !Array.isArray(storedSettings)) {
        const stored = storedSettings as Partial<HandpickTimerSettings>;
        // 後方互換性: 古い設定（soundFile/soundVolume）がある場合は、開始音と完了音の両方に適用
        const mergedSettings: HandpickTimerSettings = {
          ...DEFAULT_SETTINGS,
          ...stored,
        };
        
        // 後方互換性の処理
        if (stored.soundFile && !stored.startSoundFile) {
          mergedSettings.startSoundFile = stored.soundFile;
        }
        if (stored.soundFile && !stored.completeSoundFile) {
          mergedSettings.completeSoundFile = stored.soundFile;
        }
        if (stored.soundVolume !== undefined && stored.startSoundVolume === undefined) {
          mergedSettings.startSoundVolume = stored.soundVolume;
        }
        if (stored.soundVolume !== undefined && stored.completeSoundVolume === undefined) {
          mergedSettings.completeSoundVolume = stored.soundVolume;
        }
        // 個別の有効/無効設定がない場合は、グローバル設定から引き継ぐ
        if (stored.startSoundEnabled === undefined) {
          mergedSettings.startSoundEnabled = stored.soundEnabled ?? true;
        }
        if (stored.completeSoundEnabled === undefined) {
          mergedSettings.completeSoundEnabled = stored.soundEnabled ?? true;
        }
        
        settingsCache = mergedSettings;
      } else {
        // 設定が存在しない場合はデフォルト値を使用
        settingsCache = { ...DEFAULT_SETTINGS };
      }
      
      return settingsCache;
    } catch (error) {
      console.error('Failed to load handpick timer settings:', error);
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
 */
export async function saveHandpickTimerSettings(
  settings: HandpickTimerSettings
): Promise<void> {
  try {
    // キャッシュを更新
    settingsCache = { ...settings };

    // LocalStorageに保存
    setHandpickTimerSettings(settings);
  } catch (error) {
    console.error('Failed to save handpick timer settings:', error);
    throw error;
  }
}

/**
 * キャッシュをクリア（設定画面から戻った時に再読み込みするため）
 */
export function clearHandpickTimerSettingsCache(): void {
  settingsCache = null;
}

/**
 * 現在のキャッシュされた設定を取得（読み込み済みの場合のみ）
 */
export function getCachedHandpickTimerSettings(): HandpickTimerSettings | null {
  return settingsCache;
}


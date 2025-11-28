import { getHandpickTimerSettings, setHandpickTimerSettings } from './localStorage';
import type { HandpickTimerSettings } from '@/types';

const DEFAULT_SETTINGS: HandpickTimerSettings = {
  soundEnabled: true,
  startSoundEnabled: true,
  startSoundFile: '/sounds/alarm/アラーム1.mp3',
  startSoundVolume: 0.5,
  completeSoundEnabled: true,
  completeSoundFile: '/sounds/alarm/アラーム1.mp3',
  completeSoundVolume: 0.5,
};

type StoredHandpickTimerSettings = Partial<HandpickTimerSettings> & {
  soundFile?: string;
  soundVolume?: number;
};

let settingsCache: HandpickTimerSettings | null = null;
let loadPromise: Promise<HandpickTimerSettings> | null = null;

const clampVolume = (value: unknown, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(1, Math.max(0, value));
};

const toBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback;

const normalizeSettings = (raw: unknown): HandpickTimerSettings => {
  const stored: StoredHandpickTimerSettings =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as StoredHandpickTimerSettings) : {};

  const merged: HandpickTimerSettings = {
    ...DEFAULT_SETTINGS,
    ...stored,
  };

  // Backward compatibility: migrate legacy soundFile / soundVolume
  if (stored.soundFile && !stored.startSoundFile) {
    merged.startSoundFile = stored.soundFile;
  }
  if (stored.soundFile && !stored.completeSoundFile) {
    merged.completeSoundFile = stored.soundFile;
  }

  merged.startSoundVolume = clampVolume(
    stored.startSoundVolume ?? stored.soundVolume ?? merged.startSoundVolume,
    DEFAULT_SETTINGS.startSoundVolume,
  );
  merged.completeSoundVolume = clampVolume(
    stored.completeSoundVolume ?? stored.soundVolume ?? merged.completeSoundVolume,
    DEFAULT_SETTINGS.completeSoundVolume,
  );

  merged.soundEnabled = toBoolean(stored.soundEnabled, DEFAULT_SETTINGS.soundEnabled);
  merged.startSoundEnabled = toBoolean(
    stored.startSoundEnabled ?? merged.soundEnabled,
    DEFAULT_SETTINGS.startSoundEnabled,
  );
  merged.completeSoundEnabled = toBoolean(
    stored.completeSoundEnabled ?? merged.soundEnabled,
    DEFAULT_SETTINGS.completeSoundEnabled,
  );

  return { ...merged };
};

/**
 * LocalStorageから設定を読み込み、メモリキャッシュに保持する。
 */
export async function loadHandpickTimerSettings(): Promise<HandpickTimerSettings> {
  if (settingsCache) {
    return settingsCache;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const storedSettings = getHandpickTimerSettings();
        settingsCache = normalizeSettings(storedSettings);
        return settingsCache;
      } catch (error) {
        console.error('Failed to load handpick timer settings:', error);
        settingsCache = { ...DEFAULT_SETTINGS };
        return settingsCache;
      } finally {
        loadPromise = null;
      }
    })();
  }

  return loadPromise;
}

/**
 * 設定を保存し、キャッシュを最新化する。
 */
export async function saveHandpickTimerSettings(settings: HandpickTimerSettings): Promise<void> {
  try {
    const normalized = normalizeSettings(settings);
    settingsCache = { ...normalized };
    setHandpickTimerSettings(normalized);
  } catch (error) {
    console.error('Failed to save handpick timer settings:', error);
    throw error;
  }
}

/**
 * キャッシュをクリアする（次回呼び出し時に再読込させるため）。
 */
export function clearHandpickTimerSettingsCache(): void {
  settingsCache = null;
  loadPromise = null;
}

/**
 * 現在キャッシュされている設定を取得（未読込の場合は null）。
 */
export function getCachedHandpickTimerSettings(): HandpickTimerSettings | null {
  return settingsCache;
}


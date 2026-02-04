import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RoastTimerSettings } from '@/types';

// モックの定義（ホイスティングのため、factoryの中で直接定義）
vi.mock('./soundFiles', () => ({
  roastTimerSoundFiles: [
    { value: '/sounds/roasttimer/alarm1.mp3', label: 'alarm1' },
    { value: '/sounds/roasttimer/alarm2.mp3', label: 'alarm2' },
    { value: '/sounds/roasttimer/bell.mp3', label: 'bell' },
  ],
}));

vi.mock('./localStorage', () => ({
  getRoastTimerSettings: vi.fn(),
  setRoastTimerSettings: vi.fn(),
}));

// モック後にインポート
import {
  loadRoastTimerSettings,
  saveRoastTimerSettings,
  clearRoastTimerSettingsCache,
  getCachedRoastTimerSettings,
} from './roastTimerSettings';
import { getRoastTimerSettings, setRoastTimerSettings as setLocalStorage } from './localStorage';

describe('roastTimerSettings', () => {
  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    clearRoastTimerSettingsCache();
    vi.clearAllMocks();
    // モックの実装もリセット
    vi.mocked(getRoastTimerSettings).mockReset();
    vi.mocked(setLocalStorage).mockReset();
  });

  describe('loadRoastTimerSettings', () => {
    it('初回読み込み時はデフォルト設定を返す（LocalStorageが空）', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      const settings = await loadRoastTimerSettings();

      expect(settings).toMatchObject({
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
        timerSoundFile: '/sounds/roasttimer/alarm1.mp3',
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm1.mp3',
        notificationSoundVolume: 1,
        settingsVersion: 1,
      });
    });

    it('保存された設定を正しく読み込む', async () => {
      const storedSettings: RoastTimerSettings = {
        goToRoastRoomTimeSeconds: 120,
        timerSoundEnabled: false,
        timerSoundFile: '/sounds/roasttimer/alarm2.mp3',
        timerSoundVolume: 0.5,
        notificationSoundEnabled: false,
        notificationSoundFile: '/sounds/roasttimer/bell.mp3',
        notificationSoundVolume: 0.8,
        settingsVersion: 1,
      };

      vi.mocked(getRoastTimerSettings).mockReturnValue(storedSettings);

      const settings = await loadRoastTimerSettings();

      expect(settings).toEqual(storedSettings);
    });

    it('部分的な設定の場合、デフォルト値とマージする', async () => {
      const partialSettings = {
        goToRoastRoomTimeSeconds: 90,
        timerSoundVolume: 0.7,
      };

      vi.mocked(getRoastTimerSettings).mockReturnValue(partialSettings as RoastTimerSettings);

      const settings = await loadRoastTimerSettings();

      expect(settings.goToRoastRoomTimeSeconds).toBe(90);
      expect(settings.timerSoundVolume).toBe(0.7);
      expect(settings.timerSoundEnabled).toBe(true); // デフォルト値
      expect(settings.settingsVersion).toBe(1); // デフォルト値
    });

    it('キャッシュがある場合は、LocalStorageを読まずにキャッシュを返す', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      // 1回目の読み込み
      await loadRoastTimerSettings();
      expect(getRoastTimerSettings).toHaveBeenCalledTimes(1);

      // 2回目の読み込み（キャッシュから）
      await loadRoastTimerSettings();
      expect(getRoastTimerSettings).toHaveBeenCalledTimes(1); // 増えない
    });

    it('マイグレーション: バージョン0→1でtimerSoundEnabledをtrueに強制更新', async () => {
      const oldSettings = {
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: false, // 旧設定ではfalse
        timerSoundFile: '/sounds/roasttimer/alarm1.mp3',
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm1.mp3',
        notificationSoundVolume: 1,
        settingsVersion: 0, // 旧バージョン
      };

      vi.mocked(getRoastTimerSettings).mockReturnValue(oldSettings as RoastTimerSettings);

      const settings = await loadRoastTimerSettings();

      expect(settings.timerSoundEnabled).toBe(true); // 強制的にtrue
      expect(settings.settingsVersion).toBe(1); // バージョン更新
      expect(setLocalStorage).toHaveBeenCalled(); // マイグレーション後に保存
    });

    it('パスの正規化: 存在しないパスはデフォルトにフォールバック', async () => {
      const settingsWithInvalidPath = {
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
        timerSoundFile: '/sounds/invalid/path.mp3', // 存在しないパス
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm1.mp3',
        notificationSoundVolume: 1,
        settingsVersion: 1,
      };

      vi.mocked(getRoastTimerSettings).mockReturnValue(settingsWithInvalidPath as RoastTimerSettings);

      const settings = await loadRoastTimerSettings();

      expect(settings.timerSoundFile).toBe('/sounds/roasttimer/alarm1.mp3'); // デフォルトにフォールバック
      expect(setLocalStorage).toHaveBeenCalled(); // 正規化後に保存
    });

    it('パスの正規化: 旧パス（/sounds/alarm/）を新パス（/sounds/roasttimer/）に変換', async () => {
      const settingsWithOldPath = {
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
        timerSoundFile: '/sounds/alarm/alarm1.mp3', // 旧パス
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/alarm/alarm2.mp3', // 旧パス
        notificationSoundVolume: 1,
        settingsVersion: 1,
      };

      vi.mocked(getRoastTimerSettings).mockReturnValue(settingsWithOldPath as RoastTimerSettings);

      const settings = await loadRoastTimerSettings();

      expect(settings.timerSoundFile).toBe('/sounds/roasttimer/alarm1.mp3');
      expect(settings.notificationSoundFile).toBe('/sounds/roasttimer/alarm2.mp3');
      expect(setLocalStorage).toHaveBeenCalled(); // 変換後に保存
    });

    it('エラー時はデフォルト設定を返す', async () => {
      vi.mocked(getRoastTimerSettings).mockImplementation(() => {
        throw new Error('LocalStorage error');
      });

      const settings = await loadRoastTimerSettings();

      expect(settings).toMatchObject({
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
        settingsVersion: 1,
      });
    });

    it('無効なデータ型（配列）の場合はデフォルト設定を返す', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue([] as unknown as RoastTimerSettings);

      const settings = await loadRoastTimerSettings();

      expect(settings).toMatchObject({
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
      });
    });

    it('無効なデータ型（null）の場合はデフォルト設定を返す', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      const settings = await loadRoastTimerSettings();

      expect(settings).toMatchObject({
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
      });
    });
  });

  describe('saveRoastTimerSettings', () => {
    it('設定を正しく保存する', async () => {
      const newSettings: RoastTimerSettings = {
        goToRoastRoomTimeSeconds: 120,
        timerSoundEnabled: false,
        timerSoundFile: '/sounds/roasttimer/alarm2.mp3',
        timerSoundVolume: 0.5,
        notificationSoundEnabled: false,
        notificationSoundFile: '/sounds/roasttimer/bell.mp3',
        notificationSoundVolume: 0.8,
        settingsVersion: 1,
      };

      await saveRoastTimerSettings(newSettings);

      expect(setLocalStorage).toHaveBeenCalledWith(newSettings);
    });

    it('保存後、キャッシュが更新される', async () => {
      const newSettings: RoastTimerSettings = {
        goToRoastRoomTimeSeconds: 120,
        timerSoundEnabled: false,
        timerSoundFile: '/sounds/roasttimer/alarm2.mp3',
        timerSoundVolume: 0.5,
        notificationSoundEnabled: false,
        notificationSoundFile: '/sounds/roasttimer/bell.mp3',
        notificationSoundVolume: 0.8,
        settingsVersion: 1,
      };

      await saveRoastTimerSettings(newSettings);

      const cached = getCachedRoastTimerSettings();
      expect(cached).toEqual(newSettings);
    });

    it('LocalStorageエラー時は例外をスローする', async () => {
      const newSettings: RoastTimerSettings = {
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
        timerSoundFile: '/sounds/roasttimer/alarm1.mp3',
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm1.mp3',
        notificationSoundVolume: 1,
        settingsVersion: 1,
      };

      vi.mocked(setLocalStorage).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      await expect(saveRoastTimerSettings(newSettings)).rejects.toThrow();
    });
  });

  describe('clearRoastTimerSettingsCache', () => {
    it('キャッシュをクリアする', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      // キャッシュを作成
      await loadRoastTimerSettings();
      expect(getCachedRoastTimerSettings()).not.toBeNull();

      // キャッシュをクリア
      clearRoastTimerSettingsCache();
      expect(getCachedRoastTimerSettings()).toBeNull();
    });

    it('キャッシュクリア後、再度loadすると LocalStorage を読む', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      // 1回目
      await loadRoastTimerSettings();
      expect(getRoastTimerSettings).toHaveBeenCalledTimes(1);

      // キャッシュクリア
      clearRoastTimerSettingsCache();

      // 2回目（キャッシュクリア後）
      await loadRoastTimerSettings();
      expect(getRoastTimerSettings).toHaveBeenCalledTimes(2); // 再度読み込み
    });
  });

  describe('getCachedRoastTimerSettings', () => {
    it('キャッシュがない場合はnullを返す', () => {
      expect(getCachedRoastTimerSettings()).toBeNull();
    });

    it('キャッシュがある場合は設定を返す', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      await loadRoastTimerSettings();

      const cached = getCachedRoastTimerSettings();
      expect(cached).not.toBeNull();
      expect(cached).toMatchObject({
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
      });
    });
  });

  describe('実際のユースケース', () => {
    it('初回起動: デフォルト設定を読み込む', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      const settings = await loadRoastTimerSettings();

      expect(settings.goToRoastRoomTimeSeconds).toBe(60);
      expect(settings.timerSoundEnabled).toBe(true);
      expect(settings.timerSoundVolume).toBe(1);
    });

    it('設定変更: 音量を0.5に変更して保存', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue(null);

      const settings = await loadRoastTimerSettings();
      settings.timerSoundVolume = 0.5;

      await saveRoastTimerSettings(settings);

      expect(setLocalStorage).toHaveBeenCalledWith(
        expect.objectContaining({ timerSoundVolume: 0.5 })
      );
    });

    it('設定画面から戻る: キャッシュをクリアして再読み込み', async () => {
      vi.mocked(getRoastTimerSettings).mockReturnValue({
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: true,
        timerSoundFile: '/sounds/roasttimer/alarm1.mp3',
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm1.mp3',
        notificationSoundVolume: 1,
        settingsVersion: 1,
      });

      // 初回読み込み
      await loadRoastTimerSettings();

      // 設定変更（LocalStorageを直接変更）
      vi.mocked(getRoastTimerSettings).mockReturnValue({
        goToRoastRoomTimeSeconds: 120,
        timerSoundEnabled: true,
        timerSoundFile: '/sounds/roasttimer/alarm2.mp3',
        timerSoundVolume: 0.8,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm2.mp3',
        notificationSoundVolume: 0.8,
        settingsVersion: 1,
      });

      // キャッシュクリア
      clearRoastTimerSettingsCache();

      // 再読み込み
      const newSettings = await loadRoastTimerSettings();
      expect(newSettings.goToRoastRoomTimeSeconds).toBe(120);
      expect(newSettings.timerSoundFile).toBe('/sounds/roasttimer/alarm2.mp3');
    });

    it('アプリ更新: バージョン0の設定を自動マイグレーション', async () => {
      const v0Settings = {
        goToRoastRoomTimeSeconds: 60,
        timerSoundEnabled: false, // v0ではfalseだった
        timerSoundFile: '/sounds/roasttimer/alarm1.mp3',
        timerSoundVolume: 1,
        notificationSoundEnabled: true,
        notificationSoundFile: '/sounds/roasttimer/alarm1.mp3',
        notificationSoundVolume: 1,
        settingsVersion: 0,
      };

      vi.mocked(getRoastTimerSettings).mockReturnValue(v0Settings as RoastTimerSettings);

      const settings = await loadRoastTimerSettings();

      // マイグレーション後
      expect(settings.settingsVersion).toBe(1);
      expect(settings.timerSoundEnabled).toBe(true); // 強制的に有効化
      expect(setLocalStorage).toHaveBeenCalled(); // 保存された
    });
  });
});

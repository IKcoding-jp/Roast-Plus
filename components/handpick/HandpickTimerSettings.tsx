/**
 * ハンドピックタイマー設定コンポーネント
 */

'use client';

import { useState, useEffect } from 'react';
import { Loading } from '@/components/Loading';
import {
  loadHandpickTimerSettings,
  saveHandpickTimerSettings,
} from '@/lib/handpickTimerSettings';
import { playNotificationSound, stopNotificationSound } from '@/lib/sounds';
import {
  handpickStartSoundFiles,
  handpickCompleteSoundFiles,
} from '@/lib/soundFiles';
import type { HandpickTimerSettings } from '@/types';

interface HandpickTimerSettingsProps {
  onClose: () => void;
}

export function HandpickTimerSettings({ onClose }: HandpickTimerSettingsProps) {
  const [settings, setSettings] = useState<HandpickTimerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingStartSound, setIsTestingStartSound] = useState(false);
  const [isTestingCompleteSound, setIsTestingCompleteSound] = useState(false);
  
  // 音声ファイル一覧はビルド時に生成された定数から直接取得
  const availableStartSoundFiles = handpickStartSoundFiles;
  const availableCompleteSoundFiles = handpickCompleteSoundFiles;

  useEffect(() => {
    loadHandpickTimerSettings()
      .then((loadedSettings) => {
        // 後方互換性: 古いパスが選択されている場合は新しいパスに移行
        const migratedSettings = { ...loadedSettings };
        if (loadedSettings.startSoundFile.startsWith('/sounds/alarm/')) {
          // 開始音の古いパス（/sounds/alarm/）を新しいパスに移行
          const fileName = loadedSettings.startSoundFile.replace('/sounds/alarm/', '');
          migratedSettings.startSoundFile = `/sounds/handpicktimer/start/${fileName}`;
        } else if (loadedSettings.startSoundFile.startsWith('/sounds/handpick/start/')) {
          // 開始音の旧パス（/sounds/handpick/start/）を新しいパスに移行
          const fileName = loadedSettings.startSoundFile.replace('/sounds/handpick/start/', '');
          migratedSettings.startSoundFile = `/sounds/handpicktimer/start/${fileName}`;
        }
        if (loadedSettings.completeSoundFile.startsWith('/sounds/alarm/')) {
          // 完了音の古いパス（/sounds/alarm/）を新しいパスに移行
          const fileName = loadedSettings.completeSoundFile.replace('/sounds/alarm/', '');
          migratedSettings.completeSoundFile = `/sounds/handpicktimer/complete/${fileName}`;
        } else if (loadedSettings.completeSoundFile.startsWith('/sounds/handpick/complete/')) {
          // 完了音の旧パス（/sounds/handpick/complete/）を新しいパスに移行
          const fileName = loadedSettings.completeSoundFile.replace('/sounds/handpick/complete/', '');
          migratedSettings.completeSoundFile = `/sounds/handpicktimer/complete/${fileName}`;
        }
        
        // 移行が発生した場合は設定を保存
        if (migratedSettings.startSoundFile !== loadedSettings.startSoundFile ||
            migratedSettings.completeSoundFile !== loadedSettings.completeSoundFile) {
          saveHandpickTimerSettings(migratedSettings).catch((error) => {
            console.error('Failed to save migrated settings:', error);
          });
        }
        
        setSettings(migratedSettings);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load settings:', error);
        setIsLoading(false);
      });
  }, []);

  // コンポーネントがアンマウントされる時に音を停止
  useEffect(() => {
    return () => {
      stopNotificationSound();
    };
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await saveHandpickTimerSettings(settings);
      // clearHandpickTimerSettingsCache() は削除
      // saveHandpickTimerSettings 内で既にキャッシュを更新しているため不要
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestStartSound = async () => {
    if (!settings) return;

    // 既存の音を停止
    stopNotificationSound();

    setIsTestingStartSound(true);
    try {
      const audio = await playNotificationSound(settings.startSoundFile, settings.startSoundVolume);
      if (audio) {
        // 音声の再生が完了したら状態をリセット
        audio.addEventListener('ended', () => {
          setIsTestingStartSound(false);
        }, { once: true });
        // エラーが発生した場合も状態をリセット
        audio.addEventListener('error', () => {
          setIsTestingStartSound(false);
        }, { once: true });
      } else {
        setIsTestingStartSound(false);
      }
    } catch (error) {
      console.error('Failed to play start sound:', error);
      alert('開始音の再生に失敗しました');
      setIsTestingStartSound(false);
    }
  };

  const handleTestCompleteSound = async () => {
    if (!settings) return;

    // 既存の音を停止
    stopNotificationSound();

    setIsTestingCompleteSound(true);
    try {
      const audio = await playNotificationSound(settings.completeSoundFile, settings.completeSoundVolume);
      if (audio) {
        // 音声の再生が完了したら状態をリセット
        audio.addEventListener('ended', () => {
          setIsTestingCompleteSound(false);
        }, { once: true });
        // エラーが発生した場合も状態をリセット
        audio.addEventListener('error', () => {
          setIsTestingCompleteSound(false);
        }, { once: true });
      } else {
        setIsTestingCompleteSound(false);
      }
    } catch (error) {
      console.error('Failed to play complete sound:', error);
      alert('完了音の再生に失敗しました');
      setIsTestingCompleteSound(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Loading fullScreen={false} />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">ハンドピックタイマー設定</h2>

      <div className="space-y-6">
        {/* サウンド設定 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">サウンド設定</h3>

          <div className="space-y-4">
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      soundEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm sm:text-base text-gray-700">サウンドを有効にする</span>
              </label>
            </div>

            {settings.soundEnabled && (
              <div className="space-y-6">
                {/* 開始音設定 */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.startSoundEnabled}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              startSoundEnabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <h4 className="text-base font-semibold text-gray-800">開始音</h4>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestStartSound}
                      disabled={isTestingStartSound || !settings.startSoundEnabled}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm sm:text-base min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isTestingStartSound ? '再生中...' : 'テスト'}
                    </button>
                  </div>
                  {settings.startSoundEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                          音量: {Math.round(settings.startSoundVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.startSoundVolume}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              startSoundVolume: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                          サウンド
                        </label>
                        <select
                          value={settings.startSoundFile}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              startSoundFile: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                        >
                          {availableStartSoundFiles.map((file) => (
                            <option key={file.value} value={file.value}>
                              {file.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 完了音設定 */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.completeSoundEnabled}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              completeSoundEnabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <h4 className="text-base font-semibold text-gray-800">完了音</h4>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestCompleteSound}
                      disabled={isTestingCompleteSound || !settings.completeSoundEnabled}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm sm:text-base min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isTestingCompleteSound ? '再生中...' : 'テスト'}
                    </button>
                  </div>
                  {settings.completeSoundEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                          音量: {Math.round(settings.completeSoundVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.completeSoundVolume}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              completeSoundVolume: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                          サウンド
                        </label>
                        <select
                          value={settings.completeSoundFile}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              completeSoundFile: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                        >
                          {availableCompleteSoundFiles.map((file) => (
                            <option key={file.value} value={file.value}>
                              {file.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 justify-end mt-6 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-base sm:text-lg min-h-[44px]"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors text-base sm:text-lg min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </>
  );
}


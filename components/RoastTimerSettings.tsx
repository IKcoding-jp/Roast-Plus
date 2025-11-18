'use client';

import { useState, useEffect } from 'react';
import { Loading } from '@/components/Loading';
import {
  loadRoastTimerSettings,
  saveRoastTimerSettings,
  clearRoastTimerSettingsCache,
} from '@/lib/roastTimerSettings';
import { playTimerSound, stopTimerSound } from '@/lib/sounds';
import type { RoastTimerSettings } from '@/types';

interface RoastTimerSettingsProps {
  onClose: () => void;
}

export function RoastTimerSettings({ onClose }: RoastTimerSettingsProps) {
  const [settings, setSettings] = useState<RoastTimerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);

  useEffect(() => {
    loadRoastTimerSettings()
      .then((loadedSettings) => {
        setSettings(loadedSettings);
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
      stopTimerSound();
    };
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await saveRoastTimerSettings(settings);
      clearRoastTimerSettingsCache();
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSound = async () => {
    if (!settings) return;

    // 既存の音を停止
    stopTimerSound();

    setIsTestingSound(true);
    try {
      const audio = await playTimerSound(settings.timerSoundFile, settings.timerSoundVolume);
      if (audio) {
        // 音声の再生が完了したら状態をリセット
        audio.addEventListener('ended', () => {
          setIsTestingSound(false);
        }, { once: true });
        // エラーが発生した場合も状態をリセット
        audio.addEventListener('error', () => {
          setIsTestingSound(false);
        }, { once: true });
      } else {
        setIsTestingSound(false);
      }
    } catch (error) {
      console.error('Failed to play test sound:', error);
      alert('サウンドの再生に失敗しました');
      setIsTestingSound(false);
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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">タイマー設定</h2>

      <div className="space-y-6">
        {/* 焙煎室に行くまでの時間 */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            焙煎室に行くまでの時間（秒）
          </label>
          <input
            type="number"
            min="1"
            value={settings.goToRoastRoomTimeSeconds}
            onChange={(e) =>
              setSettings({
                ...settings,
                goToRoastRoomTimeSeconds: parseInt(e.target.value, 10) || 60,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
          />
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            おすすめ焙煎タイマーで使用される時間です。平均焙煎時間からこの秒数を引いた値がおすすめタイマー時間として提案されます。
          </p>
        </div>

        {/* タイマー音の設定 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">タイマー音</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.timerSoundEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timerSoundEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm sm:text-base text-gray-700">タイマー音を有効にする</span>
              </label>
              {settings.timerSoundEnabled && (
                <button
                  type="button"
                  onClick={handleTestSound}
                  disabled={isTestingSound}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm sm:text-base min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isTestingSound ? '再生中...' : 'テスト'}
                </button>
              )}
            </div>

            {settings.timerSoundEnabled && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  音量: {Math.round(settings.timerSoundVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.timerSoundVolume}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timerSoundVolume: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
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
    </div>
  );
}


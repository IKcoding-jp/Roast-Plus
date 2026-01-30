'use client';

import { useState, useCallback } from 'react';
import {
  type ClockSettings,
  DEFAULT_CLOCK_SETTINGS,
  getClockSettings,
  setClockSettings,
} from '@/lib/clockSettings';

function loadInitialSettings(): ClockSettings {
  if (typeof window === 'undefined') return DEFAULT_CLOCK_SETTINGS;
  return getClockSettings();
}

export function useClockSettings() {
  const [settings, setSettings] = useState<ClockSettings>(loadInitialSettings);
  const isLoaded = typeof window !== 'undefined';

  // 設定更新（即座にlocalStorageに保存）
  const updateSettings = useCallback((patch: Partial<ClockSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setClockSettings(next);
      return next;
    });
  }, []);

  // 設定リセット
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_CLOCK_SETTINGS);
    setClockSettings(DEFAULT_CLOCK_SETTINGS);
  }, []);

  return { settings, isLoaded, updateSettings, resetSettings };
}

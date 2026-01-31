'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import type { AppData } from '@/types';
import { getDeviceId } from '@/lib/localStorage';
import { ensureServerTimeSync, setTimeSyncUser } from '@/lib/timeSync';
import { useTimerState } from './roast-timer/useTimerState';
import { useTimerNotifications } from './roast-timer/useTimerNotifications';
import { useTimerPersistence } from './roast-timer/useTimerPersistence';
import { useTimerControls } from './roast-timer/useTimerControls';

type UpdateAppDataFn = (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void>;

interface UseRoastTimerArgs {
  data: AppData | null;
  updateData: UpdateAppDataFn;
  isLoading: boolean;
}

/**
 * ローストタイマーの統合カスタムフック
 *
 * 以下の4つのカスタムフックを統合:
 * - useTimerState: タイマー状態管理
 * - useTimerNotifications: 通知・音声管理
 * - useTimerPersistence: データ永続化
 * - useTimerControls: タイマー操作
 */
export function useRoastTimer({ data, updateData, isLoading }: UseRoastTimerArgs) {
  const { user } = useAuth();
  const currentDeviceId = getDeviceId();
  const userId = user?.uid ?? null;

  // サーバー時刻同期の初期化
  useEffect(() => {
    setTimeSyncUser(userId);
    if (userId) {
      ensureServerTimeSync().catch((error) => {
        console.error('Failed to initialize roast timer time-sync:', error);
      });
    }
  }, [userId]);

  // 1. タイマー状態管理
  const stateManager = useTimerState();

  // 2. 通知・音声管理
  const notifications = useTimerNotifications();

  // 3. データ永続化
  useTimerPersistence({
    user,
    data,
    updateData,
    isLoading,
    stateManager,
    currentDeviceId,
  });

  // 4. タイマー操作
  const controls = useTimerControls({
    user,
    updateData,
    isLoading,
    stateManager,
    notifications,
    currentDeviceId,
  });

  // 外部インターフェース(後方互換性を維持)
  return {
    state: stateManager.localState,
    startTimer: controls.startTimer,
    pauseTimer: controls.pauseTimer,
    resumeTimer: controls.resumeTimer,
    resetTimer: controls.resetTimer,
    skipTimer: controls.skipTimer,
    stopSound: notifications.stopSound,
  };
}

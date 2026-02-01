'use client';

import { useCallback } from 'react';
import type { AppData, RoastTimerState } from '@/types';
import { setRoastTimerState as saveLocalState } from '@/lib/localStorage';
import { stopAllSounds, stopAudio } from '@/lib/sounds';
import { getSyncedTimestamp, getSyncedTimestampSync } from '@/lib/timeSync';
import { calculateElapsedTime } from './useTimerState';
import type { UseTimerStateReturn } from './useTimerState';
import type { UseTimerNotificationsReturn } from './useTimerNotifications';
import { useTimerUpdater } from './useTimerUpdater';

type UpdateAppDataFn = (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void>;

export interface UseTimerControlsArgs {
  user: { uid: string } | null;
  updateData: UpdateAppDataFn;
  isLoading: boolean;
  stateManager: UseTimerStateReturn;
  notifications: UseTimerNotificationsReturn;
  currentDeviceId: string;
}

export interface UseTimerControlsReturn {
  startTimer: (
    duration: number,
    beanName?: string,
    weight?: 200 | 300 | 500,
    roastLevel?: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  ) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  skipTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
}

/**
 * タイマー操作フック
 * - タイマーの開始/一時停止/再開/スキップ/リセット
 * - 定期更新とバックグラウンド復帰は useTimerUpdater に委譲
 */
export function useTimerControls({
  user,
  updateData,
  isLoading,
  stateManager,
  notifications,
  currentDeviceId,
}: UseTimerControlsArgs): UseTimerControlsReturn {
  const {
    localState,
    setLocalState,
    lastUpdateRef,
    pausedElapsedRef,
    hasResetRef,
  } = stateManager;

  const {
    soundAudioRef,
    prepareTimerSound,
    prepareNotificationSound,
  } = notifications;

  // タイマー更新処理（定期更新・バックグラウンド復帰・完了処理）
  const { completeTimer } = useTimerUpdater({
    user,
    updateData,
    isLoading,
    stateManager,
    notifications,
    currentDeviceId,
  });

  // タイマーを開始
  const startTimer = useCallback(
    async (
      duration: number,
      beanName?: string,
      weight?: 200 | 300 | 500,
      roastLevel?: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
    ) => {
      if (!user || isLoading) {
        throw new Error('User is not authenticated or data is loading');
      }

      // 一時停止の累積時間をリセット
      pausedElapsedRef.current = 0;

      // 通知音の準備(アンロック)
      // ユーザーインタラクション内で実行する必要がある
      await prepareTimerSound();
      await prepareNotificationSound();

      // サーバー時刻の取得を試みる(失敗した場合はローカル時刻を使用)
      let startedAtMs: number;
      try {
        startedAtMs = await getSyncedTimestamp();
      } catch (error) {
        console.warn('Failed to get synced timestamp, using local time:', error);
        startedAtMs = Date.now();
      }
      const startedAt = new Date(startedAtMs).toISOString();
      const newState: RoastTimerState = {
        status: 'running',
        duration,
        elapsed: 0,
        remaining: duration,
        pausedElapsed: 0,
        beanName,
        weight,
        roastLevel,
        startedAt,
        lastUpdatedAt: startedAt,
        triggeredByDeviceId: currentDeviceId,
      };

      // ローカル状態を更新
      saveLocalState(newState);
      setLocalState(newState);
      lastUpdateRef.current = Date.now();

      // Firestoreに保存
      try {
        await updateData((currentData) => ({
          ...currentData,
          roastTimerState: newState,
        }));
      } catch (error) {
        console.error('Failed to save roast timer state to Firestore:', error);
        throw error; // Firestoreへの保存に失敗した場合はエラーを投げる
      }
    },
    [user, updateData, currentDeviceId, isLoading, prepareTimerSound, prepareNotificationSound, pausedElapsedRef, setLocalState, lastUpdateRef]
  );

  // タイマーを一時停止
  const pauseTimer = useCallback(async () => {
    if (!localState || localState.status !== 'running' || !user || isLoading) return;

    const pausedElapsed = localState.pausedElapsed ?? pausedElapsedRef.current ?? 0;
    pausedElapsedRef.current = pausedElapsed;
    // 現在の経過時間を計算
    const elapsed = calculateElapsedTime(
      localState.startedAt,
      localState.pausedAt,
      pausedElapsed,
      localState.status
    );

    const pausedAt = new Date(await getSyncedTimestamp()).toISOString();
    const updatedState: RoastTimerState = {
      ...localState,
      status: 'paused',
      pausedAt,
      pausedElapsed,
      elapsed,
      remaining: Math.max(0, localState.duration - elapsed),
      lastUpdatedAt: pausedAt,
      triggeredByDeviceId: currentDeviceId,
    };

    // ローカル状態を更新
    saveLocalState(updatedState);
    setLocalState(updatedState);

    // Firestoreに保存
    try {
      await updateData((currentData) => ({
        ...currentData,
        roastTimerState: updatedState,
      }));
    } catch (error) {
      console.error('Failed to save roast timer state to Firestore:', error);
    }
  }, [localState, user, updateData, currentDeviceId, isLoading, pausedElapsedRef, setLocalState]);

  // タイマーを再開
  const resumeTimer = useCallback(async () => {
    if (!localState || localState.status !== 'paused' || !user || isLoading) return;

    // 通知音の準備(アンロック)
    // ユーザーインタラクション内で実行する必要がある
    await prepareTimerSound();
    await prepareNotificationSound();

    const basePausedElapsed = localState.pausedElapsed ?? pausedElapsedRef.current ?? 0;
    let newPausedElapsed = basePausedElapsed;
    // 一時停止期間を累積時間に加算
    if (localState.pausedAt && localState.startedAt) {
      const pausedTime = new Date(localState.pausedAt).getTime();
      const resumeTime = getSyncedTimestampSync();
      const pauseDuration = (resumeTime - pausedTime) / 1000; // 秒単位
      newPausedElapsed = basePausedElapsed + pauseDuration;
    }
    pausedElapsedRef.current = newPausedElapsed;

    const resumedAt = new Date(await getSyncedTimestamp()).toISOString();
    const updatedState: RoastTimerState = {
      ...localState,
      status: 'running',
      pausedAt: undefined,
      pausedElapsed: newPausedElapsed,
      lastUpdatedAt: resumedAt,
      triggeredByDeviceId: currentDeviceId,
    };

    // ローカル状態を更新
    saveLocalState(updatedState);
    setLocalState(updatedState);
    lastUpdateRef.current = Date.now();

    // Firestoreに保存
    try {
      await updateData((currentData) => ({
        ...currentData,
        roastTimerState: updatedState,
      }));
    } catch (error) {
      console.error('Failed to save roast timer state to Firestore:', error);
    }
  }, [localState, user, updateData, currentDeviceId, isLoading, prepareTimerSound, prepareNotificationSound, pausedElapsedRef, setLocalState, lastUpdateRef]);

  // タイマーをスキップ(即座に完了)
  const skipTimer = useCallback(async () => {
    if (!localState || !user || isLoading) return;

    // 一時停止の累積時間をリセット
    pausedElapsedRef.current = 0;

    await completeTimer(localState);
  }, [localState, user, isLoading, completeTimer, pausedElapsedRef]);

  // タイマーをリセット
  const resetTimer = useCallback(async () => {
    if (!user || isLoading) return;

    // リセットフラグを設定(状態を読み込まないようにする)
    hasResetRef.current = true;

    // 一時停止の累積時間をリセット
    pausedElapsedRef.current = 0;

    // サウンドを停止
    if (soundAudioRef.current) {
      stopAudio(soundAudioRef.current);
      soundAudioRef.current = null;
    }
    stopAllSounds();

    // ローカル状態をクリア
    saveLocalState(null);
    setLocalState(null);
    pausedElapsedRef.current = 0;

    // Firestoreから削除(確実に削除するため、awaitで待機)
    try {
      await updateData((currentData) => ({
        ...currentData,
        roastTimerState: undefined,
      }));
      // 削除が完了したら、リセットフラグを維持(次のuseEffect実行時まで)
      // ただし、Firestoreの状態変更監視により、undefinedが反映されるまで待つ
    } catch (error) {
      console.error('Failed to delete roast timer state from Firestore:', error);
      // エラーが発生しても、リセットフラグは維持する
    }
  }, [user, updateData, isLoading, hasResetRef, pausedElapsedRef, soundAudioRef, setLocalState]);

  return {
    startTimer,
    pauseTimer,
    resumeTimer,
    skipTimer,
    resetTimer,
  };
}

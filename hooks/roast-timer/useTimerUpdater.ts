'use client';

import { useEffect, useCallback } from 'react';
import type { RoastTimerState } from '@/types';
import { setRoastTimerState as saveLocalState } from '@/lib/localStorage';
import { playTimerSound, stopAudio } from '@/lib/sounds';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import { getSyncedIsoString } from '@/lib/timeSync';
import { calculateElapsedTime } from './useTimerState';
import type { UseTimerStateReturn } from './useTimerState';
import type { UseTimerNotificationsReturn } from './useTimerNotifications';

type UpdateAppDataFn = (newDataOrUpdater: import('@/types').AppData | ((currentData: import('@/types').AppData) => import('@/types').AppData)) => Promise<void>;

const UPDATE_INTERVAL = 250; // 250msごとに更新（CSS transitionと同期）

export interface UseTimerUpdaterArgs {
  user: { uid: string } | null;
  updateData: UpdateAppDataFn;
  isLoading: boolean;
  stateManager: UseTimerStateReturn;
  notifications: UseTimerNotificationsReturn;
  currentDeviceId: string;
}

/**
 * タイマー更新フック
 * - タイマー完了処理
 * - 定期更新（250msごと）
 * - バックグラウンド復帰時の状態更新
 */
export function useTimerUpdater({
  user,
  updateData,
  isLoading,
  stateManager,
  notifications,
  currentDeviceId,
}: UseTimerUpdaterArgs) {
  const {
    localState,
    setLocalState,
    localStateRef,
    intervalRef,
    lastUpdateRef,
    pausedElapsedRef,
  } = stateManager;

  const {
    soundAudioRef,
    preparedTimerAudioRef,
    playNotificationSoundFromRef,
  } = notifications;

  // タイマー完了処理
  const completeTimer = useCallback(async (currentState: RoastTimerState) => {
    // インターバルを即座に停止(重複実行を防ぐ)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const updatedState: RoastTimerState = {
      ...currentState,
      status: 'completed',
      remaining: 0,
      elapsed: currentState.duration,
      completedByDeviceId: currentDeviceId,
      dialogState: 'completion', // 完了ダイアログを表示
      lastUpdatedAt: getSyncedIsoString(),
    };

    // アラーム音を再生(タイマー音)
    try {
      const settings = await loadRoastTimerSettings();

      if (settings.timerSoundEnabled) {
        if (preparedTimerAudioRef.current) {
          try {
            // 既存の音声を停止してから再生
            if (soundAudioRef.current && soundAudioRef.current !== preparedTimerAudioRef.current) {
              stopAudio(soundAudioRef.current);
            }
            preparedTimerAudioRef.current.currentTime = 0;
            await preparedTimerAudioRef.current.play();
            soundAudioRef.current = preparedTimerAudioRef.current;
            console.log('[RoastTimer] Timer sound played from prepared ref');
          } catch (err) {
            console.error('[RoastTimer] Failed to play prepared timer audio, fallback', err);
            const audio = await playTimerSound(settings.timerSoundFile, settings.timerSoundVolume);
            soundAudioRef.current = audio;
          }
        } else {
          const audio = await playTimerSound(settings.timerSoundFile, settings.timerSoundVolume);
          soundAudioRef.current = audio;
        }
      }

      // 通知音は通知設定に基づき独立判定で再生
      // ただし、タイマー音と通知音が同じファイルの場合は重複再生を避けるためスキップ
      if (settings.notificationSoundEnabled && settings.timerSoundFile !== settings.notificationSoundFile) {
        void playNotificationSoundFromRef();
      }
    } catch (error) {
      console.error('Failed to play timer/notification sound:', error);
    }

    // ローカル状態を即座に更新(同期処理として扱う)
    saveLocalState(updatedState);
    // 状態を同期的に更新(次のupdateTimerが実行される前に完了状態にする)
    setLocalState(updatedState);

    // Firestoreに完了状態を保存
    try {
      await updateData((currentData) => ({
        ...currentData,
        roastTimerState: updatedState,
      }));
    } catch (error) {
      console.error('Failed to save roast timer state to Firestore:', error);
    }
  }, [currentDeviceId, updateData, playNotificationSoundFromRef, intervalRef, setLocalState, soundAudioRef, preparedTimerAudioRef]);

  // タイマーの更新処理(開始時刻ベースで計算)
  const updateTimer = useCallback(async () => {
    // 最新のlocalStateを取得
    const currentState = localStateRef.current;
    if (!currentState || !user || isLoading) {
      return;
    }

    // 既に完了している場合は何もしない
    if (currentState.status === 'completed') {
      return;
    }

    if (currentState.status === 'running' && currentState.startedAt) {
      const pausedElapsed = currentState.pausedElapsed ?? pausedElapsedRef.current ?? 0;
      pausedElapsedRef.current = pausedElapsed;
      // 開始時刻から経過時間を計算
      const elapsed = calculateElapsedTime(
        currentState.startedAt,
        currentState.pausedAt,
        pausedElapsed,
        currentState.status
      );
      const remaining = Math.max(0, currentState.duration - elapsed);

      // タイマーが完了した場合
      if (remaining <= 0) {
        // completeTimer内でインターバルを停止するため、ここでは停止しない
        await completeTimer(currentState);
        return;
      }

      // React状態更新は1秒ごとに制限（テキスト同期・完了判定用）
      // プログレスバーのアニメーションはTimerDisplayのrAFで60fps処理
      const now = Date.now();
      if (!lastUpdateRef.current || now - lastUpdateRef.current >= 1000) {
        const updatedState: RoastTimerState = {
          ...currentState,
          pausedElapsed,
          elapsed,
          remaining,
          lastUpdatedAt: getSyncedIsoString(),
        };
        setLocalState(updatedState);
        lastUpdateRef.current = now;
      }
    }
  }, [user, isLoading, completeTimer, localStateRef, pausedElapsedRef, lastUpdateRef, setLocalState]);

  // タイマーの定期更新(UI表示用)
  useEffect(() => {
    if (localState?.status === 'running') {
      // 既存のインターバルをクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      intervalRef.current = setInterval(updateTimer, UPDATE_INTERVAL);
      lastUpdateRef.current = Date.now();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [localState?.status, updateTimer, intervalRef, lastUpdateRef]);

  // ページの可視性変更を監視(バックグラウンドから復帰時に状態を更新)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && localState?.status === 'running' && localState.startedAt) {
        // ページが表示された時、開始時刻から経過時間を再計算
        const pausedElapsed = localState.pausedElapsed ?? pausedElapsedRef.current ?? 0;
        pausedElapsedRef.current = pausedElapsed;
        const elapsed = calculateElapsedTime(
          localState.startedAt,
          localState.pausedAt,
          pausedElapsed,
          localState.status
        );
        const remaining = Math.max(0, localState.duration - elapsed);

        // タイマーが完了している場合
        if (remaining <= 0) {
          completeTimer(localState);
          return;
        }

        const updatedState: RoastTimerState = {
          ...localState,
          pausedElapsed,
          elapsed,
          remaining,
          lastUpdatedAt: getSyncedIsoString(),
        };

        // LocalStorageへの保存は不要（重要イベント時のみ保存）
        setLocalState(updatedState);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [localState, user, completeTimer, pausedElapsedRef, setLocalState]);

  return { completeTimer };
}

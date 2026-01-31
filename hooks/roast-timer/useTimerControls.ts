'use client';

import { useEffect, useCallback } from 'react';
import type { AppData, RoastTimerState } from '@/types';
import { setRoastTimerState as saveLocalState } from '@/lib/localStorage';
import { playTimerSound, stopAllSounds, stopAudio } from '@/lib/sounds';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import { getSyncedTimestamp, getSyncedTimestampSync, getSyncedIsoString } from '@/lib/timeSync';
import { calculateElapsedTime } from './useTimerState';
import type { UseTimerStateReturn } from './useTimerState';
import type { UseTimerNotificationsReturn } from './useTimerNotifications';

type UpdateAppDataFn = (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void>;

const UPDATE_INTERVAL = 250; // 250msごとに更新（CSS transitionと同期）

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
 * - タイマー完了処理
 * - 定期更新とバックグラウンド復帰時の処理
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
    localStateRef,
    intervalRef,
    lastUpdateRef,
    pausedElapsedRef,
    hasResetRef,
  } = stateManager;

  const {
    soundAudioRef,
    preparedTimerAudioRef,
    prepareTimerSound,
    prepareNotificationSound,
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
  }, [user, isLoading, completeTimer]);

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
  }, [localState?.status, updateTimer]);

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
  }, [localState, user, completeTimer]);

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

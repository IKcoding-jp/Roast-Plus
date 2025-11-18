'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import type { AppData, RoastTimerState } from '@/types';
import { setRoastTimerState as saveLocalState, getRoastTimerState as loadLocalState, getDeviceId } from '@/lib/localStorage';
import { notifyRoastTimerComplete, scheduleNotification, cancelAllScheduledNotifications } from '@/lib/notifications';
import { playTimerSound, stopTimerSound, stopAllSounds, stopAudio } from '@/lib/sounds';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import {
  ensureServerTimeSync,
  getSyncedIsoString,
  getSyncedTimestamp,
  getSyncedTimestampSync,
  setTimeSyncUser,
} from '@/lib/timeSync';

const UPDATE_INTERVAL = 100; // 100msごとに更新

/**
 * 開始時刻と一時停止時刻から経過時間を計算
 */
function calculateElapsedTime(
  startedAt: string | undefined,
  pausedAt: string | undefined,
  pausedElapsed: number = 0,
  status: RoastTimerState['status']
): number {
  if (!startedAt) return 0;
  const totalPaused = Math.max(0, pausedElapsed);

  if (status === 'paused' && pausedAt) {
    // 一時停止中は、一時停止時点までの経過時間を返す
    const pausedTime = new Date(pausedAt).getTime();
    const startTime = new Date(startedAt).getTime();
    return Math.max(0, (pausedTime - startTime) / 1000 - totalPaused);
  }

  if (status === 'running') {
    // 実行中は、現在時刻から開始時刻を引いて、一時停止時間を差し引く（サーバー時刻ベース）
    const now = getSyncedTimestampSync();
    const startTime = new Date(startedAt).getTime();
    return Math.max(0, (now - startTime) / 1000 - totalPaused);
  }

  return Math.max(0, totalPaused);
}

type UpdateAppDataFn = (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void>;

interface UseRoastTimerArgs {
  data: AppData | null;
  updateData: UpdateAppDataFn;
  isLoading: boolean;
}

export function useRoastTimer({ data, updateData, isLoading }: UseRoastTimerArgs) {
  const { user } = useAuth();
  const [localState, setLocalState] = useState<RoastTimerState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasResetRef = useRef(false); // リセットが実行されたかどうかを追跡
  const isInitialMountRef = useRef(true); // 初回マウントかどうかを追跡
  const pausedElapsedRef = useRef<number>(0); // 一時停止の累積時間（秒）
  const isUpdatingFromFirestoreRef = useRef(false); // Firestoreからの更新中かどうか
  const currentDeviceId = getDeviceId();
  const userId = user?.uid ?? null;

  useEffect(() => {
    setTimeSyncUser(userId);
    if (userId) {
      ensureServerTimeSync().catch((error) => {
        console.error('Failed to initialize roast timer time-sync:', error);
      });
    }
  }, [userId]);

  // Firestoreの状態をローカル状態に反映
  useEffect(() => {
    if (!user || !data) return;

    // リセットが実行された場合は、状態を読み込まない
    if (hasResetRef.current) {
      hasResetRef.current = false;
      isInitialMountRef.current = false;
      return;
    }

    const firestoreState = data.roastTimerState;

    // Firestoreに状態がある場合
    if (firestoreState) {
      // 完了状態の処理
      if (firestoreState.status === 'completed') {
        // 初回マウント時は完了状態を読み込まない（ページを開いた時に完了画面が表示されるのを防ぐ）
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
          saveLocalState(null);
          setLocalState(null);
          pausedElapsedRef.current = 0;
          // 初回マウント時に完了状態が残っている場合は、Firestoreから削除
          // （リセットが完了していない可能性があるため）
          if (user && !isLoading) {
            updateData((currentData) => ({
              ...currentData,
              roastTimerState: undefined,
            })).catch((error) => {
              console.error('Failed to clear completed state on mount:', error);
            });
          }
          return;
        }
        // 既に初期化済みで、他のデバイスが完了を検出した場合は反映する
        // ただし、リセット直後は反映しない
        if (localState?.status !== 'completed' && !hasResetRef.current) {
          const completedState: RoastTimerState = {
            ...firestoreState,
            pausedElapsed: typeof firestoreState.pausedElapsed === 'number' ? firestoreState.pausedElapsed : 0,
          };
          pausedElapsedRef.current = completedState.pausedElapsed ?? 0;
          isUpdatingFromFirestoreRef.current = true;
          setLocalState(completedState);
          saveLocalState(completedState);
          setTimeout(() => {
            isUpdatingFromFirestoreRef.current = false;
          }, 100);
        }
        return;
      }

      // 開始時刻から経過時間を再計算
      if (firestoreState.startedAt) {
        const firestorePausedElapsed =
          typeof firestoreState.pausedElapsed === 'number' ? firestoreState.pausedElapsed : 0;
        pausedElapsedRef.current = firestorePausedElapsed;
        const elapsed = calculateElapsedTime(
          firestoreState.startedAt,
          firestoreState.pausedAt,
          firestorePausedElapsed,
          firestoreState.status
        );
        const remaining = Math.max(0, firestoreState.duration - elapsed);

        const restoredState: RoastTimerState = {
          ...firestoreState,
          pausedElapsed: firestorePausedElapsed,
          elapsed,
          remaining,
          lastUpdatedAt: getSyncedIsoString(),
        };

        // ローカル状態と異なる場合のみ更新（lastUpdatedAtとtriggeredByDeviceIdで比較）
        const shouldUpdate = !localState ||
          localState.status !== restoredState.status ||
          localState.lastUpdatedAt !== firestoreState.lastUpdatedAt ||
          localState.triggeredByDeviceId !== firestoreState.triggeredByDeviceId;

        if (shouldUpdate) {
          isUpdatingFromFirestoreRef.current = true;
          setLocalState(restoredState);
          // フォールバック用にローカルストレージにも保存
          saveLocalState(restoredState);
          setTimeout(() => {
            isUpdatingFromFirestoreRef.current = false;
          }, 100);
        }
      } else {
        // 開始時刻がない場合はそのまま反映（lastUpdatedAtとtriggeredByDeviceIdで比較）
        const normalizedState: RoastTimerState = {
          ...firestoreState,
          pausedElapsed: typeof firestoreState.pausedElapsed === 'number' ? firestoreState.pausedElapsed : 0,
        };
        const shouldUpdate = !localState ||
          localState.status !== firestoreState.status ||
          localState.lastUpdatedAt !== firestoreState.lastUpdatedAt ||
          localState.triggeredByDeviceId !== firestoreState.triggeredByDeviceId;

        if (shouldUpdate) {
          isUpdatingFromFirestoreRef.current = true;
          pausedElapsedRef.current = normalizedState.pausedElapsed ?? 0;
          setLocalState(normalizedState);
          saveLocalState(normalizedState);
          setTimeout(() => {
            isUpdatingFromFirestoreRef.current = false;
          }, 100);
        }
      }
      isInitialMountRef.current = false;
    } else {
      // Firestoreに状態がない場合、ローカルストレージから読み込む（後方互換性）
      if (isInitialMountRef.current) {
        const storedState = loadLocalState();
        if (storedState) {
          const storedPausedElapsed =
            typeof storedState.pausedElapsed === 'number' ? storedState.pausedElapsed : 0;
          const normalizedStoredState: RoastTimerState = {
            ...storedState,
            pausedElapsed: storedPausedElapsed,
          };
          // 完了状態の場合は読み込まない
          if (storedState.status === 'completed') {
            saveLocalState(null);
            setLocalState(null);
            pausedElapsedRef.current = 0;
            isInitialMountRef.current = false;
            return;
          }

          let stateToPersist: RoastTimerState = normalizedStoredState;
          // ローカルストレージから読み込んだ場合、開始時刻から経過時間を再計算
          if (storedState.status === 'running' && storedState.startedAt) {
            const elapsed = calculateElapsedTime(
              storedState.startedAt,
              storedState.pausedAt,
              storedPausedElapsed,
              storedState.status
            );
            const remaining = Math.max(0, storedState.duration - elapsed);

            stateToPersist = {
              ...normalizedStoredState,
              elapsed,
              remaining,
              lastUpdatedAt: getSyncedIsoString(),
            };
          }

          setLocalState(stateToPersist);
          pausedElapsedRef.current = stateToPersist.pausedElapsed ?? 0;

          // Firestoreにも保存（マイグレーション）。ただしAppDataの読み込み完了までは書き込みを遅延
          if (isLoading) {
            return;
          }

          updateData((currentData) => ({
            ...currentData,
            roastTimerState: stateToPersist,
          })).catch((error) => {
            console.error('Failed to migrate roast timer state from local storage:', error);
          });

          isInitialMountRef.current = false;
          return;
        }
        isInitialMountRef.current = false;
      } else {
        // 既に初期化済みで、Firestoreに状態がない場合はnullに設定
        // リセット後は、Firestoreの状態がundefinedになるまで待つ
        if (localState !== null && !hasResetRef.current) {
          setLocalState(null);
          pausedElapsedRef.current = 0;
        }
        // リセットフラグが設定されている場合、Firestoreの状態がundefinedになったらリセットフラグをクリア
        if (hasResetRef.current && !firestoreState) {
          hasResetRef.current = false;
        }
      }
    }
  }, [user, data, updateData, currentDeviceId, isLoading]);

  // タイマーの更新処理（開始時刻ベースで計算）
  const updateTimer = useCallback(async () => {
    if (!localState || !user || isLoading) return;

    if (localState.status === 'running' && localState.startedAt) {
      const pausedElapsed = localState.pausedElapsed ?? pausedElapsedRef.current ?? 0;
      pausedElapsedRef.current = pausedElapsed;
      // 開始時刻から経過時間を計算
      const elapsed = calculateElapsedTime(
        localState.startedAt,
        localState.pausedAt,
        pausedElapsed,
        localState.status
      );
      const remaining = Math.max(0, localState.duration - elapsed);

      const updatedState: RoastTimerState = {
        ...localState,
        pausedElapsed,
        elapsed,
        remaining,
        lastUpdatedAt: getSyncedIsoString(),
      };

      // タイマーが完了した場合
      if (remaining <= 0) {
        updatedState.status = 'completed';
        updatedState.remaining = 0;
        updatedState.elapsed = localState.duration;
        updatedState.completedByDeviceId = currentDeviceId;
        updatedState.dialogState = 'completion'; // 完了ダイアログを表示

        // すべてのスケジュール通知をキャンセル
        cancelAllScheduledNotifications();

        // アラーム音を先に再生（通知より先に再生することで、iOS/iPadOSでの音声ブロックを回避）
        try {
          const settings = await loadRoastTimerSettings();
          if (settings.timerSoundEnabled) {
            const audio = await playTimerSound(settings.timerSoundFile, settings.timerSoundVolume);
            soundAudioRef.current = audio;
            // アラーム音の再生を確実に開始するため、少し待ってから通知を表示
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error('Failed to play timer sound:', error);
        }

        // 通知を表示（アラーム音の再生開始後に表示）
        await notifyRoastTimerComplete();

        // Firestoreに完了状態を保存
        try {
          await updateData((currentData) => ({
            ...currentData,
            roastTimerState: updatedState,
          }));
        } catch (error) {
          console.error('Failed to save roast timer state to Firestore:', error);
        }
      }

      // ローカル状態のみ更新（Firestoreには保存しない - 100msごとの更新はローカルのみ）
      saveLocalState(updatedState);
      setLocalState(updatedState);
    }
  }, [localState, user, updateData]);

  // タイマーの定期更新（UI表示用）
  useEffect(() => {
    if (localState?.status === 'running') {
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

  // ページの可視性変更を監視（バックグラウンドから復帰時に状態を更新）
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

        const updatedState: RoastTimerState = {
          ...localState,
          pausedElapsed,
          elapsed,
          remaining,
          lastUpdatedAt: getSyncedIsoString(),
        };

        // タイマーが完了している場合
        if (remaining <= 0) {
          updatedState.status = 'completed';
          updatedState.remaining = 0;
          updatedState.elapsed = localState.duration;
        }

        saveLocalState(updatedState);
        setLocalState(updatedState);

        // 完了している場合は完了処理を実行
        if (updatedState.status === 'completed' && user) {
          updateTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [localState, user, updateTimer]);

  // タイマーを開始
  const startTimer = useCallback(
    async (
      duration: number,
      notificationId: number, // 2=手動、3=おすすめ
      beanName?: string,
      weight?: 200 | 300 | 500,
      roastLevel?: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
    ) => {
      if (!user || isLoading) {
        throw new Error('User is not authenticated or data is loading');
      }

      // 一時停止の累積時間をリセット
      pausedElapsedRef.current = 0;

      // サーバー時刻の取得を試みる（失敗した場合はローカル時刻を使用）
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
        notificationId,
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

      // 通知をスケジュール（失敗してもタイマーは開始する）
      try {
        const scheduledTime = Date.now() + duration * 1000;
        await scheduleNotification(notificationId, scheduledTime);
      } catch (error) {
        console.warn('Failed to schedule notification:', error);
        // 通知のスケジュールに失敗してもタイマーは開始する
      }
    },
    [user, updateData, currentDeviceId]
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
  }, [localState, user, updateData, currentDeviceId]);

  // タイマーを再開
  const resumeTimer = useCallback(async () => {
    if (!localState || localState.status !== 'paused' || !user || isLoading) return;

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

    // 通知を再スケジュール
    if (updatedState.notificationId) {
      const remainingTime = updatedState.remaining * 1000;
      const scheduledTime = Date.now() + remainingTime;
      scheduleNotification(updatedState.notificationId, scheduledTime);
    }
  }, [localState, user, updateData, currentDeviceId]);

  // タイマーをスキップ（残り時間を1秒に設定）
  const skipTimer = useCallback(async () => {
    if (!localState || !localState.startedAt || !user || isLoading) return;

    // 残り時間を1秒にするため、開始時刻を調整
    // 経過時間を duration - 1 にするため、開始時刻を (duration - 1)秒前に設定
    const targetElapsed = localState.duration - 1;
    const now = getSyncedTimestampSync();
    const adjustedStartTime = new Date(now - targetElapsed * 1000).toISOString();

    const updatedState: RoastTimerState = {
      ...localState,
      startedAt: adjustedStartTime,
      elapsed: targetElapsed,
      remaining: 1,
      pausedElapsed: 0,
      lastUpdatedAt: getSyncedIsoString(),
      triggeredByDeviceId: currentDeviceId,
    };

    // 一時停止の累積時間をリセット（スキップ時は経過時間を直接設定するため）
    pausedElapsedRef.current = 0;

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
    // 次回のカウントダウンで完了処理が実行される
  }, [localState, user, updateData, currentDeviceId]);

  // タイマーをリセット
  const resetTimer = useCallback(async () => {
    if (!user || isLoading) return;

    // リセットフラグを設定（状態を読み込まないようにする）
    hasResetRef.current = true;

    // 一時停止の累積時間をリセット
    pausedElapsedRef.current = 0;

    // すべてのスケジュール通知をキャンセル
    cancelAllScheduledNotifications();

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

    // Firestoreから削除（確実に削除するため、awaitで待機）
    try {
      await updateData((currentData) => ({
        ...currentData,
        roastTimerState: undefined,
      }));
      // 削除が完了したら、リセットフラグを維持（次のuseEffect実行時まで）
      // ただし、Firestoreの状態変更監視により、undefinedが反映されるまで待つ
    } catch (error) {
      console.error('Failed to delete roast timer state from Firestore:', error);
      // エラーが発生しても、リセットフラグは維持する
    }
  }, [user, updateData]);

  // サウンドを停止（完了ダイアログのOKボタンで呼ばれる）
  const stopSound = useCallback(() => {
    // まず、soundAudioRefに保存されているAudioオブジェクトを直接停止
    if (soundAudioRef.current) {
      try {
        const audio = soundAudioRef.current;
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
        // すべてのイベントリスナーを削除
        audio.removeEventListener('error', () => { });
        // Audioオブジェクトを完全に停止
        audio.src = '';
        audio.load(); // リソースを解放
        soundAudioRef.current = null;
      } catch (error) {
        console.error('Failed to stop sound audio ref:', error);
        soundAudioRef.current = null;
      }
    }
    // グローバルなタイマー音も停止（二重に停止することで確実に停止）
    stopAllSounds();
  }, []);

  return {
    state: localState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    stopSound,
  };
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import type { RoastTimerState, RoastTimerRecord } from '@/types';
import { setRoastTimerState as saveLocalState, getRoastTimerState as loadLocalState } from '@/lib/localStorage';
import { notifyRoastTimerComplete, scheduleNotification, cancelAllScheduledNotifications } from '@/lib/notifications';
import { playTimerSound, stopTimerSound, stopAllSounds } from '@/lib/sounds';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';

const UPDATE_INTERVAL = 100; // 100msごとに更新
const FIRESTORE_SYNC_INTERVAL = 5000; // 5秒ごとにFirestoreに保存

/**
 * 開始時刻と一時停止時刻から経過時間を計算
 */
function calculateElapsedTime(
  startedAt: string | undefined,
  pausedAt: string | undefined,
  pausedElapsed: number,
  status: RoastTimerState['status']
): number {
  if (!startedAt) return 0;
  
  if (status === 'paused' && pausedAt) {
    // 一時停止中は、一時停止時点までの経過時間を返す
    const pausedTime = new Date(pausedAt).getTime();
    const startTime = new Date(startedAt).getTime();
    return (pausedTime - startTime) / 1000 - pausedElapsed;
  }
  
  if (status === 'running') {
    // 実行中は、現在時刻から開始時刻を引いて、一時停止時間を差し引く
    const now = Date.now();
    const startTime = new Date(startedAt).getTime();
    return (now - startTime) / 1000 - pausedElapsed;
  }
  
  return pausedElapsed;
}

export function useRoastTimer() {
  const { user } = useAuth();
  const { data, updateData } = useAppData();
  const [localState, setLocalState] = useState<RoastTimerState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firestoreSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasResetRef = useRef(false); // リセットが実行されたかどうかを追跡
  const isInitialMountRef = useRef(true); // 初回マウントかどうかを追跡
  const pausedElapsedRef = useRef<number>(0); // 一時停止の累積時間（秒）

  // ローカルストレージまたはFirestoreから状態を読み込む
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // リセットが実行された場合は、Firestoreから状態を読み込まない
    if (hasResetRef.current) {
      hasResetRef.current = false; // フラグをリセット
      return;
    }
    
    const storedState = loadLocalState();
    if (storedState) {
      // 完了状態の場合は読み込まない（ページを開いた時に完了画面が表示されるのを防ぐ）
      if (storedState.status === 'completed') {
        isInitialMountRef.current = false;
        return;
      }
      
      // ローカルストレージから読み込んだ場合、開始時刻から経過時間を再計算
      if (storedState.status === 'running' && storedState.startedAt) {
        const elapsed = calculateElapsedTime(
          storedState.startedAt,
          storedState.pausedAt,
          pausedElapsedRef.current,
          storedState.status
        );
        const remaining = Math.max(0, storedState.duration - elapsed);
        
        const restoredState: RoastTimerState = {
          ...storedState,
          elapsed,
          remaining,
          lastUpdatedAt: new Date().toISOString(),
        };
        
        setLocalState(restoredState);
        saveLocalState(restoredState);
      } else {
        setLocalState(storedState);
      }
      isInitialMountRef.current = false;
    } else if (data.roastTimerState) {
      // Firestoreから状態を読み込む
      const firestoreState = data.roastTimerState;
      
      // 完了状態の場合は読み込まない（ページを開いた時に完了画面が表示されるのを防ぐ）
      if (firestoreState.status === 'completed') {
        isInitialMountRef.current = false;
        return;
      }
      
      // 実行中の場合、開始時刻から経過時間を再計算
      if (firestoreState.status === 'running' && firestoreState.startedAt) {
        const elapsed = calculateElapsedTime(
          firestoreState.startedAt,
          firestoreState.pausedAt,
          pausedElapsedRef.current,
          firestoreState.status
        );
        const remaining = Math.max(0, firestoreState.duration - elapsed);
        
        const restoredState: RoastTimerState = {
          ...firestoreState,
          elapsed,
          remaining,
          lastUpdatedAt: new Date().toISOString(),
        };
        
        setLocalState(restoredState);
        saveLocalState(restoredState);
      } else {
        setLocalState(firestoreState);
        saveLocalState(firestoreState);
      }
      
      isInitialMountRef.current = false;
    } else {
      isInitialMountRef.current = false;
    }
  }, [data.roastTimerState]);

  // タイマーの更新処理（開始時刻ベースで計算）
  const updateTimer = useCallback(async () => {
    if (!localState || !user) return;

    if (localState.status === 'running' && localState.startedAt) {
      // 開始時刻から経過時間を計算
      const elapsed = calculateElapsedTime(
        localState.startedAt,
        localState.pausedAt,
        pausedElapsedRef.current,
        localState.status
      );
      const remaining = Math.max(0, localState.duration - elapsed);

      const updatedState: RoastTimerState = {
        ...localState,
        elapsed,
        remaining,
        lastUpdatedAt: new Date().toISOString(),
      };

      // タイマーが完了した場合
      if (remaining <= 0) {
        updatedState.status = 'completed';
        updatedState.remaining = 0;
        updatedState.elapsed = localState.duration;

        // すべてのスケジュール通知をキャンセル
        cancelAllScheduledNotifications();

        // 通知とサウンド
        await notifyRoastTimerComplete();
        
        // 設定を読み込んでサウンドを再生
        try {
          const settings = await loadRoastTimerSettings(user.uid);
          if (settings.timerSoundEnabled) {
            const audio = await playTimerSound(settings.timerSoundFile, settings.timerSoundVolume);
            soundAudioRef.current = audio;
          }
        } catch (error) {
          console.error('Failed to play timer sound:', error);
        }

        // 完了状態をFirestoreに保存（アプリ復帰時の完了検出用）
        const updatedData = {
          ...data,
          roastTimerState: updatedState,
        };

        // 記録を保存
        if (
          updatedState.beanName &&
          updatedState.weight &&
          updatedState.roastLevel
        ) {
          const newRecord: RoastTimerRecord = {
            id: `record-${Date.now()}`,
            beanName: updatedState.beanName,
            weight: updatedState.weight,
            roastLevel: updatedState.roastLevel,
            duration: Math.round(updatedState.elapsed),
            roastDate: new Date().toISOString().split('T')[0], // 今日の日付をデフォルトとして設定
            createdAt: new Date().toISOString(),
            userId: user.uid,
          };

          updatedData.roastTimerRecords = [...data.roastTimerRecords, newRecord];
        }

        await updateData(updatedData);
      }

      // ローカルストレージに保存
      saveLocalState(updatedState);
      setLocalState(updatedState);
    }
  }, [localState, user, data, updateData]);

  // Firestoreへの定期的な同期（バックグラウンド動作のため）
  const syncToFirestore = useCallback(async () => {
    if (!localState || !user || localState.status !== 'running') return;

    try {
      // 開始時刻から経過時間を再計算
      const elapsed = calculateElapsedTime(
        localState.startedAt,
        localState.pausedAt,
        pausedElapsedRef.current,
        localState.status
      );
      const remaining = Math.max(0, localState.duration - elapsed);

      const syncedState: RoastTimerState = {
        ...localState,
        elapsed,
        remaining,
        lastUpdatedAt: new Date().toISOString(),
      };

      // Firestoreに保存（完了状態でない場合のみ）
      if (syncedState.status !== 'completed') {
        await updateData({
          ...data,
          roastTimerState: syncedState,
        });
      }
    } catch (error) {
      console.error('Failed to sync timer state to Firestore:', error);
    }
  }, [localState, user, data, updateData]);

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

  // Firestoreへの定期的な同期（バックグラウンド動作のため）
  useEffect(() => {
    if (localState?.status === 'running' && user) {
      firestoreSyncIntervalRef.current = setInterval(syncToFirestore, FIRESTORE_SYNC_INTERVAL);
    } else {
      if (firestoreSyncIntervalRef.current) {
        clearInterval(firestoreSyncIntervalRef.current);
        firestoreSyncIntervalRef.current = null;
      }
    }

    return () => {
      if (firestoreSyncIntervalRef.current) {
        clearInterval(firestoreSyncIntervalRef.current);
        firestoreSyncIntervalRef.current = null;
      }
    };
  }, [localState?.status, user, syncToFirestore]);

  // ページの可視性変更を監視（バックグラウンドから復帰時に状態を更新）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && localState?.status === 'running' && localState.startedAt) {
        // ページが表示された時、開始時刻から経過時間を再計算
        const elapsed = calculateElapsedTime(
          localState.startedAt,
          localState.pausedAt,
          pausedElapsedRef.current,
          localState.status
        );
        const remaining = Math.max(0, localState.duration - elapsed);

        const updatedState: RoastTimerState = {
          ...localState,
          elapsed,
          remaining,
          lastUpdatedAt: new Date().toISOString(),
        };

        // タイマーが完了している場合
        if (remaining <= 0) {
          updatedState.status = 'completed';
          updatedState.remaining = 0;
          updatedState.elapsed = localState.duration;
        }

        saveLocalState(updatedState);
        setLocalState(updatedState);

        // 完了している場合はFirestoreに保存
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
      if (!user) return;

      // 一時停止の累積時間をリセット
      pausedElapsedRef.current = 0;

      const startedAt = new Date().toISOString();
      const newState: RoastTimerState = {
        status: 'running',
        duration,
        elapsed: 0,
        remaining: duration,
        beanName,
        weight,
        roastLevel,
        startedAt,
        lastUpdatedAt: startedAt,
        notificationId,
      };

      // ローカルストレージに保存
      saveLocalState(newState);
      setLocalState(newState);
      lastUpdateRef.current = Date.now();

      // Firestoreに保存（バックグラウンド動作のため）
      try {
        await updateData({
          ...data,
          roastTimerState: newState,
        });
      } catch (error) {
        console.error('Failed to save timer state to Firestore:', error);
      }

      // 通知をスケジュール
      const scheduledTime = Date.now() + duration * 1000;
      await scheduleNotification(notificationId, scheduledTime);
    },
    [user, data, updateData]
  );

  // タイマーを一時停止
  const pauseTimer = useCallback(async () => {
    if (!localState || localState.status !== 'running' || !user) return;

    // 現在の経過時間を計算
    const elapsed = calculateElapsedTime(
      localState.startedAt,
      localState.pausedAt,
      pausedElapsedRef.current,
      localState.status
    );

    const pausedAt = new Date().toISOString();
    const updatedState: RoastTimerState = {
      ...localState,
      status: 'paused',
      pausedAt,
      elapsed,
      remaining: Math.max(0, localState.duration - elapsed),
      lastUpdatedAt: pausedAt,
    };

    // ローカルストレージに保存
    saveLocalState(updatedState);
    setLocalState(updatedState);

    // Firestoreに保存
    try {
      await updateData({
        ...data,
        roastTimerState: updatedState,
      });
    } catch (error) {
      console.error('Failed to save timer state to Firestore:', error);
    }
  }, [localState, user, data, updateData]);

  // タイマーを再開
  const resumeTimer = useCallback(async () => {
    if (!localState || localState.status !== 'paused' || !user) return;

    // 一時停止期間を累積時間に加算
    if (localState.pausedAt && localState.startedAt) {
      const pausedTime = new Date(localState.pausedAt).getTime();
      const resumeTime = Date.now();
      const pauseDuration = (resumeTime - pausedTime) / 1000; // 秒単位
      pausedElapsedRef.current += pauseDuration;
    }

    const resumedAt = new Date().toISOString();
    const updatedState: RoastTimerState = {
      ...localState,
      status: 'running',
      pausedAt: undefined,
      lastUpdatedAt: resumedAt,
    };

    // ローカルストレージに保存
    saveLocalState(updatedState);
    setLocalState(updatedState);
    lastUpdateRef.current = Date.now();

    // Firestoreに保存
    try {
      await updateData({
        ...data,
        roastTimerState: updatedState,
      });
    } catch (error) {
      console.error('Failed to save timer state to Firestore:', error);
    }

    // 通知を再スケジュール
    if (updatedState.notificationId) {
      const remainingTime = updatedState.remaining * 1000;
      const scheduledTime = Date.now() + remainingTime;
      await scheduleNotification(updatedState.notificationId, scheduledTime);
    }
  }, [localState, user, data, updateData]);

  // タイマーをスキップ（残り時間を1秒に設定）
  const skipTimer = useCallback(() => {
    if (!localState || !localState.startedAt) return;

    // 残り時間を1秒にするため、開始時刻を調整
    // 経過時間を duration - 1 にするため、開始時刻を (duration - 1)秒前に設定
    const targetElapsed = localState.duration - 1;
    const now = Date.now();
    const adjustedStartTime = new Date(now - targetElapsed * 1000).toISOString();

    const updatedState: RoastTimerState = {
      ...localState,
      startedAt: adjustedStartTime,
      elapsed: targetElapsed,
      remaining: 1,
      lastUpdatedAt: new Date().toISOString(),
    };

    // 一時停止の累積時間をリセット（スキップ時は経過時間を直接設定するため）
    pausedElapsedRef.current = 0;

    // ローカルストレージに保存
    saveLocalState(updatedState);
    setLocalState(updatedState);
    // 次回のカウントダウンで完了処理が実行される
  }, [localState]);

  // タイマーをリセット
  const resetTimer = useCallback(async () => {
    // リセットフラグを設定（Firestoreから状態を読み込まないようにする）
    hasResetRef.current = true;
    
    // 一時停止の累積時間をリセット
    pausedElapsedRef.current = 0;
    
    // すべてのスケジュール通知をキャンセル
    cancelAllScheduledNotifications();
    
    // サウンドを停止
    stopAllSounds();
    soundAudioRef.current = null;

    // ローカルストレージから削除
    saveLocalState(null);
    setLocalState(null);

    // Firestoreからも削除（undefinedを設定することでdeleteField()が使用される）
    if (user) {
      try {
        await updateData({
          ...data,
          roastTimerState: undefined,
        });
      } catch (error) {
        console.error('Failed to reset timer state in Firestore:', error);
      }
    }
  }, [user, data, updateData]);

  // サウンドを停止（完了ダイアログのOKボタンで呼ばれる）
  const stopSound = useCallback(() => {
    stopAllSounds();
    soundAudioRef.current = null;
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


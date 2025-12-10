'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import type { AppData, RoastTimerState } from '@/types';
import { setRoastTimerState as saveLocalState, getRoastTimerState as loadLocalState, getDeviceId } from '@/lib/localStorage';
import { playTimerSound, playNotificationSound, stopAllSounds, stopAudio } from '@/lib/sounds';
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
  const lastUpdateRef = useRef<number | null>(null);
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null); // 通知音用のAudioオブジェクト（アンロック済み）
  const preparedTimerAudioRef = useRef<HTMLAudioElement | null>(null); // タイマー音用のアンロック済みAudio
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

  useEffect(() => {
    if (lastUpdateRef.current === null) {
      lastUpdateRef.current = Date.now();
    }
  }, []);

  // Firestoreの状態をローカル状態に反映
  useEffect(() => {
    if (!user || !data) return;

    const firestoreState = data.roastTimerState;

    // リセットが実行された場合は、Firestoreの状態が消えるまで無視する
    if (hasResetRef.current) {
      if (firestoreState) {
        return;
      }
      hasResetRef.current = false;
      isInitialMountRef.current = false;
    }

    // Firestoreに状態がある場合
    if (firestoreState) {
      // 完了状態の処理
      if (firestoreState.status === 'completed') {
        // 初回マウント時は完了状態を読み込まない（ページを開いた時に完了画面が表示されるのを防ぐ）
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
          saveLocalState(null);
          pausedElapsedRef.current = 0;
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
          saveLocalState(completedState);
          setTimeout(() => {
            setLocalState(completedState);
            isUpdatingFromFirestoreRef.current = false;
          }, 0);
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
          saveLocalState(restoredState);
          setTimeout(() => {
            setLocalState(restoredState);
            isUpdatingFromFirestoreRef.current = false;
          }, 0);
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
          saveLocalState(normalizedState);
          setTimeout(() => {
            setLocalState(normalizedState);
            isUpdatingFromFirestoreRef.current = false;
          }, 0);
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

          setTimeout(() => setLocalState(stateToPersist), 0);
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
          pausedElapsedRef.current = 0;
          setTimeout(() => setLocalState(null), 0);
        }
        // リセットフラグが設定されている場合、Firestoreの状態がundefinedになったらリセットフラグをクリア
        if (hasResetRef.current && !firestoreState) {
          hasResetRef.current = false;
        }
      }
    }
  }, [user, data, updateData, currentDeviceId, isLoading, localState]);

  // 音声ファイルのパスを解決するヘルパー
  const resolveAudioPath = useCallback((path: string) => {
    const audioPath = path.startsWith('/') ? path : `/${path}`;
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.5.3';
    return `${audioPath}?v=${version}`;
  }, []);

  // タイマー音の準備（アンロック）を行う
  // ※タイマー音は設定デフォルトがOFFのため、ONにした場合に確実に鳴らすための準備
  const prepareTimerSound = useCallback(async () => {
    try {
      const settings = await loadRoastTimerSettings();
      if (!settings.timerSoundEnabled) {
        console.log('[RoastTimer] Timer sound is disabled, skipping unlock');
        return;
      }

      // 既に準備済みなら再利用
      if (preparedTimerAudioRef.current) {
        return;
      }

      const DEFAULT_SOUND_FILE = settings.timerSoundFile || '/sounds/roasttimer/alarm.mp3';

      let audioPath = resolveAudioPath(settings.timerSoundFile);
      let audio = new Audio(audioPath);
      let hasError = false;
      let usedFallback = false;
      let errorDetails:
        | {
            code?: number;
            message?: string;
            path: string;
            readyState?: number;
            networkState?: number;
            MEDIA_ERR_ABORTED?: number;
            MEDIA_ERR_NETWORK?: number;
            MEDIA_ERR_DECODE?: number;
            MEDIA_ERR_SRC_NOT_SUPPORTED?: number;
          }
        | null = null;

      const attachErrorLogger = (target: HTMLAudioElement, path: string) => () => {
        hasError = true;
        const error = target.error;
        if (error) {
          errorDetails = {
            code: error.code,
            message: error.message,
            path,
            MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
            MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
            MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
            MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
          };
        } else {
          errorDetails = {
            path,
            readyState: target.readyState,
            networkState: target.networkState,
          };
        }
        console.error('[RoastTimer] Timer audio loading error:', errorDetails);
      };

      let errorHandler: ((e: Event) => void) | null = attachErrorLogger(audio, audioPath);
      audio.addEventListener('error', errorHandler);

      // エラーイベントを待つための短い待機
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (hasError) {
        audio.removeEventListener('error', errorHandler);
        errorHandler = null;

        // デフォルトファイルで再試行（元ファイルと異なる場合のみ）
        if (settings.timerSoundFile !== DEFAULT_SOUND_FILE) {
          audioPath = resolveAudioPath(DEFAULT_SOUND_FILE);
          audio = new Audio(audioPath);
          usedFallback = true;
          hasError = false;
          errorDetails = null;
          errorHandler = attachErrorLogger(audio, audioPath);
          audio.addEventListener('error', errorHandler);

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (hasError) {
            audio.removeEventListener('error', errorHandler);
            console.error('[RoastTimer] Fallback timer audio loading failed:', errorDetails);
            return;
          }
        } else {
          console.error('[RoastTimer] Default timer audio failed, skipping unlock');
          return;
        }
      }

      // 無音で再生しアンロック
      audio.volume = 0;
      audio.muted = true;

      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;

        audio.muted = false;
        audio.volume = Math.max(0, Math.min(1, settings.timerSoundVolume));

        if (errorHandler) {
          audio.removeEventListener('error', errorHandler);
        }
        preparedTimerAudioRef.current = audio;
        console.log('[RoastTimer] Timer sound prepared and unlocked', usedFallback ? '(fallback)' : '');
      } catch (playError) {
        if (errorHandler) {
          audio.removeEventListener('error', errorHandler);
        }
        console.error('[RoastTimer] Failed to play timer audio for unlock:', playError);
      }
    } catch (error) {
      console.error('[RoastTimer] Failed to prepare timer sound:', error);
    }
  }, [resolveAudioPath]);

  // 通知音の準備（アンロック）を行う
  const prepareNotificationSound = useCallback(async () => {
    try {
      const settings = await loadRoastTimerSettings();
      if (!settings.notificationSoundEnabled) {
        console.log('[RoastTimer] Notification sound is disabled, skipping unlock');
        return;
      }

      // フォールバック用のデフォルトファイルパス
      const DEFAULT_SOUND_FILE = settings.notificationSoundFile || '/sounds/roasttimer/alarm.mp3';

      try {
        // 既存のAudioがあれば破棄
        if (notificationAudioRef.current) {
          notificationAudioRef.current.pause();
          notificationAudioRef.current = null;
        }

        let audioPath = resolveAudioPath(settings.notificationSoundFile);
        let audio = new Audio(audioPath);

        // エラーフラグを設定
        let hasError = false;
        let usedFallback = false;
        let errorDetails: {
          code?: number;
          message?: string;
          path: string;
          MEDIA_ERR_ABORTED?: number;
          MEDIA_ERR_NETWORK?: number;
          MEDIA_ERR_DECODE?: number;
          MEDIA_ERR_SRC_NOT_SUPPORTED?: number;
          readyState?: number;
          networkState?: number;
        } | null = null;

        // エラーハンドリング
        let errorHandler: (() => void) | null = null;
        let fallbackErrorHandler: (() => void) | null = null;

        errorHandler = () => {
          hasError = true;
          const error = audio.error;
          if (error) {
            errorDetails = {
              code: error.code,
              message: error.message,
              path: audioPath,
              MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
              MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
              MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
              MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
            };
            console.error('[RoastTimer] Audio loading error:', errorDetails);
            console.error('[RoastTimer] Failed to load audio file:', audioPath);
          } else {
            errorDetails = {
              path: audioPath,
              readyState: audio.readyState,
              networkState: audio.networkState,
            };
            console.error('[RoastTimer] Audio error event fired but no error details available', errorDetails);
          }
        };
        audio.addEventListener('error', errorHandler);

        // エラーが発生した場合は、play()を試みない
        // ただし、エラーイベントは非同期で発火する可能性があるため、
        // 短い待機時間を設けてからエラーチェックを行う
        await new Promise((resolve) => setTimeout(resolve, 100));

        // エラーが発生した場合、デフォルトファイルにフォールバック
        if (hasError) {
          console.warn('[RoastTimer] Audio loading failed, trying fallback file. Error:', errorDetails);
          audio.removeEventListener('error', errorHandler);

          // デフォルトファイルが元のファイルと同じ場合は、フォールバックしない
          if (settings.notificationSoundFile === DEFAULT_SOUND_FILE) {
            console.error('[RoastTimer] Default sound file also failed, skipping unlock');
            return;
          }

          // デフォルトファイルで再試行
          audioPath = resolveAudioPath(DEFAULT_SOUND_FILE);
          audio = new Audio(audioPath);
          hasError = false;
          errorDetails = null;
          usedFallback = true;

          fallbackErrorHandler = () => {
            hasError = true;
            const error = audio.error;
            if (error) {
              errorDetails = {
                code: error.code,
                message: error.message,
                path: audioPath,
                MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
                MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
                MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
                MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
              };
              console.error('[RoastTimer] Fallback audio loading error:', errorDetails);
            } else {
              errorDetails = {
                path: audioPath,
                readyState: audio.readyState,
                networkState: audio.networkState,
              };
              console.error('[RoastTimer] Fallback audio error event fired but no error details available', errorDetails);
            }
          };
          audio.addEventListener('error', fallbackErrorHandler);

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (hasError) {
            console.error('[RoastTimer] Fallback audio also failed, skipping unlock. Error:', errorDetails);
            audio.removeEventListener('error', fallbackErrorHandler);
            return;
          }
        }

        // 音量を0にし、さらにミュートも設定して確実に無音にする
        // 一瞬再生することで、iOS等の自動再生制限を解除（アンロック）する
        audio.volume = 0;
        audio.muted = true; // 確実に無音にする

        try {
          await audio.play();
          audio.pause();
          audio.currentTime = 0;

          // 本番再生用に音量を設定し、ミュートを解除
          audio.muted = false;
          audio.volume = Math.max(0, Math.min(1, settings.notificationSoundVolume));

          // Refに保存
          notificationAudioRef.current = audio;
          console.log('[RoastTimer] Notification sound prepared and unlocked', usedFallback ? '(using fallback)' : '');
        } catch (playError) {
          console.error('[RoastTimer] Failed to play audio for unlock:', playError);
          // エラーイベントリスナーを削除
          if (usedFallback && fallbackErrorHandler) {
            audio.removeEventListener('error', fallbackErrorHandler);
          } else if (errorHandler) {
            audio.removeEventListener('error', errorHandler);
          }
        }
      } catch (error) {
        console.error('[RoastTimer] Failed to prepare notification sound:', error);
      }
    } catch (error) {
      console.error('[RoastTimer] Failed to load settings for notification sound unlock:', error);
    }
  }, [resolveAudioPath]);

  // 通知音を再生（Refから）
  const playNotificationSoundFromRef = useCallback(async () => {
    try {
      const settings = await loadRoastTimerSettings();
      // 通知音が無効の場合はスキップ
      if (!settings.notificationSoundEnabled) return;

      if (!notificationAudioRef.current) {
        console.warn('[RoastTimer] Notification sound not prepared, trying fallback');
        // フォールバック: 通常の再生を試みる（ユーザー操作起因でないと鳴らない可能性あり）
        await playNotificationSound(settings.notificationSoundFile, settings.notificationSoundVolume);
        return;
      }

      try {
        const audio = notificationAudioRef.current;
        audio.currentTime = 0;
        await audio.play();
        console.log('[RoastTimer] Notification sound played from ref');
      } catch (error) {
        console.error('[RoastTimer] Failed to play notification sound from ref:', error);
        // フォールバック: 通常の再生を試みる
        await playNotificationSound(settings.notificationSoundFile, settings.notificationSoundVolume);
      }
    } catch (error) {
      console.error('[RoastTimer] Failed to play notification sound:', error);
    }
  }, []);

  // タイマー完了処理
  const completeTimer = useCallback(async (currentState: RoastTimerState) => {
    const updatedState: RoastTimerState = {
      ...currentState,
      status: 'completed',
      remaining: 0,
      elapsed: currentState.duration,
      completedByDeviceId: currentDeviceId,
      dialogState: 'completion', // 完了ダイアログを表示
      lastUpdatedAt: getSyncedIsoString(),
    };

    // アラーム音を再生（タイマー音）
    try {
      const settings = await loadRoastTimerSettings();

      if (settings.timerSoundEnabled) {
        if (preparedTimerAudioRef.current) {
          try {
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
      if (settings.notificationSoundEnabled) {
        void playNotificationSoundFromRef();
      }
    } catch (error) {
      console.error('Failed to play timer/notification sound:', error);
    }

    // ローカル状態を更新
    saveLocalState(updatedState);
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
  }, [currentDeviceId, updateData, playNotificationSoundFromRef]);

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

      // タイマーが完了した場合
      if (remaining <= 0) {
        await completeTimer(localState);
        return;
      }

      const updatedState: RoastTimerState = {
        ...localState,
        pausedElapsed,
        elapsed,
        remaining,
        lastUpdatedAt: getSyncedIsoString(),
      };

      // ローカル状態のみ更新（Firestoreには保存しない - 100msごとの更新はローカルのみ）
      saveLocalState(updatedState);
      setLocalState(updatedState);
    }
  }, [localState, user, isLoading, completeTimer]);

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

        saveLocalState(updatedState);
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

      // 通知音の準備（アンロック）
      // ユーザーインタラクション内で実行する必要がある
      await prepareTimerSound();
      await prepareNotificationSound();

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
    [user, updateData, currentDeviceId, isLoading, prepareTimerSound, prepareNotificationSound]
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
  }, [localState, user, updateData, currentDeviceId, isLoading]);

  // タイマーを再開
  const resumeTimer = useCallback(async () => {
    if (!localState || localState.status !== 'paused' || !user || isLoading) return;

    // 通知音の準備（アンロック）
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
  }, [localState, user, updateData, currentDeviceId, isLoading, prepareTimerSound, prepareNotificationSound]);

  // タイマーをスキップ（即座に完了）
  const skipTimer = useCallback(async () => {
    if (!localState || !user || isLoading) return;

    // 一時停止の累積時間をリセット
    pausedElapsedRef.current = 0;

    await completeTimer(localState);
  }, [localState, user, isLoading, completeTimer]);

  // タイマーをリセット
  const resetTimer = useCallback(async () => {
    if (!user || isLoading) return;

    // リセットフラグを設定（状態を読み込まないようにする）
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
  }, [user, updateData, isLoading]);

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

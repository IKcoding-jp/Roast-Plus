'use client';

import { useRef, useCallback } from 'react';
import { playNotificationSound, stopAllSounds } from '@/lib/sounds';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';

export interface UseTimerNotificationsReturn {
  soundAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  notificationAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  preparedTimerAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  prepareTimerSound: () => Promise<void>;
  prepareNotificationSound: () => Promise<void>;
  playNotificationSoundFromRef: () => Promise<void>;
  stopSound: () => void;
}

/**
 * 通知・音声管理フック
 * - タイマー音と通知音の準備・再生
 * - 音声Refの管理
 */
export function useTimerNotifications(): UseTimerNotificationsReturn {
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const preparedTimerAudioRef = useRef<HTMLAudioElement | null>(null);

  // 音声ファイルのパスを解決するヘルパー
  const resolveAudioPath = useCallback((path: string) => {
    const audioPath = path.startsWith('/') ? path : `/${path}`;
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.5.5';
    return `${audioPath}?v=${version}`;
  }, []);

  // タイマー音の準備(アンロック)を行う
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

        // デフォルトファイルで再試行(元ファイルと異なる場合のみ)
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

  // 通知音の準備(アンロック)を行う
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
        // 一瞬再生することで、iOS等の自動再生制限を解除(アンロック)する
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

  // 通知音を再生(Refから)
  const playNotificationSoundFromRef = useCallback(async () => {
    try {
      const settings = await loadRoastTimerSettings();
      // 通知音が無効の場合はスキップ
      if (!settings.notificationSoundEnabled) return;

      if (!notificationAudioRef.current) {
        console.warn('[RoastTimer] Notification sound not prepared, trying fallback');
        // フォールバック: 通常の再生を試みる(ユーザー操作起因でないと鳴らない可能性あり)
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

  // サウンドを停止(完了ダイアログのOKボタンで呼ばれる)
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
    // グローバルなタイマー音も停止(二重に停止することで確実に停止)
    stopAllSounds();
  }, []);

  return {
    soundAudioRef,
    notificationAudioRef,
    preparedTimerAudioRef,
    prepareTimerSound,
    prepareNotificationSound,
    playNotificationSoundFromRef,
    stopSound,
  };
}

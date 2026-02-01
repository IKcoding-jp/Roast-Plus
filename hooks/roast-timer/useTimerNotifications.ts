'use client';

import { useRef, useCallback } from 'react';
import { playNotificationSound, stopAllSounds } from '@/lib/sounds';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import { prepareAndUnlockAudio } from './audioUnlocker';

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

      const defaultFile = settings.timerSoundFile || '/sounds/roasttimer/alarm.mp3';
      const audio = await prepareAndUnlockAudio(
        settings.timerSoundFile,
        defaultFile,
        settings.timerSoundVolume,
        'Timer'
      );

      if (audio) {
        preparedTimerAudioRef.current = audio;
      }
    } catch (error) {
      console.error('[RoastTimer] Failed to prepare timer sound:', error);
    }
  }, []);

  // 通知音の準備(アンロック)を行う
  const prepareNotificationSound = useCallback(async () => {
    try {
      const settings = await loadRoastTimerSettings();
      if (!settings.notificationSoundEnabled) {
        console.log('[RoastTimer] Notification sound is disabled, skipping unlock');
        return;
      }

      // 既存のAudioがあれば破棄
      if (notificationAudioRef.current) {
        notificationAudioRef.current.pause();
        notificationAudioRef.current = null;
      }

      const defaultFile = settings.notificationSoundFile || '/sounds/roasttimer/alarm.mp3';
      const audio = await prepareAndUnlockAudio(
        settings.notificationSoundFile,
        defaultFile,
        settings.notificationSoundVolume,
        'Notification'
      );

      if (audio) {
        notificationAudioRef.current = audio;
      }
    } catch (error) {
      console.error('[RoastTimer] Failed to prepare notification sound:', error);
    }
  }, []);

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

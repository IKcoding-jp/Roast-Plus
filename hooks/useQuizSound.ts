'use client';

import { useCallback, useEffect } from 'react';
import {
  playCorrectSound,
  playIncorrectSound,
  playLevelUpSound,
  playBadgeSound,
  playXPSound,
  playStartSound,
  playCompleteSound,
  vibrateCorrect,
  vibrateIncorrect,
  vibrateLevelUp,
  vibrateBadge,
  initializeAudio,
  cleanupAudio,
} from '@/lib/coffee-quiz/sounds';

interface UseQuizSoundOptions {
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  volume?: number;
}

/**
 * クイズの効果音・バイブレーションを管理するフック
 */
export function useQuizSound(options: UseQuizSoundOptions = {}) {
  const {
    soundEnabled = true,
    vibrationEnabled = true,
    volume = 0.3,
  } = options;

  // AudioContextの初期化
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // ユーザー操作で初期化
  const initialize = useCallback(() => {
    if (soundEnabled) {
      initializeAudio();
    }
  }, [soundEnabled]);

  // 正解音
  const playCorrect = useCallback(() => {
    if (soundEnabled) {
      playCorrectSound(volume);
    }
    if (vibrationEnabled) {
      vibrateCorrect();
    }
  }, [soundEnabled, vibrationEnabled, volume]);

  // 不正解音
  const playIncorrect = useCallback(() => {
    if (soundEnabled) {
      playIncorrectSound(volume * 0.8);
    }
    if (vibrationEnabled) {
      vibrateIncorrect();
    }
  }, [soundEnabled, vibrationEnabled, volume]);

  // レベルアップ音
  const playLevelUp = useCallback(() => {
    if (soundEnabled) {
      playLevelUpSound(volume);
    }
    if (vibrationEnabled) {
      vibrateLevelUp();
    }
  }, [soundEnabled, vibrationEnabled, volume]);

  // バッジ獲得音
  const playBadge = useCallback(() => {
    if (soundEnabled) {
      playBadgeSound(volume);
    }
    if (vibrationEnabled) {
      vibrateBadge();
    }
  }, [soundEnabled, vibrationEnabled, volume]);

  // XP獲得音
  const playXP = useCallback(() => {
    if (soundEnabled) {
      playXPSound(volume * 0.5);
    }
  }, [soundEnabled, volume]);

  // クイズ開始音
  const playStart = useCallback(() => {
    if (soundEnabled) {
      playStartSound(volume * 0.7);
    }
  }, [soundEnabled, volume]);

  // セッション完了音
  const playComplete = useCallback(() => {
    if (soundEnabled) {
      playCompleteSound(volume);
    }
  }, [soundEnabled, volume]);

  return {
    initialize,
    playCorrect,
    playIncorrect,
    playLevelUp,
    playBadge,
    playXP,
    playStart,
    playComplete,
  };
}

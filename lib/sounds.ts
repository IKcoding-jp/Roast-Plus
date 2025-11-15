/**
 * サウンド再生機能
 * HTML5 Audio APIを使用
 */

let timerAudio: HTMLAudioElement | null = null;
let notificationAudio: HTMLAudioElement | null = null;

/**
 * タイマー音を再生（ループ再生）
 */
export async function playTimerSound(
  soundFile: string,
  volume: number
): Promise<HTMLAudioElement | null> {
  try {
    // 既存の音声を停止
    if (timerAudio) {
      timerAudio.pause();
      timerAudio = null;
    }

    // パスが相対パスの場合は絶対パスに変換
    const audioPath = soundFile.startsWith('/') ? soundFile : `/${soundFile}`;
    const audio = new Audio(audioPath);
    
    // エラーハンドリングを追加
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      console.error('Failed to load audio file:', audioPath);
    });

    audio.loop = true;
    audio.volume = Math.max(0, Math.min(1, volume));
    
    await audio.play();
    timerAudio = audio;
    
    return audio;
  } catch (error) {
    console.error('Failed to play timer sound:', error);
    console.error('Sound file path:', soundFile);
    return null;
  }
}

/**
 * タイマー音を停止
 */
export function stopTimerSound(): void {
  if (timerAudio) {
    try {
      timerAudio.pause();
      timerAudio.currentTime = 0;
      timerAudio.loop = false; // ループを無効化
      timerAudio = null;
    } catch (error) {
      console.error('Failed to stop timer sound:', error);
      timerAudio = null;
    }
  }
}

/**
 * 通知音を再生
 */
export async function playNotificationSound(
  soundFile: string,
  volume: number
): Promise<HTMLAudioElement | null> {
  try {
    // 既存の音声を停止
    if (notificationAudio) {
      notificationAudio.pause();
      notificationAudio = null;
    }

    // パスが相対パスの場合は絶対パスに変換
    const audioPath = soundFile.startsWith('/') ? soundFile : `/${soundFile}`;
    const audio = new Audio(audioPath);
    
    // エラーハンドリングを追加
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      console.error('Failed to load audio file:', audioPath);
    });

    audio.loop = false;
    audio.volume = Math.max(0, Math.min(1, volume));
    
    await audio.play();
    notificationAudio = audio;
    
    return audio;
  } catch (error) {
    console.error('Failed to play notification sound:', error);
    console.error('Sound file path:', soundFile);
    return null;
  }
}

/**
 * 通知音を停止
 */
export function stopNotificationSound(): void {
  if (notificationAudio) {
    notificationAudio.pause();
    notificationAudio.currentTime = 0;
    notificationAudio = null;
  }
}

/**
 * すべての音声を停止
 */
export function stopAllSounds(): void {
  stopTimerSound();
  stopNotificationSound();
}

/**
 * 特定のAudioオブジェクトを停止（外部から渡されたAudioオブジェクト用）
 */
export function stopAudio(audio: HTMLAudioElement | null | undefined): void {
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }
}


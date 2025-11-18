/**
 * サウンド再生機能
 * HTML5 Audio APIを使用
 */

let timerAudio: HTMLAudioElement | null = null;
let notificationAudio: HTMLAudioElement | null = null;
let timerErrorHandler: ((e: Event) => void) | null = null;
let notificationErrorHandler: ((e: Event) => void) | null = null;

/**
 * タイマー音を再生（1回のみ）
 */
export async function playTimerSound(
  soundFile: string,
  volume: number
): Promise<HTMLAudioElement | null> {
  try {
    // 既存の音声を停止
    if (timerAudio) {
      // エラーイベントリスナーを削除
      if (timerErrorHandler) {
        timerAudio.removeEventListener('error', timerErrorHandler);
        timerErrorHandler = null;
      }
      timerAudio.pause();
      timerAudio = null;
    }

    // パスが相対パスの場合は絶対パスに変換
    let audioPath = soundFile.startsWith('/') ? soundFile : `/${soundFile}`;
    // キャッシュ回避のため、バージョンクエリを追加
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.8';
    audioPath = `${audioPath}?v=${version}`;
    const audio = new Audio(audioPath);
    
    // エラーハンドリングを追加（参照を保持して削除可能にする）
    timerErrorHandler = (e: Event) => {
      const error = audio.error;
      if (error) {
        console.error('Audio loading error:', {
          code: error.code,
          message: error.message,
          MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
          MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
          MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
          MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
        });
        console.error('Failed to load audio file:', audioPath);
      } else {
        console.error('Audio error event fired but no error details available');
      }
    };
    audio.addEventListener('error', timerErrorHandler);

    audio.loop = false;
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
      // エラーイベントリスナーを削除
      if (timerErrorHandler) {
        timerAudio.removeEventListener('error', timerErrorHandler);
        timerErrorHandler = null;
      }
      // 音声を停止
      timerAudio.pause();
      timerAudio.currentTime = 0;
      timerAudio.loop = false; // ループを無効化
      // Audioオブジェクトを完全に停止
      timerAudio.src = '';
      timerAudio.load(); // リソースを解放
      timerAudio = null;
    } catch (error) {
      console.error('Failed to stop timer sound:', error);
      timerAudio = null;
      timerErrorHandler = null;
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
      // エラーイベントリスナーを削除
      if (notificationErrorHandler) {
        notificationAudio.removeEventListener('error', notificationErrorHandler);
        notificationErrorHandler = null;
      }
      notificationAudio.pause();
      notificationAudio = null;
    }

    // パスが相対パスの場合は絶対パスに変換
    let audioPath = soundFile.startsWith('/') ? soundFile : `/${soundFile}`;
    // キャッシュ回避のため、バージョンクエリを追加
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.8';
    audioPath = `${audioPath}?v=${version}`;
    const audio = new Audio(audioPath);
    
    // エラーハンドリングを追加（参照を保持して削除可能にする）
    notificationErrorHandler = (e: Event) => {
      const error = audio.error;
      if (error) {
        console.error('Audio loading error:', {
          code: error.code,
          message: error.message,
          MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
          MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
          MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
          MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
        });
        console.error('Failed to load audio file:', audioPath);
      } else {
        console.error('Audio error event fired but no error details available');
      }
    };
    audio.addEventListener('error', notificationErrorHandler);

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
    // エラーイベントリスナーを削除
    if (notificationErrorHandler) {
      notificationAudio.removeEventListener('error', notificationErrorHandler);
      notificationErrorHandler = null;
    }
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
      // Audioオブジェクトを完全に停止
      // srcを空にしてload()を呼び出すと、イベントリスナーも自動的に削除される
      audio.src = '';
      audio.load(); // リソースを解放
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }
}


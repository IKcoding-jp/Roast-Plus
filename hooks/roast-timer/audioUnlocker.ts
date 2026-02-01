/**
 * 音声ファイルの準備・アンロックヘルパー
 * iOS等の自動再生制限を回避するため、無音再生でアンロックする
 */

/** 音声パスを解決する */
export function resolveAudioPath(path: string): string {
  const audioPath = path.startsWith('/') ? path : `/${path}`;
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.5.5';
  return `${audioPath}?v=${version}`;
}

interface AudioErrorDetails {
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

/**
 * 音声ファイルを準備してアンロックする
 * @param soundFile 音声ファイルパス
 * @param defaultSoundFile フォールバック用デフォルトファイル
 * @param volume 音量 (0-1)
 * @param label ログ用ラベル（例: 'Timer', 'Notification'）
 * @returns 準備済みの HTMLAudioElement、または失敗時は null
 */
export async function prepareAndUnlockAudio(
  soundFile: string,
  defaultSoundFile: string,
  volume: number,
  label: string
): Promise<HTMLAudioElement | null> {
  let audioPath = resolveAudioPath(soundFile);
  let audio = new Audio(audioPath);
  let hasError = false;
  let usedFallback = false;
  let errorDetails: AudioErrorDetails | null = null;

  const createErrorHandler = (target: HTMLAudioElement, path: string) => () => {
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
    console.error(`[RoastTimer] ${label} audio loading error:`, errorDetails);
  };

  let errorHandler: (() => void) | null = createErrorHandler(audio, audioPath);
  audio.addEventListener('error', errorHandler);

  // エラーイベントを待つための短い待機
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (hasError) {
    audio.removeEventListener('error', errorHandler);
    errorHandler = null;

    // デフォルトファイルで再試行(元ファイルと異なる場合のみ)
    if (soundFile !== defaultSoundFile) {
      audioPath = resolveAudioPath(defaultSoundFile);
      audio = new Audio(audioPath);
      usedFallback = true;
      hasError = false;
      errorDetails = null;
      errorHandler = createErrorHandler(audio, audioPath);
      audio.addEventListener('error', errorHandler);

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (hasError) {
        audio.removeEventListener('error', errorHandler);
        console.error(`[RoastTimer] Fallback ${label.toLowerCase()} audio loading failed:`, errorDetails);
        return null;
      }
    } else {
      console.error(`[RoastTimer] Default ${label.toLowerCase()} audio failed, skipping unlock`);
      return null;
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
    audio.volume = Math.max(0, Math.min(1, volume));

    if (errorHandler) {
      audio.removeEventListener('error', errorHandler);
    }
    console.log(`[RoastTimer] ${label} sound prepared and unlocked`, usedFallback ? '(fallback)' : '');
    return audio;
  } catch (playError) {
    if (errorHandler) {
      audio.removeEventListener('error', errorHandler);
    }
    console.error(`[RoastTimer] Failed to play ${label.toLowerCase()} audio for unlock:`, playError);
    return null;
  }
}

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { TimeLabel, RoastSchedule } from '@/types';

// Firebase Functionsのレスポンス型
interface OCRScheduleResponse {
  timeLabels: TimeLabel[];
  roastSchedules: Omit<RoastSchedule, 'date'>[]; // dateはクライアント側で設定
}

const MAX_DIMENSION = 1280; // 画質と転送速度のバランスを優先
const JPEG_QUALITY = 0.9;
const RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 500;
const CLIENT_TIMEOUT_MS = 40000; // フロントでの待ち時間上限（ms）

/**
 * 画像をBase64エンコードしてFirebase Functionsに送信し、スケジュールを抽出
 */
export async function extractScheduleFromImage(
  imageFile: File,
  selectedDate: string
): Promise<{ timeLabels: TimeLabel[]; roastSchedules: RoastSchedule[] }> {
  const compressedFile = await compressImageFile(imageFile, {
    maxDimension: MAX_DIMENSION,
    quality: JPEG_QUALITY,
  });

  // 画像をBase64に変換
  const base64 = await fileToBase64(compressedFile);

  // Firebase Functionsを呼び出し
  const ocrScheduleFromImage = httpsCallable<{ imageBase64: string }, OCRScheduleResponse>(
    functions,
    'ocrScheduleFromImage'
  );

  const callWithRetry = async (attempt: number): Promise<OCRScheduleResponse> => {
    const start = performance.now();

    try {
      const result = await withTimeout(
        ocrScheduleFromImage({ imageBase64: base64 }),
        CLIENT_TIMEOUT_MS
      );
      console.info('[OCR_CLIENT]', {
        event: 'call_success',
        attempt,
        durationMs: Math.round(performance.now() - start),
      });
      return result.data;
    } catch (error: any) {
      const normalized = normalizeError(error);
      const canRetry = shouldRetry(error) && attempt < RETRY_ATTEMPTS;

      console.error('[OCR_CLIENT]', {
        event: canRetry ? 'call_retry' : 'call_fail',
        attempt,
        durationMs: Math.round(performance.now() - start),
        code: normalized.code,
        message: normalized.message,
      });

      if (canRetry) {
        await delay(getBackoffDelay(attempt));
        return callWithRetry(attempt + 1);
      }

      throw normalized;
    }
  };

  const data = await callWithRetry(0);

  // dateを設定してRoastScheduleを完成させる
  const roastSchedules: RoastSchedule[] = data.roastSchedules.map((schedule) => ({
    ...schedule,
    date: selectedDate,
  }));

  return {
    timeLabels: data.timeLabels,
    roastSchedules,
  };
}

/**
 * FileをBase64文字列に変換
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 画像をリサイズ・圧縮してFileとして返す
 */
async function compressImageFile(
  file: File,
  {
    maxDimension,
    quality,
  }: {
    maxDimension: number;
    quality: number;
  }
): Promise<File> {
  const imageBitmap = await loadImage(file);
  const { width, height } = imageBitmap;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return file;
  }

  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (result) => resolve(result),
      'image/jpeg',
      quality
    );
  });

  if (!blob) {
    return file;
  }

  return new File([blob], file.name.replace(/\.(png|jpeg|jpg|webp)$/i, '.jpg'), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const dataUrl = await fileToBase64(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffDelay(attempt: number): number {
  return RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const timeoutError = new Error('処理がタイムアウトしました。しばらく待って再実行してください。');
      (timeoutError as any).code = 'deadline-exceeded';
      reject(timeoutError);
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function shouldRetry(error: any): boolean {
  const code = error?.code;
  const message = (error?.message || '').toLowerCase();

  if (!code && !message) return false;

  const transientCodes = [
    'internal',
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
  ];

  if (transientCodes.includes(code)) {
    return true;
  }

  // ネットワーク系メッセージ
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('etimedout') ||
    message.includes('econnrefused') ||
    message.includes('unreachable') ||
    message.includes('503') ||
    message.includes('429')
  ) {
    return true;
  }

  return false;
}

function normalizeError(error: any): Error {
  // Firebase Functionsのエラーコードを優先
  const code = error?.code || (error?.message?.includes('not-found') ? 'functions/not-found' : undefined);
  let message = 'スケジュールの読み取りに失敗しました。';

  if (code === 'unauthenticated') {
    message = '認証が必要です。再度ログインしてください。';
  } else if (code === 'functions/not-found') {
    message = 'Firebase Functionsが見つかりません。デプロイを確認してください。';
  } else if (code === 'failed-precondition') {
    message = 'サーバー設定が不足しています。管理者に問い合わせてください。';
  } else if (code === 'invalid-argument') {
    message = '画像データが無効か大きすぎます。解像度を下げて再度お試しください。';
  } else if (code === 'deadline-exceeded') {
    message = '処理がタイムアウトしました。通信環境を確認して再度お試しください。';
  } else if (code === 'unavailable' || code === 'internal') {
    message = 'サーバーが混み合っています。しばらく待って再度お試しください。';
  } else if (error?.message) {
    message = error.message;
  }

  const normalized = new Error(message);
  (normalized as any).code = code || error?.code;
  (normalized as any).details = error?.details;
  return normalized;
}


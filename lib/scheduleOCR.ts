import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { TimeLabel, RoastSchedule } from '@/types';

// Firebase Functionsのレスポンス型
interface OCRScheduleResponse {
  timeLabels: TimeLabel[];
  roastSchedules: Omit<RoastSchedule, 'date'>[]; // dateはクライアント側で設定
}

/**
 * 画像をBase64エンコードしてFirebase Functionsに送信し、スケジュールを抽出
 */
export async function extractScheduleFromImage(
  imageFile: File,
  selectedDate: string
): Promise<{ timeLabels: TimeLabel[]; roastSchedules: RoastSchedule[] }> {
  // 画像をBase64に変換
  const base64 = await fileToBase64(imageFile);

  // Firebase Functionsを呼び出し
  const ocrScheduleFromImage = httpsCallable<{ imageBase64: string }, OCRScheduleResponse>(
    functions,
    'ocrScheduleFromImage'
  );

  try {
    const result = await ocrScheduleFromImage({ imageBase64: base64 });
    const data = result.data;

    // dateを設定してRoastScheduleを完成させる
    const roastSchedules: RoastSchedule[] = data.roastSchedules.map((schedule) => ({
      ...schedule,
      date: selectedDate,
    }));

    return {
      timeLabels: data.timeLabels,
      roastSchedules,
    };
  } catch (error: unknown) {
    const scheduleError = error as { code?: string; message?: string; details?: unknown; stack?: string };
    console.error('OCR処理エラー:', error);
    console.error('エラー詳細:', {
      code: scheduleError?.code,
      message: scheduleError?.message,
      details: scheduleError?.details,
      stack: scheduleError?.stack,
    });
    
    // Firebase Functionsのエラーを適切に処理
    if (scheduleError?.code) {
      // Firebase Functionsのエラーコードをそのまま伝播
      const errorMessage = scheduleError.message || 'スケジュールの読み取りに失敗しました。';
      const newError = new Error(errorMessage) as Error & { code?: string; details?: unknown };
      newError.code = scheduleError.code;
      newError.details = scheduleError.details;
      throw newError;
    }
    
    // ネットワークエラーやFunctionsが存在しない場合
    if (scheduleError?.message?.includes('not-found') || scheduleError?.message?.includes('404')) {
      const newError = new Error('Firebase Functionsが見つかりません。デプロイを確認してください。') as Error & {
        code?: string;
      };
      newError.code = 'functions/not-found';
      throw newError;
    }
    
    throw error;
  }
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


import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import type { TimeLabel } from '@/types';

interface OCRScheduleResponse {
  timeLabels: TimeLabel[];
}

/**
 * 画像をBase64に変換
 */
export function imageToBase64(file: File): Promise<string> {
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
 * Firebase Functionsを呼び出してOCR処理を実行
 */
export async function processScheduleOCR(imageFile: File): Promise<TimeLabel[]> {
  try {
    // 画像をBase64に変換
    const imageBase64 = await imageToBase64(imageFile);

    // Firebase Functionsを呼び出し
    const app = getApp();
    // Firebase Functions v2ではリージョンを指定する必要がある
    const functions = getFunctions(app, 'us-central1');
    const processScheduleOCRFunction = httpsCallable<{ imageBase64: string }, OCRScheduleResponse>(
      functions,
      'processScheduleOCR'
    );

    const result = await processScheduleOCRFunction({ imageBase64 });

    if (!result.data || !result.data.timeLabels) {
      throw new Error('OCR処理の結果が不正です');
    }

    return result.data.timeLabels;
  } catch (error: any) {
    console.error('OCR処理エラー:', error);
    
    // エラーメッセージを適切に処理
    if (error.code === 'unauthenticated') {
      throw new Error('認証が必要です。ログインしてください。');
    } else if (error.code === 'invalid-argument') {
      throw new Error('画像データが正しくありません。');
    } else if (error.code === 'functions/unavailable') {
      throw new Error('サービスが一時的に利用できません。しばらく待ってから再度お試しください。');
    } else if (error.code === 'functions/deadline-exceeded') {
      throw new Error('処理に時間がかかりすぎました。画像を確認して再度お試しください。');
    } else if (error.message) {
      // Firebase Functionsからのエラーメッセージをそのまま使用
      throw new Error(error.message);
    } else {
      throw new Error('OCR処理中にエラーが発生しました。ネットワーク接続を確認してください。');
    }
  }
}


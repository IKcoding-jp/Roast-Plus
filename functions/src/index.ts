import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { ocrSchedule } from './ocrSchedule';

// シークレットを定義
const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const processScheduleOCR = onCall(
  {
    secrets: [openaiApiKey], // シークレットを使用することを宣言
  },
  async (request) => {
    // 認証チェック
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'ユーザーが認証されていません'
      );
    }

    const { imageBase64 } = request.data;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        '画像データが正しくありません'
      );
    }

    try {
      // シークレットの値を環境変数として設定
      process.env.OPENAI_API_KEY = openaiApiKey.value();
      const result = await ocrSchedule(imageBase64);
      return result;
    } catch (error: any) {
      console.error('OCR処理エラー:', error);
      throw new HttpsError(
        'internal',
        error.message || 'OCR処理中にエラーが発生しました'
      );
    }
  }
);


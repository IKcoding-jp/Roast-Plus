import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import OpenAI from 'openai';
import type { TimeLabel, RoastSchedule } from './types';

// OCR結果とスケジュール抽出結果の型
interface OCRScheduleResponse {
  timeLabels: TimeLabel[];
  roastSchedules: RoastSchedule[];
}

/**
 * 画像からスケジュールを抽出するFirebase Function
 */
export const ocrScheduleFromImage = onCall(
  {
    cors: true,
    maxInstances: 10,
    secrets: ['OPENAI_API_KEY'], // Secrets Managerからシークレットを取得
  },
  async (request) => {
    // 認証チェック
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '認証が必要です');
    }

    const { imageBase64 } = request.data;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new HttpsError('invalid-argument', '画像データが必要です');
    }

    try {
      // Base64プレフィックスを削除（data:image/jpeg;base64,など）
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      // Google Vision APIでOCR実行
      const apiKey = process.env.GOOGLE_VISION_API_KEY;
      const visionClient = apiKey
        ? new ImageAnnotatorClient({ apiKey })
        : new ImageAnnotatorClient();

      const [result] = await visionClient.textDetection({
        image: { content: base64Data },
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new HttpsError('not-found', '画像からテキストを検出できませんでした');
      }

      // 最初の要素は全体のテキスト
      const fullText = detections[0].description || '';
      if (!fullText.trim()) {
        throw new HttpsError('not-found', 'テキストが空です');
      }

      // GPT-5 nanoでスケジュール形式に整形
      const scheduleData = await formatScheduleWithGPT(fullText);

      return scheduleData;
    } catch (error) {
      console.error('OCR処理エラー:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `OCR処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }
);

/**
 * GPT-5 nanoを使用してOCR結果をTimeLabel配列とRoastSchedule配列に整形
 */
async function formatScheduleWithGPT(ocrText: string): Promise<OCRScheduleResponse> {
  // Firebase Functions v2では、Secrets Managerで設定したシークレットは
  // process.envから直接読み取れる（onCallのsecretsオプションで指定したシークレット）
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  
  if (!apiKey) {
    throw new HttpsError('failed-precondition', 'OPENAI_API_KEYが設定されていません。firebase functions:secrets:set OPENAI_API_KEY で設定してください。');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    timeout: 60000, // 60秒のタイムアウト
    maxRetries: 2, // 最大2回リトライ
  });

  const prompt = `以下のホワイトボードのスケジュールテキストを解析し、本日のスケジュールとローストスケジュールを抽出してください。

テキスト:
${ocrText}

以下のJSON形式で返してください。

【本日のスケジュール（TimeLabel）の抽出ルール】
- 時間はHH:mm形式（24時間表記）で必ず抽出してください
- 時間と内容のペアを正確に抽出してください
- 内容は元のテキストからそのまま抽出し、簡潔に要約してください（不要な装飾や記号は削除）
- 時間が不明確な場合は、前後の時間や文脈から推測してください
- 時間が見つからない項目は除外してください
- ロースト関連の項目（予熱、ロースト、アフターパージ、チャフのお掃除）は除外してください
- 時間順に並べてください

【ローストスケジュール（RoastSchedule）の抽出ルール】
- 予熱オン（予熱、予熱開始など）: isRoasterOn: true, time: "HH:mm"
- ロースト（焙煎、ロースト開始など）: isRoast: true, time: "HH:mm", roastCount: 数値（何回目か、1回目、2回目などから抽出）
- アフターパージ（アフター、パージなど）: isAfterPurge: true, time: "HH:mm"（時間がない場合は空文字列 ""）
- チャフのお掃除（チャフ、お掃除など）: isChaffCleaning: true, time: "HH:mm"

【重要：ローストスケジュールの順序】
- 必ず時間順（早い順）に並べてください
- アフターパージは通常、対応するローストの直後に来ます（時間がない場合も、前のローストの後に配置）
- チャフのお掃除は通常、最後に来ます
- 順序の例：
  1. 焙煎機予熱（10:30）
  2. ロースト1回目（11:00）
  3. アフターパージ（11:00の後、時間がない場合は空文字列）
  4. ロースト2回目（11:20）
  5. アフターパージ（11:20の後、時間がない場合は空文字列）
  6. 焙煎機予熱（13:30）
  7. ロースト3回目（14:00）
  8. アフターパージ（14:00の後、時間がない場合は空文字列）
  9. チャフのお掃除（15:30）

形式:
{
  "timeLabels": [
    {
      "time": "10:00",
      "content": "朝礼"
    },
    {
      "time": "11:50",
      "content": "お昼休み"
    }
  ],
  "roastSchedules": [
    {
      "time": "10:30",
      "isRoasterOn": true
    },
    {
      "time": "11:00",
      "isRoast": true,
      "roastCount": 1
    },
    {
      "time": "",
      "isAfterPurge": true
    },
    {
      "time": "11:20",
      "isRoast": true,
      "roastCount": 2
    },
    {
      "time": "",
      "isAfterPurge": true
    }
  ]
}

JSONのみを返してください。説明文は不要です。`;

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'あなたはスケジュールを整形する専門家です。OCR結果から本日のスケジュールとローストスケジュールを正確に抽出し、JSON形式で返してください。\n\n重要な注意事項:\n1. ローストスケジュールは必ず時間順（早い順）に並べてください\n2. アフターパージは対応するローストの直後に配置してください（時間がない場合も同様）\n3. チャフのお掃除は通常、最後に配置してください\n4. 本日のスケジュールからロースト関連の項目は除外してください\n5. 時間と内容のペアを正確に抽出してください',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      },
      {
        timeout: 60000, // 60秒のタイムアウト
      }
    );

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new HttpsError('internal', 'GPT-5 nanoからの応答が空です');
    }

    // JSONをパース
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError, 'Response:', responseText);
      throw new HttpsError('internal', 'GPT-5 nanoからの応答の解析に失敗しました。再度お試しください。');
    }

    const timeLabelsData = parsed.timeLabels || [];
    const roastSchedulesData = parsed.roastSchedules || [];

    if (!Array.isArray(timeLabelsData) || !Array.isArray(roastSchedulesData)) {
      throw new HttpsError('internal', 'スケジュールデータの形式が正しくありません。');
    }

    // TimeLabel形式に変換（idとorderを追加）
    const timeLabels: TimeLabel[] = timeLabelsData.map((item: any, index: number) => ({
      id: `ocr-time-${Date.now()}-${index}`,
      time: item.time || '00:00',
      content: item.content || '',
      memo: item.memo || '',
      order: index,
    }));

    // RoastSchedule形式に変換（idとdateを追加）
    const roastSchedules: RoastSchedule[] = roastSchedulesData.map((item: any, index: number) => ({
      id: `ocr-roast-${Date.now()}-${index}`,
      date: '', // クライアント側で設定
      time: item.time || '',
      isRoasterOn: item.isRoasterOn || false,
      isRoast: item.isRoast || false,
      isAfterPurge: item.isAfterPurge || false,
      isChaffCleaning: item.isChaffCleaning || false,
      roastCount: item.roastCount,
      order: index,
    }));

    return {
      timeLabels,
      roastSchedules,
    };
  } catch (error) {
    console.error('GPT-5 nano処理エラー:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    
    // OpenAI APIのエラーを詳細に処理
    let errorMessage = 'スケジュール整形中にエラーが発生しました';
    if (error instanceof Error) {
      // OpenAI APIのエラータイプを確認
      const errorAny = error as any;
      if (errorAny.status || errorAny.response) {
        // APIエラーの場合
        const status = errorAny.status || errorAny.response?.status;
        const statusText = errorAny.statusText || errorAny.response?.statusText;
        if (status === 401) {
          errorMessage = 'OpenAI APIキーが無効です。APIキーを確認してください。';
        } else if (status === 429) {
          errorMessage = 'OpenAI APIのレート制限に達しました。しばらく待ってから再度お試しください。';
        } else if (status === 500 || status === 502 || status === 503) {
          errorMessage = 'OpenAI APIサーバーエラーが発生しました。しばらく待ってから再度お試しください。';
        } else if (errorAny.message?.includes('Connection') || errorAny.message?.includes('network') || errorAny.message?.includes('ECONNREFUSED') || errorAny.message?.includes('ETIMEDOUT')) {
          errorMessage = 'OpenAI APIへの接続エラーが発生しました。ネットワーク接続を確認してください。';
        } else if (errorAny.message?.includes('timeout') || errorAny.message?.includes('TIMEOUT')) {
          errorMessage = 'OpenAI APIへのリクエストがタイムアウトしました。しばらく待ってから再度お試しください。';
        } else {
          errorMessage = `OpenAI APIエラー: ${errorAny.message || statusText || '不明なエラー'}`;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
    }
    
    throw new HttpsError('internal', errorMessage);
  }
}

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import OpenAI from 'openai';
import type { TimeLabel, RoastSchedule } from './types';

// OCR結果とスケジュール抽出結果の型
interface OCRScheduleResponse {
  timeLabels: TimeLabel[];
  roastSchedules: RoastSchedule[];
}

// 定数: 画像サイズとOCRテキスト長の上限
// Base64は元データの約1.33倍になるため、20MB制限に対して26MB相当の文字数を上限とする
const MAX_BASE64_LENGTH = 26 * 1024 * 1024; // 約26MB分の文字数
const MAX_OCR_TEXT_LENGTH = 10000; // OCRテキストの最大文字数

/**
 * 詳細なエラーログを出力するヘルパー関数
 */
function logDetailedError(
  tag: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): void {
  const errorObj = error as Record<string, unknown>;
  const timestamp = new Date().toISOString();
  const errorType = error?.constructor?.name || 'Unknown';
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const code = errorObj?.code ?? errorObj?.status ?? undefined;

  console.error(`${tag}`, {
    timestamp,
    errorType,
    code,
    message,
    stack,
    ...additionalInfo,
  });
}

/**
 * Vision APIエラーからユーザー向けメッセージを生成
 */
function getVisionErrorMessage(error: unknown): string {
  const errorObj = error as Record<string, unknown>;
  const message = error instanceof Error ? error.message : String(error);
  const responseObj = errorObj?.response as Record<string, unknown> | undefined;
  const status = errorObj?.status ?? errorObj?.code ?? responseObj?.status;

  // ネットワーク接続エラー
  if (
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENETUNREACH')
  ) {
    return 'Vision APIへの接続エラーが発生しました。ネットワーク接続を確認してください。';
  }

  // タイムアウト
  if (
    message.includes('ETIMEDOUT') ||
    message.toLowerCase().includes('timeout')
  ) {
    return 'Vision APIへのリクエストがタイムアウトしました。しばらく待ってから再度お試しください。';
  }

  // HTTPステータスコードベースのエラー
  if (status === 400) {
    return 'リクエストが不正です。画像形式を確認してください。';
  }
  if (status === 403) {
    return 'Vision APIの認証エラーが発生しました。APIキーを確認してください。';
  }
  if (status === 413) {
    return '画像サイズが大きすぎます。20MB以下の画像をアップロードしてください。';
  }
  if (status === 429) {
    return 'Vision APIのレート制限に達しました。しばらく待ってから再度お試しください。';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'Vision APIサーバーエラーが発生しました。しばらく待ってから再度お試しください。';
  }

  // その他のエラー
  return `OCR処理中にエラーが発生しました: ${message}`;
}

/**
 * 画像からスケジュールを抽出するFirebase Function
 */
export const ocrScheduleFromImage = onCall(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 300, // 5分（Vision API + OpenAI APIの2段階処理を考慮）
    memory: '512MiB', // 画像処理とGPT応答のJSONパースを考慮
    secrets: ['OPENAI_API_KEY', 'GOOGLE_VISION_API_KEY'], // Secrets Managerからシークレットを取得
  },
  async (request) => {
    // 認証チェック
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '認証が必要です');
    }

    const { imageBase64 } = request.data;

    // バリデーション: imageBase64の存在と型チェック
    if (!imageBase64) {
      throw new HttpsError('invalid-argument', '画像データが必要です');
    }
    if (typeof imageBase64 !== 'string') {
      throw new HttpsError('invalid-argument', '画像データはBase64文字列である必要があります');
    }

    // バリデーション: 画像サイズチェック（Base64長さで判定）
    if (imageBase64.length > MAX_BASE64_LENGTH) {
      console.warn(
        `[SIZE_VALIDATION] 画像サイズが上限を超過: ${imageBase64.length} 文字 (上限: ${MAX_BASE64_LENGTH} 文字)`
      );
      throw new HttpsError(
        'invalid-argument',
        '画像サイズが大きすぎます。20MB以下の画像をアップロードしてください。'
      );
    }

    try {
      // Base64プレフィックスを削除（data:image/jpeg;base64,など）
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      // Google Vision APIでOCR実行
      const apiKey = process.env.GOOGLE_VISION_API_KEY?.trim();
      if (!apiKey) {
        throw new HttpsError('failed-precondition', 'GOOGLE_VISION_API_KEYが設定されていません。firebase functions:secrets:set GOOGLE_VISION_API_KEY で設定してください。');
      }
      const visionClient = new ImageAnnotatorClient({ apiKey });

      const [result] = await visionClient.textDetection({
        image: { content: base64Data },
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new HttpsError('not-found', '画像からテキストを検出できませんでした');
      }

      // 最初の要素は全体のテキスト
      let fullText = detections[0].description || '';
      if (!fullText.trim()) {
        throw new HttpsError('not-found', 'テキストが空です');
      }

      // OCRテキスト長の制限チェック
      if (fullText.length > MAX_OCR_TEXT_LENGTH) {
        console.warn(
          `[OCR_TEXT_TRUNCATION] OCRテキストが上限を超過: ${fullText.length} 文字 → ${MAX_OCR_TEXT_LENGTH} 文字に切り捨て`
        );
        fullText = fullText.substring(0, MAX_OCR_TEXT_LENGTH);
      }

      // GPT-5 nanoでスケジュール形式に整形
      const scheduleData = await formatScheduleWithGPT(fullText);

      return scheduleData;
    } catch (error) {
      // 詳細なエラーログを出力
      logDetailedError('[VISION_ERROR]', error);

      // HttpsErrorはそのまま再throw
      if (error instanceof HttpsError) {
        throw error;
      }

      // Vision APIのエラー種別に応じたメッセージを生成
      const errorMessage = getVisionErrorMessage(error);
      throw new HttpsError('internal', errorMessage);
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
- **重要：時間が明示されていない項目でも、前の時間の直下に書かれている場合は抽出してください**
  - 例：「10:00 朝礼」の下に「ロースト2回・ハンドピック」と書かれている場合、「10:00 ロースト2回・ハンドピック」として抽出
  - 例：「13:00」の下に「ロースト1回・ハンドピック」と書かれている場合、「13:00 ロースト1回・ハンドピック」として抽出
- 時間が不明確な場合は、前後の時間や文脈から推測してください
- 時間が見つからない項目で、前の時間も推測できない場合は除外してください
- **注意：本日のスケジュールセクションに書かれているロースト関連の項目（例：「ロースト2回・ハンドピック」）は抽出してください**
  - これらはローストスケジュールセクション（▲ローストスケジュール）とは別の、作業内容として記載されているものです
- ローストスケジュールセクション（▲ローストスケジュール）に書かれている項目は除外してください
- 時間順に並べてください

【ローストスケジュール（RoastSchedule）の抽出ルール】
- 予熱オン（予熱、予熱開始など）: isRoasterOn: true, time: "HH:mm"
- ロースト（焙煎、ロースト開始など）: isRoast: true, time: "HH:mm", roastCount: 数値（何回目か、1回目、2回目などから抽出）
- アフターパージ（アフター、パージなど）: isAfterPurge: true, time: "HH:mm"（時間がない場合は空文字列 ""）
- チャフのお掃除（チャフ、お掃除など）: isChaffCleaning: true, time: "HH:mm"

【重要：ローストスケジュールの順序】
- 必ず時間順（早い順）に並べてください
- アフターパージは、対応するローストの直後に配置してください（時間がない場合は空文字列 ""）
  - 注意：アフターパージは全てのローストの後に来るわけではありません。テキスト上でローストの直後に書かれている場合のみ抽出してください
  - 例：11:20 2回目の直後に「アフターパージ」と書かれている場合、11:20の後に配置
- チャフのお掃除は通常、最後に来ます
- 順序の例（実際のホワイトボードの例）：
  1. 焙煎機予熱（10:30）
  2. ロースト1回目（11:00）
  3. ロースト2回目（11:20）
  4. アフターパージ（11:20の直後に書かれている場合、時間がない場合は空文字列 ""）
  5. 焙煎機予熱（13:30）
  6. ロースト3回目（14:00）
  7. アフターパージ（14:00の直後に書かれている場合、時間がない場合は空文字列 ""）
  8. チャフのお掃除（15:30）

形式:
{
  "timeLabels": [
    {
      "time": "10:00",
      "content": "朝礼"
    },
    {
      "time": "10:00",
      "content": "ロースト2回・ハンドピック"
    },
    {
      "time": "11:50",
      "content": "お昼休み"
    },
    {
      "time": "13:00",
      "content": "ロースト1回・ハンドピック"
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
            content: 'あなたはスケジュールを整形する専門家です。OCR結果から本日のスケジュールとローストスケジュールを正確に抽出し、JSON形式で返してください。\n\n重要な注意事項:\n1. 本日のスケジュールセクションに書かれている項目は、時間が明示されていなくても、前の時間の直下に書かれている場合は抽出してください\n2. 本日のスケジュールセクションに書かれている「ロースト○回・ハンドピック」などの作業内容は抽出してください（これらはローストスケジュールセクションとは別です）\n3. ローストスケジュールは必ず時間順（早い順）に並べてください\n4. アフターパージは対応するローストの直後に配置してください（時間がない場合も同様）\n5. チャフのお掃除は通常、最後に配置してください\n6. ローストスケジュールセクション（▲ローストスケジュール）に書かれている項目は本日のスケジュールから除外してください\n7. 時間と内容のペアを正確に抽出してください',
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
    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      // JSONパースエラーの詳細ログ
      const timestamp = new Date().toISOString();
      const responseLength = responseText.length;
      const responsePreview = responseText.substring(0, 500);

      console.error('[JSON_PARSE_ERROR]', {
        timestamp,
        errorType: parseError?.constructor?.name || 'Unknown',
        message: parseError instanceof Error ? parseError.message : String(parseError),
        stack: parseError instanceof Error ? parseError.stack : undefined,
        responseLength,
        responsePreview,
      });

      throw new HttpsError('internal', 'GPT-5 nanoからの応答の解析に失敗しました。再度お試しください。');
    }

    const parsedObject = parsed as { timeLabels?: unknown; roastSchedules?: unknown };
    const timeLabelsData = Array.isArray(parsedObject.timeLabels) ? parsedObject.timeLabels : [];
    const roastSchedulesData = Array.isArray(parsedObject.roastSchedules) ? parsedObject.roastSchedules : [];

    if (!Array.isArray(timeLabelsData) || !Array.isArray(roastSchedulesData)) {
      throw new HttpsError('internal', 'スケジュールデータの形式が正しくありません。');
    }

    // TimeLabel形式に変換（idとorderを追加）
    const timeLabels: TimeLabel[] = timeLabelsData.map((item, index: number) => {
      const timeLabelItem = item as Record<string, unknown>;
      return {
        id: `ocr-time-${Date.now()}-${index}`,
        time: typeof timeLabelItem.time === 'string' ? timeLabelItem.time : '00:00',
        content: typeof timeLabelItem.content === 'string' ? timeLabelItem.content : '',
        memo: typeof timeLabelItem.memo === 'string' ? timeLabelItem.memo : '',
        order: index,
      };
    });

    // RoastSchedule形式に変換（idとdateを追加）
    const roastSchedules: RoastSchedule[] = roastSchedulesData.map((item, index: number) => {
      const roastScheduleItem = item as Record<string, unknown>;
      return {
        id: `ocr-roast-${Date.now()}-${index}`,
        date: '', // クライアント側で設定
        time: typeof roastScheduleItem.time === 'string' ? roastScheduleItem.time : '',
        isRoasterOn: Boolean(roastScheduleItem.isRoasterOn),
        isRoast: Boolean(roastScheduleItem.isRoast),
        isAfterPurge: Boolean(roastScheduleItem.isAfterPurge),
        isChaffCleaning: Boolean(roastScheduleItem.isChaffCleaning),
        roastCount: typeof roastScheduleItem.roastCount === 'number' ? roastScheduleItem.roastCount : undefined,
        order: index,
      };
    });

    return {
      timeLabels,
      roastSchedules,
    };
  } catch (error) {
    // HttpsErrorはそのまま再throw
    if (error instanceof HttpsError) {
      throw error;
    }

    // OpenAIエラーの詳細ログを出力
    const timestamp = new Date().toISOString();
    const errorObj = error as Record<string, unknown>;
    const responseObj = errorObj?.response as Record<string, unknown> | undefined;
    const errorType = error?.constructor?.name || 'Unknown';
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const status = errorObj?.status ?? responseObj?.status ?? undefined;
    const code = errorObj?.code ?? undefined;

    console.error('[OPENAI_ERROR]', {
      timestamp,
      errorType,
      code,
      status,
      message,
      stack,
      // response全体は膨大になりすぎる可能性があるため、statusのみ抽出
      responseStatus: responseObj?.status ?? undefined,
    });

    // OpenAI APIのエラーを詳細に処理
    let errorMessage = 'スケジュール整形中にエラーが発生しました';
    if (error instanceof Error) {
      // OpenAI APIのエラータイプを確認
      const openAiError = error as { status?: number; response?: { status?: number; statusText?: string }; message?: string };
      if (openAiError.status || openAiError.response) {
        // APIエラーの場合
        const httpStatus = openAiError.status ?? openAiError.response?.status;
        const statusText = openAiError.response?.statusText;
        if (httpStatus === 401) {
          errorMessage = 'OpenAI APIキーが無効です。APIキーを確認してください。';
        } else if (httpStatus === 429) {
          errorMessage = 'OpenAI APIのレート制限に達しました。しばらく待ってから再度お試しください。';
        } else if (httpStatus === 500 || httpStatus === 502 || httpStatus === 503) {
          errorMessage = 'OpenAI APIサーバーエラーが発生しました。しばらく待ってから再度お試しください。';
        } else if (openAiError.message?.includes('Connection') || openAiError.message?.includes('network') || openAiError.message?.includes('ECONNREFUSED') || openAiError.message?.includes('ETIMEDOUT')) {
          errorMessage = 'OpenAI APIへの接続エラーが発生しました。ネットワーク接続を確認してください。';
        } else if (openAiError.message?.includes('timeout') || openAiError.message?.includes('TIMEOUT')) {
          errorMessage = 'OpenAI APIへのリクエストがタイムアウトしました。しばらく待ってから再度お試しください。';
        } else {
          errorMessage = `OpenAI APIエラー: ${openAiError.message || statusText || '不明なエラー'}`;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
    }
    
    throw new HttpsError('internal', errorMessage);
  }
}

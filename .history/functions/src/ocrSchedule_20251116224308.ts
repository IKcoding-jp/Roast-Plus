import { ImageAnnotatorClient } from '@google-cloud/vision';
import OpenAI from 'openai';

interface TimeLabel {
  id: string;
  time: string; // HH:mm形式
  content: string;
  memo?: string;
  order?: number;
}

interface RoastSchedule {
  id: string;
  date: string; // YYYY-MM-DD形式
  time: string; // HH:mm形式（アフターパージの場合は空文字列も可）
  isRoasterOn?: boolean; // 焙煎機予熱
  isRoast?: boolean; // ロースト
  isAfterPurge?: boolean; // アフターパージ
  isChaffCleaning?: boolean; // チャフのお掃除
  roastCount?: number; // 何回目
  order?: number; // 時間順ソート用
}

interface OCRScheduleResult {
  timeLabels: TimeLabel[];
  roastSchedules: RoastSchedule[];
}

/**
 * 画像からスケジュールを抽出し、TimeLabel配列を生成
 */
export async function ocrSchedule(imageBase64: string): Promise<OCRScheduleResult> {
  // Base64プレフィックスを削除（data:image/jpeg;base64,など）
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  // Google Vision APIでOCR実行
  // 環境変数にAPIキーが設定されている場合はそれを使用、なければサービスアカウント認証を使用
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  const visionClient = apiKey
    ? new ImageAnnotatorClient({ apiKey })
    : new ImageAnnotatorClient();
  
  const [visionResult] = await visionClient.textDetection({
    image: { content: base64Data },
  });

  const detections = visionResult.textAnnotations;
  if (!detections || detections.length === 0) {
    throw new Error('画像からテキストを検出できませんでした');
  }

  // 最初の要素は全体のテキスト
  const fullText = detections[0].description || '';

  if (!fullText.trim()) {
    throw new Error('テキストが空です');
  }

  // GPT-5 nanoでスケジュール形式に整形
  const scheduleResult = await formatScheduleWithGPT(fullText);

  return {
    timeLabels: scheduleResult.timeLabels,
    roastSchedules: scheduleResult.roastSchedules,
  };
}

/**
 * GPT-5 nanoを使用してOCR結果をTimeLabel配列とRoastSchedule配列に整形
 */
async function formatScheduleWithGPT(ocrText: string): Promise<{ timeLabels: TimeLabel[]; roastSchedules: RoastSchedule[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEYが設定されていません');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const prompt = `以下のホワイトボードのスケジュールテキストを、本日のスケジュール（timeLabels）とローストスケジュール（roastSchedules）に分類して整形してください。

テキスト:
${ocrText}

以下のルールに従って分類してください：

【本日のスケジュール（timeLabels）】
- 通常の業務スケジュール（朝礼、お昼休み、おそうじ、終礼、お疲れ様でしたなど）
- ローストスケジュールのキーワードを含まない内容のみ
- 重要：「予熱オン」「予熱」「◯回目」「回目」「アフターパージ」「チャフのお掃除」「チャフ」「ローストスケジュール」などのキーワードを含む項目は本日のスケジュールに含めない

【ローストスケジュール（roastSchedules）】
以下のキーワードを含む項目は必ずローストスケジュールとして分類してください：
- 「予熱オン」「予熱」→ isRoasterOn: true
- 「1回目」「2回目」「3回目」など（数字+回目）→ isRoast: true, roastCount: 数字（「1回目」なら1、「2回目」なら2）
- 「アフターパージ」→ isAfterPurge: true
- 「チャフのお掃除」「チャフ」→ isChaffCleaning: true

重要：ローストスケジュールのキーワードを含む項目は、本日のスケジュール（timeLabels）には絶対に含めないでください。

時間はHH:mm形式（24時間表記）で、時間が不明確な場合は推測してください。時間が見つからない項目は除外してください。
アフターパージに時間が記載されていない場合は、直前のローストの時間を使用するか、空文字列にしてください。

以下のJSON形式で返してください：

{
  "timeLabels": [
    {
      "time": "09:00",
      "content": "内容の要約"
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
      "time": "15:30",
      "isChaffCleaning": true
    }
  ]
}

JSONのみを返してください。説明文は不要です。`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'あなたはスケジュールを整形する専門家です。OCR結果から時間と内容を正確に抽出し、JSON形式で返してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('GPT-5 nanoからの応答が空です');
    }

    // JSONをパース
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error('JSONパースエラー:', parseError, 'Response:', responseText);
      throw new Error('GPT-5 nanoからの応答の解析に失敗しました。再度お試しください。');
    }

    const timeLabelsData = parsed.timeLabels || [];
    const roastSchedulesData = parsed.roastSchedules || [];

    if (!Array.isArray(timeLabelsData)) {
      throw new Error('スケジュールデータの形式が正しくありません。');
    }

    if (!Array.isArray(roastSchedulesData)) {
      throw new Error('ローストスケジュールデータの形式が正しくありません。');
    }

    if (timeLabelsData.length === 0 && roastSchedulesData.length === 0) {
      throw new Error('スケジュールが見つかりませんでした。画像を確認してください。');
    }

    const timestamp = Date.now();

    // TimeLabel形式に変換（idとorderを追加）
    const timeLabels: TimeLabel[] = timeLabelsData.map(
      (item: any, index: number) => ({
        id: `ocr-${timestamp}-${index}`,
        time: item.time || '00:00',
        content: item.content || '',
        memo: item.memo || '',
        order: index,
      })
    );

    // RoastSchedule形式に変換（idとorderを追加）
    const roastSchedules: RoastSchedule[] = roastSchedulesData.map(
      (item: any, index: number) => ({
        id: `ocr-roast-${timestamp}-${index}`,
        date: '', // 日付は呼び出し側で設定
        time: item.time || '',
        isRoasterOn: item.isRoasterOn || undefined,
        isRoast: item.isRoast || undefined,
        isAfterPurge: item.isAfterPurge || undefined,
        isChaffCleaning: item.isChaffCleaning || undefined,
        roastCount: item.roastCount || undefined,
        order: index,
      })
    );

    return { timeLabels, roastSchedules };
  } catch (error: any) {
    console.error('GPT-5 nano処理エラー:', error);
    // 既にエラーメッセージが設定されている場合はそのまま使用
    if (error.message && (error.message.includes('GPT-5 nano') || error.message.includes('スケジュール'))) {
      throw error;
    }
    throw new Error(`スケジュール整形中にエラーが発生しました: ${error.message || '不明なエラー'}`);
  }
}


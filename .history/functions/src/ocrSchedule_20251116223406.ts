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
  
  const [result] = await visionClient.textDetection({
    image: { content: base64Data },
  });

  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) {
    throw new Error('画像からテキストを検出できませんでした');
  }

  // 最初の要素は全体のテキスト
  const fullText = detections[0].description || '';

  if (!fullText.trim()) {
    throw new Error('テキストが空です');
  }

  // GPT-5 nanoでスケジュール形式に整形
  const result = await formatScheduleWithGPT(fullText);

  return {
    timeLabels: result.timeLabels,
    roastSchedules: result.roastSchedules,
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

  const prompt = `以下のホワイトボードのスケジュールテキストを、時間と内容を持つスケジュール形式に整形してください。

テキスト:
${ocrText}

以下のJSON形式で返してください。時間はHH:mm形式（24時間表記）で、内容は簡潔に要約してください。時間が不明確な場合は推測してください。時間が見つからない項目は除外してください。

形式:
{
  "timeLabels": [
    {
      "time": "09:00",
      "content": "内容の要約"
    },
    {
      "time": "10:30",
      "content": "内容の要約"
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

    if (!Array.isArray(timeLabelsData)) {
      throw new Error('スケジュールデータの形式が正しくありません。');
    }

    if (timeLabelsData.length === 0) {
      throw new Error('スケジュールが見つかりませんでした。画像を確認してください。');
    }

    // TimeLabel形式に変換（idとorderを追加）
    const timeLabels: TimeLabel[] = timeLabelsData.map(
      (item: any, index: number) => ({
        id: `ocr-${Date.now()}-${index}`,
        time: item.time || '00:00',
        content: item.content || '',
        memo: item.memo || '',
        order: index,
      })
    );

    return timeLabels;
  } catch (error: any) {
    console.error('GPT-5 nano処理エラー:', error);
    // 既にエラーメッセージが設定されている場合はそのまま使用
    if (error.message && (error.message.includes('GPT-5 nano') || error.message.includes('スケジュール'))) {
      throw error;
    }
    throw new Error(`スケジュール整形中にエラーが発生しました: ${error.message || '不明なエラー'}`);
  }
}


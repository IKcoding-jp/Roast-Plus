/**
 * 共通ヘルパー関数・型定義
 */

// OCR結果とスケジュール抽出結果の型
export interface OCRScheduleResponse {
  timeLabels: import('./types').TimeLabel[];
  roastSchedules: import('./types').RoastSchedule[];
}

// テイスティング分析のリクエスト型定義
export interface TastingAnalysisRequest {
  beanName: string;
  roastLevel: string;
  comments: string[];
  averageScores: {
    bitterness: number;
    acidity: number;
    body: number;
    sweetness: number;
    aroma: number;
  };
}

// テイスティング分析のレスポンス型定義
export interface TastingAnalysisResponse {
  status: 'success' | 'error';
  text: string;
  message?: string;
}

// 定数: 画像サイズの上限
// Base64は元データの約1.33倍になるため、20MB制限に対して26MB相当の文字数を上限とする
export const MAX_BASE64_LENGTH = 26 * 1024 * 1024; // 約26MB分の文字数

/**
 * 詳細なエラーログを出力するヘルパー関数
 */
export function logDetailedError(
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

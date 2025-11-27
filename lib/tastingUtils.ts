import type { TastingRecord, TastingSession } from '@/types';

// 平均スコアの型定義
export interface AverageScores {
  bitterness: number; // 苦味
  acidity: number; // 酸味
  body: number; // ボディ
  sweetness: number; // 甘み
  aroma: number; // 香り
  overallRating: number; // 総合
}

/**
 * セッション内の記録から平均スコアを計算する
 * @param records セッションに紐づく記録の配列
 * @returns 平均スコア
 */
export function calculateAverageScores(records: TastingRecord[]): AverageScores {
  if (records.length === 0) {
    return {
      bitterness: 0,
      acidity: 0,
      body: 0,
      sweetness: 0,
      aroma: 0,
      overallRating: 0,
    };
  }

  const sum = records.reduce(
    (acc, record) => ({
      bitterness: acc.bitterness + record.bitterness,
      acidity: acc.acidity + record.acidity,
      body: acc.body + record.body,
      sweetness: acc.sweetness + record.sweetness,
      aroma: acc.aroma + record.aroma,
      overallRating: acc.overallRating + record.overallRating,
    }),
    {
      bitterness: 0,
      acidity: 0,
      body: 0,
      sweetness: 0,
      aroma: 0,
      overallRating: 0,
    }
  );

  const count = records.length;
  return {
    bitterness: sum.bitterness / count,
    acidity: sum.acidity / count,
    body: sum.body / count,
    sweetness: sum.sweetness / count,
    aroma: sum.aroma / count,
    overallRating: sum.overallRating / count,
  };
}

/**
 * セッションに紐づく記録を取得する
 * @param records 全記録の配列
 * @param sessionId セッションID
 * @returns セッションに紐づく記録の配列
 */
export function getRecordsBySessionId(
  records: TastingRecord[],
  sessionId: string
): TastingRecord[] {
  return records.filter((record) => record.sessionId === sessionId);
}

/**
 * セッションの記録数を取得する
 * @param records 全記録の配列
 * @param sessionId セッションID
 * @returns 記録数
 */
export function getRecordCountBySessionId(
  records: TastingRecord[],
  sessionId: string
): number {
  return getRecordsBySessionId(records, sessionId).length;
}


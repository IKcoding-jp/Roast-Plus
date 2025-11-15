import type { RoastTimerRecord, RoastTimerSettings } from '@/types';

/**
 * 過去のロースト記録から、指定された条件に一致する記録を検索し、
 * 平均時間とおすすめ時間を計算して返す
 * 
 * @param records 過去のロースト記録の配列
 * @param beanName 豆の名前
 * @param weight 重さ（g）
 * @param roastLevel 焙煎度合い
 * @param settings ローストタイマー設定
 * @returns 平均時間とおすすめ時間のオブジェクト。一致する記録が2件未満の場合はnull
 */
export function calculateRecommendedTime(
  records: RoastTimerRecord[],
  beanName: string,
  weight: 200 | 300 | 500,
  roastLevel: '浅煎り' | '中煎り' | '中深煎り' | '深煎り',
  settings: RoastTimerSettings
): { averageDuration: number; recommendedDuration: number } | null {
  // 条件に一致する記録をフィルタリング
  const matchingRecords = records.filter(
    (record) =>
      record.beanName === beanName &&
      record.weight === weight &&
      record.roastLevel === roastLevel
  );

  // 2件未満の場合はnullを返す
  if (matchingRecords.length < 2) {
    return null;
  }

  // 平均時間を計算
  const totalDuration = matchingRecords.reduce(
    (sum, record) => sum + record.duration,
    0
  );
  const averageDuration = Math.round(totalDuration / matchingRecords.length);

  // おすすめ時間を計算（平均時間から「焙煎室に行くまでの時間」を減算）
  let recommendedDuration = averageDuration - settings.goToRoastRoomTimeSeconds;
  
  // 計算結果が60秒未満の場合は60秒に調整
  if (recommendedDuration < 60) {
    recommendedDuration = 60;
  }

  return {
    averageDuration,
    recommendedDuration,
  };
}

/**
 * 秒数を分:秒形式の文字列に変換
 * 
 * @param seconds 秒数
 * @returns "MM:SS"形式の文字列
 */
export function formatTime(seconds: number): string {
  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 秒数を分単位の文字列に変換（例: "5分"）
 * 
 * @param seconds 秒数
 * @returns "X分"形式の文字列
 */
export function formatTimeAsMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes}分`;
}


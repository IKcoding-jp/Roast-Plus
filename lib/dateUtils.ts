/**
 * 日付フォーマットユーティリティ関数
 */

/**
 * DateオブジェクトをYYYY-MM-DD形式の文字列に変換
 * @param date 変換対象の日付（省略時は現在日時）
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

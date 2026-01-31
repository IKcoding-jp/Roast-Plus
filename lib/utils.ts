/**
 * 文字列変換ユーティリティ関数
 */

/**
 * 全角数字を半角数字に変換
 * @param str 変換対象の文字列
 * @returns 半角数字に変換された文字列
 */
export function convertToHalfWidth(str: string): string {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

/**
 * 数字以外の文字を除去
 * @param str 変換対象の文字列
 * @returns 数字のみの文字列
 */
export function removeNonNumeric(str: string): string {
  return str.replace(/[^0-9]/g, '');
}

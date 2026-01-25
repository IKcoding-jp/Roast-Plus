/**
 * 焙煎タイマーで使用するユーティリティ関数
 */

/**
 * 全角数字を半角数字に変換
 */
export function convertToHalfWidth(str: string): string {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

/**
 * 数字以外の文字を除去
 */
export function removeNonNumeric(str: string): string {
  return str.replace(/[^0-9]/g, '');
}

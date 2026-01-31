/**
 * グローバル型定義
 * window オブジェクトの拡張など
 */

declare global {
  interface Window {
    /**
     * クイズのデバッグモードが有効かどうか
     */
    __QUIZ_DEBUG_MODE__?: boolean;

    /**
     * クイズのデバッグ用日付オフセット（日数）
     */
    __QUIZ_DEBUG_DATE_OFFSET__?: number;
  }
}

// このファイルをモジュールとして扱うために必要
export {};

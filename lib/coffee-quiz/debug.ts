/**
 * コーヒークイズ デバッグユーティリティ
 * 日付操作やテスト用の機能を提供
 */

// デバッグ用の日付オフセット（日数）
let debugDateOffset = 0;

// デバッグモードが有効かどうか
let debugModeEnabled = false;

/**
 * デバッグモードを有効/無効にする
 */
export function setDebugMode(enabled: boolean): void {
  debugModeEnabled = enabled;
  if (typeof window !== 'undefined') {
    (window as Window & { __QUIZ_DEBUG_MODE__: boolean }).__QUIZ_DEBUG_MODE__ = enabled;
    // localStorageに永続化
    try {
      localStorage.setItem('quiz_debug_mode', String(enabled));
    } catch {
      // localStorage利用不可の場合は無視
    }
  }
}

/**
 * デバッグモードが有効かどうかを取得
 */
export function isDebugMode(): boolean {
  if (typeof window !== 'undefined') {
    // windowオブジェクトから取得
    const windowValue = (window as Window & { __QUIZ_DEBUG_MODE__?: boolean }).__QUIZ_DEBUG_MODE__;
    if (windowValue !== undefined) return windowValue;
    
    // localStorageから復元
    try {
      const stored = localStorage.getItem('quiz_debug_mode');
      if (stored !== null) {
        const enabled = stored === 'true';
        (window as Window & { __QUIZ_DEBUG_MODE__: boolean }).__QUIZ_DEBUG_MODE__ = enabled;
        return enabled;
      }
    } catch {
      // localStorage利用不可の場合は無視
    }
    return debugModeEnabled;
  }
  return debugModeEnabled;
}

/**
 * デバッグ用の日付オフセットを設定（日数）
 * 例: 1 = 明日、-1 = 昨日
 */
export function setDebugDateOffset(days: number): void {
  debugDateOffset = days;
  if (typeof window !== 'undefined') {
    (window as Window & { __QUIZ_DEBUG_DATE_OFFSET__: number }).__QUIZ_DEBUG_DATE_OFFSET__ = days;
    // localStorageに永続化
    try {
      localStorage.setItem('quiz_debug_date_offset', String(days));
    } catch {
      // localStorage利用不可の場合は無視
    }
  }
}

/**
 * デバッグ用の日付オフセットを取得
 */
export function getDebugDateOffset(): number {
  if (typeof window !== 'undefined') {
    // windowオブジェクトから取得
    const windowValue = (window as Window & { __QUIZ_DEBUG_DATE_OFFSET__?: number }).__QUIZ_DEBUG_DATE_OFFSET__;
    if (windowValue !== undefined) return windowValue;
    
    // localStorageから復元
    try {
      const stored = localStorage.getItem('quiz_debug_date_offset');
      if (stored !== null) {
        const offset = parseInt(stored, 10);
        if (!isNaN(offset)) {
          (window as Window & { __QUIZ_DEBUG_DATE_OFFSET__: number }).__QUIZ_DEBUG_DATE_OFFSET__ = offset;
          return offset;
        }
      }
    } catch {
      // localStorage利用不可の場合は無視
    }
    return debugDateOffset;
  }
  return debugDateOffset;
}

/**
 * 現在の日付を取得（デバッグモード対応）
 */
export function getCurrentDate(): Date {
  const now = new Date();
  if (isDebugMode()) {
    const offset = getDebugDateOffset();
    now.setDate(now.getDate() + offset);
  }
  return now;
}

/**
 * 今日の日付文字列を取得（YYYY-MM-DD形式、デバッグモード対応）
 */
export function getDebugTodayDateString(): string {
  return getCurrentDate().toISOString().split('T')[0];
}

/**
 * デバッグ状態をリセット
 */
export function resetDebugState(): void {
  debugDateOffset = 0;
  debugModeEnabled = false;
  if (typeof window !== 'undefined') {
    (window as Window & { __QUIZ_DEBUG_MODE__?: boolean; __QUIZ_DEBUG_DATE_OFFSET__?: number }).__QUIZ_DEBUG_MODE__ = false;
    (window as Window & { __QUIZ_DEBUG_MODE__?: boolean; __QUIZ_DEBUG_DATE_OFFSET__?: number }).__QUIZ_DEBUG_DATE_OFFSET__ = 0;
    // localStorageからも削除
    try {
      localStorage.removeItem('quiz_debug_mode');
      localStorage.removeItem('quiz_debug_date_offset');
    } catch {
      // localStorage利用不可の場合は無視
    }
  }
}

/**
 * デバッグ情報を取得
 */
export function getDebugInfo(): {
  debugMode: boolean;
  dateOffset: number;
  currentDate: string;
  realDate: string;
} {
  return {
    debugMode: isDebugMode(),
    dateOffset: getDebugDateOffset(),
    currentDate: getDebugTodayDateString(),
    realDate: new Date().toISOString().split('T')[0],
  };
}

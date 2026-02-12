import type { RoastTimerSettings, RoastTimerState } from '@/types';
import type { QuizProgress } from '@/lib/coffee-quiz/types';

// ローカルストレージ管理

const SELECTED_MEMBER_ID_KEY = 'roastplus_selected_member_id';
const ROAST_TIMER_STATE_KEY = 'roastplus_roast_timer_state';
const ROAST_TIMER_SETTINGS_KEY = 'roastplus_roast_timer_settings';
const DEVICE_ID_KEY = 'roastplus_device_id';
const LAST_46_TASTE_KEY = 'roastplus_last_46_taste';
const LAST_46_STRENGTH_KEY = 'roastplus_last_46_strength';

const TIMER_STATE_VERSION = 1;
const TIMER_SETTINGS_VERSION = 1;

interface StoredRoastTimerState {
  version: number;
  state: RoastTimerState;
}

interface StoredRoastTimerSettings {
  version: number;
  settings: RoastTimerSettings;
}

const parseJson = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse JSON from localStorage:', error);
    return null;
  }
};

/**
 * 選択されたメンバーIDを保存
 */
export function setSelectedMemberId(memberId: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (memberId === null) {
    localStorage.removeItem(SELECTED_MEMBER_ID_KEY);
  } else {
    localStorage.setItem(SELECTED_MEMBER_ID_KEY, memberId);
  }
}

/**
 * 選択されたメンバーIDを取得
 */
export function getSelectedMemberId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(SELECTED_MEMBER_ID_KEY);
}

/**
 * ローストタイマー状態を保存
 */
export function setRoastTimerState(state: RoastTimerState | null | undefined): void {
  if (typeof window === 'undefined') return;

  if (state === null || state === undefined) {
    localStorage.removeItem(ROAST_TIMER_STATE_KEY);
  } else {
    const stored: StoredRoastTimerState = {
      version: TIMER_STATE_VERSION,
      state,
    };
    localStorage.setItem(ROAST_TIMER_STATE_KEY, JSON.stringify(stored));
  }
}

/**
 * ローストタイマー状態を取得
 */
export function getRoastTimerState(): RoastTimerState | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(ROAST_TIMER_STATE_KEY);
  if (!stored) return null;

  const parsed = parseJson<StoredRoastTimerState | RoastTimerState>(stored);
  if (!parsed) return null;

  // バージョン付きデータ
  if ('version' in parsed && parsed.version === TIMER_STATE_VERSION) {
    return (parsed as StoredRoastTimerState).state;
  }

  // レガシーデータ（version未設定）→ v1として扱う
  return parsed as RoastTimerState;
}

/**
 * ローストタイマー設定を保存
 */
export function setRoastTimerSettings(settings: RoastTimerSettings | null | undefined): void {
  if (typeof window === 'undefined') return;

  if (settings === null || settings === undefined) {
    localStorage.removeItem(ROAST_TIMER_SETTINGS_KEY);
  } else {
    const stored: StoredRoastTimerSettings = {
      version: TIMER_SETTINGS_VERSION,
      settings,
    };
    localStorage.setItem(ROAST_TIMER_SETTINGS_KEY, JSON.stringify(stored));
  }
}

/**
 * ローストタイマー設定を取得
 */
export function getRoastTimerSettings(): RoastTimerSettings | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(ROAST_TIMER_SETTINGS_KEY);
  if (!stored) return null;

  const parsed = parseJson<StoredRoastTimerSettings | RoastTimerSettings>(stored);
  if (!parsed) return null;

  // バージョン付きデータ
  if ('version' in parsed && parsed.version === TIMER_SETTINGS_VERSION) {
    return (parsed as StoredRoastTimerSettings).settings;
  }

  // レガシーデータ（version未設定）→ v1として扱う
  return parsed as RoastTimerSettings;
}

/**
 * デバイスIDを取得（存在しない場合は生成）
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    // SSR時は一時的なIDを返す（実際には使用されない）
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // デバイスIDが存在しない場合は生成
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * 4:6メソッドの前回の味わい選択を保存
 */
export function setLast46Taste(taste: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (taste === null) {
    localStorage.removeItem(LAST_46_TASTE_KEY);
  } else {
    localStorage.setItem(LAST_46_TASTE_KEY, taste);
  }
}

/**
 * 4:6メソッドの前回の味わい選択を取得
 */
export function getLast46Taste(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(LAST_46_TASTE_KEY);
}

/**
 * 4:6メソッドの前回の濃度選択を保存
 */
export function setLast46Strength(strength: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (strength === null) {
    localStorage.removeItem(LAST_46_STRENGTH_KEY);
  } else {
    localStorage.setItem(LAST_46_STRENGTH_KEY, strength);
  }
}

/**
 * 4:6メソッドの前回の濃度選択を取得
 */
export function getLast46Strength(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(LAST_46_STRENGTH_KEY);
}


// =============================================
// クイズ進捗管理
// =============================================

const QUIZ_PROGRESS_KEY = 'roastplus_quiz_progress';
const QUIZ_PROGRESS_VERSION = 1;

interface StoredQuizProgress {
  version: number;
  progress: QuizProgress;
}

interface ExportedQuizProgress {
  exportedAt: string;
  version: number;
  progress: QuizProgress;
}

/**
 * クイズ進捗を保存
 */
export function setQuizProgress(progress: QuizProgress | null): void {
  if (typeof window === 'undefined') return;
  
  if (progress === null) {
    localStorage.removeItem(QUIZ_PROGRESS_KEY);
  } else {
    const stored: StoredQuizProgress = {
      version: QUIZ_PROGRESS_VERSION,
      progress,
    };
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(stored));
  }
}

/**
 * クイズ進捗を取得
 */
export function getQuizProgress(): QuizProgress | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(QUIZ_PROGRESS_KEY);
  if (!stored) return null;
  
  const parsed = parseJson<StoredQuizProgress>(stored);
  if (!parsed || parsed.version !== QUIZ_PROGRESS_VERSION) return null;
  
  return parsed.progress;
}

/**
 * クイズ進捗をエクスポート（JSON文字列）
 */
export function exportQuizProgress(): string | null {
  if (typeof window === 'undefined') return null;
  
  const progress = getQuizProgress();
  if (!progress) return null;
  
  const exported: ExportedQuizProgress = {
    exportedAt: new Date().toISOString(),
    version: QUIZ_PROGRESS_VERSION,
    progress,
  };
  
  return JSON.stringify(exported, null, 2);
}

/**
 * クイズ進捗をインポート
 */
export function importQuizProgress(jsonString: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'ブラウザ環境でのみ使用可能です' };
  }
  
  try {
    const imported = JSON.parse(jsonString) as ExportedQuizProgress;
    
    // バージョンチェック
    if (imported.version !== QUIZ_PROGRESS_VERSION) {
      return { success: false, error: `バージョンが一致しません (期待: ${QUIZ_PROGRESS_VERSION}, 実際: ${imported.version})` };
    }
    
    // 必須フィールドチェック
    if (!imported.progress || !imported.progress.userId) {
      return { success: false, error: '無効なデータ形式です' };
    }
    
    // 保存
    setQuizProgress(imported.progress);
    
    return { success: true };
  } catch {
    return { success: false, error: 'JSONの解析に失敗しました' };
  }
}


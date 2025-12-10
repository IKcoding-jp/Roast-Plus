import type { HandpickTimerSettings, RoastTimerSettings, RoastTimerState } from '@/types';

// ローカルストレージ管理

const SELECTED_MEMBER_ID_KEY = 'roastplus_selected_member_id';
const ROAST_TIMER_STATE_KEY = 'roastplus_roast_timer_state';
const ROAST_TIMER_SETTINGS_KEY = 'roastplus_roast_timer_settings';
const HANDPICK_TIMER_SETTINGS_KEY = 'roastplus_handpick_timer_settings';
const DEVICE_ID_KEY = 'roastplus_device_id';

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
    localStorage.setItem(ROAST_TIMER_STATE_KEY, JSON.stringify(state));
  }
}

/**
 * ローストタイマー状態を取得
 */
export function getRoastTimerState(): RoastTimerState | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(ROAST_TIMER_STATE_KEY);
  if (!stored) return null;
  
  return parseJson<RoastTimerState>(stored);
}

/**
 * ローストタイマー設定を保存
 */
export function setRoastTimerSettings(settings: RoastTimerSettings | null | undefined): void {
  if (typeof window === 'undefined') return;
  
  if (settings === null || settings === undefined) {
    localStorage.removeItem(ROAST_TIMER_SETTINGS_KEY);
  } else {
    localStorage.setItem(ROAST_TIMER_SETTINGS_KEY, JSON.stringify(settings));
  }
}

/**
 * ローストタイマー設定を取得
 */
export function getRoastTimerSettings(): RoastTimerSettings | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(ROAST_TIMER_SETTINGS_KEY);
  if (!stored) return null;
  
  return parseJson<RoastTimerSettings>(stored);
}

/**
 * ハンドピックタイマー設定を保存
 */
export function setHandpickTimerSettings(settings: HandpickTimerSettings | null | undefined): void {
  if (typeof window === 'undefined') return;
  
  if (settings === null || settings === undefined) {
    localStorage.removeItem(HANDPICK_TIMER_SETTINGS_KEY);
  } else {
    localStorage.setItem(HANDPICK_TIMER_SETTINGS_KEY, JSON.stringify(settings));
  }
}

/**
 * ハンドピックタイマー設定を取得
 */
export function getHandpickTimerSettings(): HandpickTimerSettings | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(HANDPICK_TIMER_SETTINGS_KEY);
  if (!stored) return null;
  
  return parseJson<HandpickTimerSettings>(stored);
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


/**
 * ハンドピックタイマーのLocalStorage永続化機能
 */

import { TimerPhase } from './handpickTimerUtils';

const STORAGE_KEY = 'handpick-timer-state';

export interface HandpickTimerStorageState {
    phase: TimerPhase;
    remainingSeconds: number;
    cycleCount: number;
    beanOrigin: string;
    firstMinutes: number;
    secondMinutes: number;
    soundEnabled: boolean;
    lastUpdated: string;
}

/**
 * LocalStorageから状態を読み込む
 */
export function loadHandpickTimerState(): HandpickTimerStorageState | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return null;
        }

        const state = JSON.parse(stored) as HandpickTimerStorageState;
        return state;
    } catch (error) {
        console.error('Failed to load handpick timer state:', error);
        return null;
    }
}

/**
 * LocalStorageに状態を保存
 */
export function saveHandpickTimerState(state: Partial<HandpickTimerStorageState>): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        // 既存の状態を読み込む
        const existing = loadHandpickTimerState();

        // デフォルト値とマージ
        const newState: HandpickTimerStorageState = {
            phase: state.phase ?? existing?.phase ?? 'idle',
            remainingSeconds: state.remainingSeconds ?? existing?.remainingSeconds ?? 0,
            cycleCount: state.cycleCount ?? existing?.cycleCount ?? 0,
            beanOrigin: state.beanOrigin ?? existing?.beanOrigin ?? '',
            firstMinutes: state.firstMinutes ?? existing?.firstMinutes ?? 5,
            secondMinutes: state.secondMinutes ?? existing?.secondMinutes ?? 5,
            soundEnabled: state.soundEnabled ?? existing?.soundEnabled ?? true,
            lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
        console.error('Failed to save handpick timer state:', error);
    }
}

/**
 * LocalStorageから状態をクリア
 */
export function clearHandpickTimerState(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear handpick timer state:', error);
    }
}

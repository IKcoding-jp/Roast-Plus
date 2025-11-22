/**
 * ハンドピックタイマーのユーティリティ関数
 */

/**
 * プリセット定義
 */
export interface TimerPreset {
    id: string;
    label: string;
    first: number;  // 1回目の時間（秒）
    second: number; // 2回目の時間（秒）
}

export const TIMER_PRESETS: TimerPreset[] = [
    { id: '5-5', label: '5分 + 5分', first: 300, second: 300 },
    { id: '3-3', label: '3分 + 3分', first: 180, second: 180 },
    { id: '4-4', label: '4分 + 4分', first: 240, second: 240 },
];

/**
 * デフォルトプリセット
 */
export const DEFAULT_PRESET = TIMER_PRESETS[0];

/**
 * フェーズ定義
 */
export type TimerPhase = 'idle' | 'first' | 'second';

/**
 * 秒数をMM:SS形式にフォーマット
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * フェーズごとのメッセージを取得
 */
export function getPhaseMessage(phase: TimerPhase, isRunning: boolean): string {
    if (phase === 'idle') {
        return 'スタートボタンを押して作業を開始';
    }
    if (phase === 'first') {
        return isRunning ? '1回目：集中してチェック中' : '1回目終了：全員隣へ回す';
    }
    if (phase === 'second') {
        return isRunning ? '2回目：最終チェック＋袋詰め' : '2回目終了：袋詰めして新しい豆を準備';
    }
    return '';
}

/**
 * フェーズ名を取得
 */
export function getPhaseName(phase: TimerPhase): string {
    switch (phase) {
        case 'first':
            return '1回目チェック';
        case 'second':
            return '2回目チェック＋袋詰め';
        default:
            return '待機中';
    }
}

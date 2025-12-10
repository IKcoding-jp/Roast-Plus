/**
 * ハンドピックタイマーのカスタムフック
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerPhase } from '@/lib/handpickTimerUtils';
import {
    loadHandpickTimerState,
    saveHandpickTimerState,
} from '@/lib/handpickTimerStorage';
import {
    loadHandpickTimerSettings,
    getCachedHandpickTimerSettings,
} from '@/lib/handpickTimerSettings';
import { playNotificationSound } from '@/lib/sounds';
import type { HandpickTimerSettings } from '@/types';

// 無音1秒のMP3データ（iOSのオーディオアンロック用）
const SILENT_AUDIO_DATA_URL =
    'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA' +
    'AQACABAAZGF0YcAAAAA=';

// タイマーの状態を一元管理
export type TimerStatus =
    | 'idle'                    // 待機中（スタート前、または完了後）
    | 'first-running'           // 1回目実行中
    | 'first-paused'            // 1回目一時停止中
    | 'second-waiting'          // 2回目待機中（1回目終了後、2回目開始前）
    | 'second-running'          // 2回目実行中
    | 'second-paused';          // 2回目一時停止中

export interface HandpickTimerState {
    status: TimerStatus;        // 状態を一元管理
    remainingSeconds: number;
    cycleCount: number;
    firstMinutes: number; // 1回目の時間（分）
    secondMinutes: number; // 2回目の時間（分）
    // 既存コードとの互換性のため、phaseとisRunningも含める
    phase: TimerPhase;
    isRunning: boolean;
}

export function useHandpickTimer() {
    // 既存のLocalStorageデータからstatusを導出するマイグレーション処理
    const getInitialState = () => {
        if (typeof window === 'undefined') {
            return {
                status: 'idle' as TimerStatus,
                remainingSeconds: 0,
                cycleCount: 0,
            };
        }
        try {
            const stored = loadHandpickTimerState();
            if (stored) {
                // 既存データからstatusを導出
                let status: TimerStatus = 'idle';
                if (stored.phase === 'first') {
                    // 既存データにisRunningが保存されていないため、リロード後は常に停止状態とみなす
                    // remainingSecondsで判定
                    const expectedSeconds = (stored.firstMinutes ?? 5) * 60;
                    if (stored.remainingSeconds > 0 && stored.remainingSeconds <= expectedSeconds) {
                        status = 'first-paused'; // 途中で停止したとみなす（リロード後は常に停止状態）
                    } else {
                        status = 'idle'; // 0または異常値の場合はidle
                    }
                } else if (stored.phase === 'second') {
                    const expectedSeconds = (stored.secondMinutes ?? 5) * 60;
                    if (stored.remainingSeconds === expectedSeconds) {
                        status = 'second-waiting'; // 2回目待機中
                    } else if (stored.remainingSeconds === 0) {
                        status = 'idle'; // 完了
                    } else if (stored.remainingSeconds > 0) {
                        status = 'second-paused'; // 途中で停止したとみなす
                    } else {
                        status = 'idle';
                    }
                } else {
                    status = 'idle';
                }
                return {
                    status,
                    remainingSeconds: stored.remainingSeconds ?? 0,
                    cycleCount: stored.cycleCount ?? 0,
                };
            }
            return {
                status: 'idle' as TimerStatus,
                remainingSeconds: 0,
                cycleCount: 0,
            };
        } catch {
            return {
                status: 'idle' as TimerStatus,
                remainingSeconds: 0,
                cycleCount: 0,
            };
        }
    };

    const initial = getInitialState();

    const [status, setStatus] = useState<TimerStatus>(initial.status);
    const [remainingSeconds, setRemainingSeconds] = useState(initial.remainingSeconds);
    const [cycleCount, setCycleCount] = useState(initial.cycleCount);
    // LocalStorageから初期値を読み込む（SSR対策含む）
    const [firstMinutes, setFirstMinutesState] = useState(() => {
        if (typeof window === 'undefined') return 5;
        try {
            const stored = loadHandpickTimerState();
            return stored?.firstMinutes ?? 5;
        } catch {
            return 5;
        }
    });
    const [secondMinutes, setSecondMinutesState] = useState(() => {
        if (typeof window === 'undefined') return 5;
        try {
            const stored = loadHandpickTimerState();
            return stored?.secondMinutes ?? 5;
        } catch {
            return 5;
        }
    });
    const [settings, setSettings] = useState<HandpickTimerSettings | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // 完了音用のAudioオブジェクトを保持するRef
    const completeAudioRef = useRef<HTMLAudioElement | null>(null);
    // 初期読み込みは完了扱いにして永続化を有効化
    const hasHydratedRef = useRef(true);

    // 設定を読み込む
    useEffect(() => {
        loadHandpickTimerSettings()
            .then((loadedSettings) => {
                setSettings(loadedSettings);
            })
            .catch((error) => {
                console.error('Failed to load handpick timer settings:', error);
            });
    }, []);

    // 設定変更を監視（設定画面から戻った時に再読み込み）
    useEffect(() => {
        const checkSettings = () => {
            const cachedSettings = getCachedHandpickTimerSettings();
            if (cachedSettings) {
                setSettings(cachedSettings);
            }
        };

        // 定期的に設定をチェックし、設定画面から戻った時に反映
        const interval = setInterval(checkSettings, 1000);
        return () => clearInterval(interval);
    }, []);

    // statusからphaseとisRunningを導出（既存コードとの互換性のため）
    const phase: TimerPhase =
        status === 'idle' ? 'idle' :
        status === 'first-running' || status === 'first-paused' ? 'first' : 'second';
    const isRunning = status === 'first-running' || status === 'second-running';

    // 状態変更時にLocalStorageに保存（既存形式を維持）
    useEffect(() => {
        if (!hasHydratedRef.current) return;

        saveHandpickTimerState({
            phase,
            remainingSeconds,
            cycleCount,
            firstMinutes,
            secondMinutes,
        });
    }, [status, remainingSeconds, cycleCount, firstMinutes, secondMinutes, phase]);

    // 共通バリデーション
    const clampMinutes = useCallback((minutes: number) => {
        if (!Number.isFinite(minutes)) return 5;
        return Math.max(1, Math.min(60, Math.floor(minutes)));
    }, []);

    // 1回目の時間を設定して即座に永続化
    const setFirstMinutes = useCallback(
        (minutes: number) => {
            const sanitized = clampMinutes(minutes);
            setFirstMinutesState(sanitized);

            // 1回目のフェーズで、タイマーが停止中の場合は残り時間を更新
            if (status === 'first-paused') {
                setRemainingSeconds(sanitized * 60);
            }

            try {
                saveHandpickTimerState({ firstMinutes: sanitized });
            } catch (error) {
                console.error('[HandpickTimer] Failed to persist first minutes:', error);
            }
        },
        [clampMinutes, status],
    );

    // 2回目の時間を設定して即座に永続化
    const setSecondMinutes = useCallback(
        (minutes: number) => {
            const sanitized = clampMinutes(minutes);
            setSecondMinutesState(sanitized);

            // 2回目のフェーズで、タイマーが停止中の場合は残り時間を更新
            if (status === 'second-waiting' || status === 'second-paused') {
                setRemainingSeconds(sanitized * 60);
            }

            try {
                saveHandpickTimerState({ secondMinutes: sanitized });
            } catch (error) {
                console.error('[HandpickTimer] Failed to persist second minutes:', error);
            }
        },
        [clampMinutes, status],
    );

    // 音声ファイルのパスを解決するヘルパー
    const resolveAudioPath = (path: string) => {
        const safePath = path && path.length > 0 ? path : '/sounds/handpicktimer/complete/complete1.mp3';
        const audioPath = safePath.startsWith('/') ? safePath : `/${safePath}`;
        const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.5.3';
        return `${audioPath}?v=${version}`;
    };

    // 完了音の準備（アンロック）を行う
    const prepareCompleteSound = useCallback(async () => {
        if (!settings || !settings.soundEnabled || !settings.completeSoundEnabled) return;

        // フォールバック用のデフォルトファイルパス。実際に存在する最初のファイルを使用。
        const DEFAULT_SOUND_FILE = '/sounds/handpicktimer/complete/complete1.mp3';

        try {
            // 既存のAudioがあれば破棄
            if (completeAudioRef.current) {
                completeAudioRef.current.pause();
                completeAudioRef.current = null;
            }

            // iOS等の自動再生制限を解除するため、無音クリップでアンロック
            try {
                const silent = new Audio(SILENT_AUDIO_DATA_URL);
                silent.volume = 0;
                silent.muted = true;
                await silent.play();
                silent.pause();
                silent.currentTime = 0;
            } catch (unlockError) {
                console.warn('[HandpickTimer] Silent unlock failed', unlockError);
            }

            let audioPath = resolveAudioPath(settings.completeSoundFile || DEFAULT_SOUND_FILE);
            let audio = new Audio(audioPath);
            audio.preload = 'auto';

            // エラーフラグを設定
            let hasError = false;
            let usedFallback = false;
            let errorDetails: {
                code?: number;
                message?: string;
                path: string;
                MEDIA_ERR_ABORTED?: number;
                MEDIA_ERR_NETWORK?: number;
                MEDIA_ERR_DECODE?: number;
                MEDIA_ERR_SRC_NOT_SUPPORTED?: number;
                readyState?: number;
                networkState?: number;
            } | null = null;

            // エラーハンドリング
            let errorHandler: ((e: Event) => void) | null = null;
            let fallbackErrorHandler: ((e: Event) => void) | null = null;

            errorHandler = () => {
                hasError = true;
                const error = audio.error;
                if (error) {
                    errorDetails = {
                        code: error.code,
                        message: error.message,
                        path: audioPath,
                        MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
                        MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
                        MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
                        MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
                    };
                    console.error('[HandpickTimer] Audio loading error:', errorDetails);
                } else {
                    errorDetails = {
                        path: audioPath,
                        readyState: audio.readyState,
                        networkState: audio.networkState,
                    };
                    console.error('[HandpickTimer] Audio error event fired but no error details available', errorDetails);
                }
            };
            audio.addEventListener('error', errorHandler);

            // エラーイベントが非同期で発火する可能性があるため、短めの待機時間を設けてから判定
            await new Promise((resolve) => setTimeout(resolve, 100));

            // エラーが発生した場合、デフォルトファイルにフォールバック
            if (hasError) {
                console.warn('[HandpickTimer] Audio loading failed, trying fallback file. Error:', errorDetails);
                audio.removeEventListener('error', errorHandler);

                // デフォルトファイルで再試行
                audioPath = resolveAudioPath(DEFAULT_SOUND_FILE);
                audio = new Audio(audioPath);
                audio.preload = 'auto';
                hasError = false;
                errorDetails = null;
                usedFallback = true;

                fallbackErrorHandler = () => {
                    hasError = true;
                    const error = audio.error;
                    if (error) {
                        errorDetails = {
                            code: error.code,
                            message: error.message,
                            path: audioPath,
                            MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
                            MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
                            MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
                            MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
                        };
                        console.error('[HandpickTimer] Fallback audio loading error:', errorDetails);
                    } else {
                        errorDetails = {
                            path: audioPath,
                            readyState: audio.readyState,
                            networkState: audio.networkState,
                        };
                        console.error('[HandpickTimer] Fallback audio error event fired but no error details available', errorDetails);
                    }
                };
                audio.addEventListener('error', fallbackErrorHandler);

                await new Promise((resolve) => setTimeout(resolve, 100));

                if (hasError) {
                    console.error('[HandpickTimer] Fallback audio also failed, skipping prepare. Error:', errorDetails);
                    audio.removeEventListener('error', fallbackErrorHandler);
                    return;
                }
            }

            // 本番再生用に音量を設定（アンロックは無音クリップで完了済み）
            audio.muted = false;
            audio.volume = Math.max(0, Math.min(1, settings.completeSoundVolume));

            // Refに保存
            completeAudioRef.current = audio;
            console.log('[HandpickTimer] Complete sound prepared', usedFallback ? '(using fallback)' : '');
        } catch (error) {
            console.error('[HandpickTimer] Failed to prepare complete sound:', error);
        }
    }, [settings]);

    // 完了音を再生。refから再生を試み、なければフォールバック。
    const playCompleteSoundFromRef = useCallback(async () => {
        if (!settings || !settings.soundEnabled || !settings.completeSoundEnabled) return;

        if (!completeAudioRef.current) {
            console.warn('[HandpickTimer] Complete sound not prepared, trying fallback');
            await playNotificationSound(settings.completeSoundFile || '/sounds/handpicktimer/complete/complete1.mp3', settings.completeSoundVolume);
            return;
        }

        try {
            const audio = completeAudioRef.current;
            audio.currentTime = 0;
            await audio.play();
            console.log('[HandpickTimer] Complete sound played from ref');
        } catch (error) {
            console.error('[HandpickTimer] Failed to play complete sound from ref:', error);
        }
    }, [settings]);

    // 開始音を再生
    const playStartSound = useCallback(async () => {
        if (!settings || !settings.soundEnabled || !settings.startSoundEnabled) return;

        try {
            await playNotificationSound(settings.startSoundFile, settings.startSoundVolume);
        } catch (error) {
            console.error('Failed to play start sound:', error);
        }
    }, [settings]);

    // フェーズ完了の処理
    const handlePhaseComplete = useCallback(() => {
        console.log('[HandpickTimer] Phase complete triggered');

        // 音声を再生
        void playCompleteSoundFromRef();

        // 関数型更新を使用して最新のstatusを取得
        setStatus((prevStatus) => {
            if (prevStatus === 'first-running' || prevStatus === 'first-paused') {
                // 1回目終了→2回目待機状態へ
                setRemainingSeconds(secondMinutes * 60);
                return 'second-waiting';
            } else if (prevStatus === 'second-running' || prevStatus === 'second-paused') {
                // 2回目終了→サイクル数+1、待機状態へ
                setCycleCount((prev) => prev + 1);
                setRemainingSeconds(0);
                return 'idle';
            }
            return prevStatus; // 変更不要な場合はそのまま返す
        });
    }, [playCompleteSoundFromRef, secondMinutes]);

    // タイマーのカウントダウン処理
    useEffect(() => {
        if (status !== 'first-running' && status !== 'second-running') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setRemainingSeconds((prev) => {
                const next = Math.max(0, prev - 1);
                if (prev !== 0 && next === 0) {
                    handlePhaseComplete();
                }
                return next;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [status, handlePhaseComplete]);

    // タイマー開始
    const start = useCallback(async () => {
        console.log('[HandpickTimer] Start clicked');

        // 完了音の準備（アンロックも含む）
        await prepareCompleteSound();

        setStatus('first-running');
        setRemainingSeconds(firstMinutes * 60);

        // スタート音を再生
        await playStartSound();
    }, [firstMinutes, playStartSound, prepareCompleteSound]);

    // 一時停止
    const pause = useCallback(() => {
        setStatus((prevStatus) => {
            if (prevStatus === 'first-running') {
                return 'first-paused';
            } else if (prevStatus === 'second-running') {
                return 'second-paused';
            }
            return prevStatus; // 変更不要な場合はそのまま返す
        });
    }, []);

    // 再開
    const resume = useCallback(async () => {
        console.log('[HandpickTimer] Resume clicked');

        // 再開時も念のため完了音を準備（アンロックし直し）
        await prepareCompleteSound();

        // 関数型更新を使用して最新のstatusを取得
        let shouldPlayStartSound = false;
        setStatus((prevStatus) => {
            if (prevStatus === 'first-paused') {
                return 'first-running';
            } else if (prevStatus === 'second-waiting') {
                // 2回目スタート音を再生する必要があることを記録
                shouldPlayStartSound = true;
                return 'second-running';
            } else if (prevStatus === 'second-paused') {
                return 'second-running';
            }
            return prevStatus; // 変更不要な場合はそのまま返す
        });

        // 状態更新後に音声を再生（2回目スタートの場合のみ）
        if (shouldPlayStartSound) {
            try {
                await playStartSound();
            } catch (error) {
                console.error('[HandpickTimer] Failed to play start sound:', error);
            }
        }
    }, [playStartSound, prepareCompleteSound]);

    // リセット
    const reset = useCallback(() => {
        setStatus('idle');
        setRemainingSeconds(0);
        setCycleCount(0); // 今日のサイクル数もリセット
        // AudioRefのクリーンアップは次のstart/resume時に行われるか、コンポーネントアンマウント時にGCされる
    }, []);

    const state: HandpickTimerState = {
        status,
        remainingSeconds,
        cycleCount,
        firstMinutes,
        secondMinutes,
        // 既存コードとの互換性のため
        phase,
        isRunning,
    };

    return {
        state,
        start,
        pause,
        resume,
        reset,
        setFirstMinutes,
        setSecondMinutes,
        skip: handlePhaseComplete,
    };
}

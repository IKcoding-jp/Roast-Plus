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

export interface HandpickTimerState {
    phase: TimerPhase;
    remainingSeconds: number;
    isRunning: boolean;
    cycleCount: number;
    firstMinutes: number; // 1回目の時間（分）
    secondMinutes: number; // 2回目の時間（分）
}

export function useHandpickTimer() {
    const getInitialState = () => {
        if (typeof window === 'undefined') {
            return {
                phase: 'idle' as TimerPhase,
                remainingSeconds: 0,
                cycleCount: 0,
            };
        }
        try {
            const stored = loadHandpickTimerState();
            return {
                phase: stored?.phase ?? 'idle',
                remainingSeconds: stored?.remainingSeconds ?? 0,
                cycleCount: stored?.cycleCount ?? 0,
            };
        } catch {
            return {
                phase: 'idle' as TimerPhase,
                remainingSeconds: 0,
                cycleCount: 0,
            };
        }
    };

    const initial = getInitialState();

    const [phase, setPhase] = useState<TimerPhase>(initial.phase);
    const [remainingSeconds, setRemainingSeconds] = useState(initial.remainingSeconds);
    const [isRunning, setIsRunning] = useState(false);
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

    // 状態変更時にLocalStorageに保存
    useEffect(() => {
        if (!hasHydratedRef.current) return;

        saveHandpickTimerState({
            phase,
            remainingSeconds,
            cycleCount,
            firstMinutes,
            secondMinutes,
        });
    }, [phase, remainingSeconds, cycleCount, firstMinutes, secondMinutes]);

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
            if (phase === 'first' && !isRunning) {
                setRemainingSeconds(sanitized * 60);
            }

            try {
                saveHandpickTimerState({ firstMinutes: sanitized });
            } catch (error) {
                console.error('[HandpickTimer] Failed to persist first minutes:', error);
            }
        },
        [clampMinutes, phase, isRunning],
    );

    // 2回目の時間を設定して即座に永続化
    const setSecondMinutes = useCallback(
        (minutes: number) => {
            const sanitized = clampMinutes(minutes);
            setSecondMinutesState(sanitized);

            // 2回目のフェーズで、タイマーが停止中の場合は残り時間を更新
            if (phase === 'second' && !isRunning) {
                setRemainingSeconds(sanitized * 60);
            }

            try {
                saveHandpickTimerState({ secondMinutes: sanitized });
            } catch (error) {
                console.error('[HandpickTimer] Failed to persist second minutes:', error);
            }
        },
        [clampMinutes, phase, isRunning],
    );

    // 音声ファイルのパスを解決するヘルパー
    const resolveAudioPath = (path: string) => {
        const safePath = path && path.length > 0 ? path : '/sounds/handpicktimer/complete/complete1.mp3';
        const audioPath = safePath.startsWith('/') ? safePath : `/${safePath}`;
        const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.8';
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

        setIsRunning(false);

        if (phase === 'first') {
            // 1回目終了→2回目へ移行（手動開始前提）
            setPhase('second');
            setRemainingSeconds(secondMinutes * 60);
        } else if (phase === 'second') {
            // 2回目終了→サイクル数+1、停止状態へ
            setCycleCount((prev) => prev + 1);
            setPhase('idle');
            setRemainingSeconds(0);
        }
    }, [phase, secondMinutes, playCompleteSoundFromRef]);

    // タイマーのカウントダウン処理
    useEffect(() => {
        if (!isRunning) {
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
    }, [isRunning, handlePhaseComplete]);

    // タイマー開始
    const start = useCallback(async () => {
        console.log('[HandpickTimer] Start clicked');

        // 完了音の準備（アンロックも含む）
        await prepareCompleteSound();

        setPhase('first');
        setRemainingSeconds(firstMinutes * 60);
        setIsRunning(true);

        // スタート音を再生
        await playStartSound();
    }, [firstMinutes, playStartSound, prepareCompleteSound]);

    // 一時停止
    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    // 再開
    const resume = useCallback(async () => {
        if (phase !== 'idle' && remainingSeconds > 0) {
            console.log('[HandpickTimer] Resume clicked');

            // 再開時も念のため完了音を準備（アンロックし直し）
            await prepareCompleteSound();

            // 2回目スタート時（phase === 'second' かつ remainingSeconds === secondMinutes * 60）に音を鳴らす
            const isSecondPhaseStart = phase === 'second' && remainingSeconds === secondMinutes * 60;

            if (isSecondPhaseStart) {
                // 2回目スタート音を再生（開始音を使用）
                await playStartSound();
            }

            setIsRunning(true);
        }
    }, [phase, remainingSeconds, secondMinutes, playStartSound, prepareCompleteSound]);

    // リセット
    const reset = useCallback(() => {
        setIsRunning(false);
        setPhase('idle');
        setRemainingSeconds(0);
        setCycleCount(0); // 今日のサイクル数もリセット
        // AudioRefのクリーンアップは次のstart/resume時に行われるか、コンポーネントアンマウント時にGCされる
    }, []);

    const state: HandpickTimerState = {
        phase,
        remainingSeconds,
        isRunning,
        cycleCount,
        firstMinutes,
        secondMinutes,
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

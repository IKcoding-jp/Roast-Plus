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

export interface HandpickTimerState {
    phase: TimerPhase;
    remainingSeconds: number;
    isRunning: boolean;
    cycleCount: number;
    firstMinutes: number;  // 1回目の時間（分）
    secondMinutes: number; // 2回目の時間（分）
}

export function useHandpickTimer() {
    const [phase, setPhase] = useState<TimerPhase>('idle');
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [cycleCount, setCycleCount] = useState(0);
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
    const hasHydratedRef = useRef(false);

    // 初期化時にLocalStorageからタイマーの進行状態を復元
    // firstMinutes/secondMinutesはuseStateの初期値で既に反映されているため、ここでは触らない
    useEffect(() => {
        const stored = loadHandpickTimerState();
        if (stored) {
            setPhase(stored.phase);
            setRemainingSeconds(stored.remainingSeconds);
            setCycleCount(stored.cycleCount);
            // 復元時は停止状態にする
            setIsRunning(false);
        }
        hasHydratedRef.current = true;
    }, []);

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

        // 定期的に設定をチェック（設定画面から戻った時に反映）
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

    // 分設定変更時の共通バリデーション
    const clampMinutes = useCallback((minutes: number) => {
        if (!Number.isFinite(minutes)) return 5;
        return Math.max(1, Math.min(60, Math.floor(minutes)));
    }, []);

    // 分設定変更時に即座に永続化するラッパ�E
    const setFirstMinutes = useCallback((minutes: number) => {
        const sanitized = clampMinutes(minutes);
        setFirstMinutesState(sanitized);

        try {
            saveHandpickTimerState({ firstMinutes: sanitized });
        } catch (error) {
            console.error('[HandpickTimer] Failed to persist first minutes:', error);
        }
    }, [clampMinutes]);

    const setSecondMinutes = useCallback((minutes: number) => {
        const sanitized = clampMinutes(minutes);
        setSecondMinutesState(sanitized);

        try {
            saveHandpickTimerState({ secondMinutes: sanitized });
        } catch (error) {
            console.error('[HandpickTimer] Failed to persist second minutes:', error);
        }
    }, [clampMinutes]);

    // 音声ファイルのパスを解決するヘルパー
    const resolveAudioPath = (path: string) => {
        let audioPath = path.startsWith('/') ? path : `/${path}`;
        const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.8';
        return `${audioPath}?v=${version}`;
    };

    // 完了音の準備（アンロック）を行う
    const prepareCompleteSound = useCallback(async () => {
        if (!settings || !settings.soundEnabled || !settings.completeSoundEnabled) return;

        // フォールバック用のデフォルトファイルパス
        const DEFAULT_SOUND_FILE = '/sounds/alarm/アラーム1.mp3';

        try {
            // 既存のAudioがあれば破棄
            if (completeAudioRef.current) {
                completeAudioRef.current.pause();
                completeAudioRef.current = null;
            }

            let audioPath = resolveAudioPath(settings.completeSoundFile);
            let audio = new Audio(audioPath);

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

            errorHandler = (e: Event) => {
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
                    console.error('[HandpickTimer] Failed to load audio file:', audioPath);
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

            // エラーが発生した場合は、play()を試みない
            // ただし、エラーイベントは非同期で発火する可能性があるため、
            // 短い待機時間を設けてからエラーチェックを行う
            await new Promise((resolve) => setTimeout(resolve, 100));

            // エラーが発生した場合、デフォルトファイルにフォールバック
            if (hasError) {
                console.warn('[HandpickTimer] Audio loading failed, trying fallback file. Error:', errorDetails);
                audio.removeEventListener('error', errorHandler);
                
                // デフォルトファイルが元のファイルと同じ場合は、フォールバックしない
                if (settings.completeSoundFile === DEFAULT_SOUND_FILE) {
                    console.error('[HandpickTimer] Default sound file also failed, skipping unlock');
                    return;
                }

                // デフォルトファイルで再試行
                audioPath = resolveAudioPath(DEFAULT_SOUND_FILE);
                audio = new Audio(audioPath);
                hasError = false;
                errorDetails = null;
                usedFallback = true;

                fallbackErrorHandler = (e: Event) => {
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
                    console.error('[HandpickTimer] Fallback audio also failed, skipping unlock. Error:', errorDetails);
                    audio.removeEventListener('error', fallbackErrorHandler);
                    return;
                }
            }

            // 音量を0にし、さらにミュートも設定して確実に無音にする
            // 一瞬再生することで、iOS等の自動再生制限を解除（アンロック）する
            audio.volume = 0;
            audio.muted = true;  // 確実に無音にする
            
            try {
                await audio.play();
                audio.pause();
                audio.currentTime = 0;

                // 本番再生用に音量を設定し、ミュートを解除
                audio.muted = false;
                audio.volume = Math.max(0, Math.min(1, settings.completeSoundVolume));

                // Refに保存
                completeAudioRef.current = audio;
                console.log('[HandpickTimer] Complete sound prepared and unlocked', usedFallback ? '(using fallback)' : '');
            } catch (playError) {
                console.error('[HandpickTimer] Failed to play audio for unlock:', playError);
                // エラーイベントリスナーを削除
                if (usedFallback && fallbackErrorHandler) {
                    audio.removeEventListener('error', fallbackErrorHandler);
                } else if (errorHandler) {
                    audio.removeEventListener('error', errorHandler);
                }
            }
        } catch (error) {
            console.error('[HandpickTimer] Failed to prepare complete sound:', error);
        }
    }, [settings]);

    // 完了音を再生（Refから）
    const playCompleteSoundFromRef = useCallback(async () => {
        // 完了音が無効の場合はスキップ
        if (!settings || !settings.soundEnabled || !settings.completeSoundEnabled) return;

        if (!completeAudioRef.current) {
            console.warn('[HandpickTimer] Complete sound not prepared, trying fallback');
            // フォールバック: 通常の再生を試みる（ユーザー操作起因でないと鳴らない可能性あり）
            await playNotificationSound(settings.completeSoundFile, settings.completeSoundVolume);
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

    // フェーズ完了時の処理
    const handlePhaseComplete = useCallback(() => {
        console.log('[HandpickTimer] Phase complete triggered');

        // 音声を再生
        void playCompleteSoundFromRef();

        setIsRunning(false);

        if (phase === 'first') {
            // 1回目終了 → 2回目へ移行（手動開始待ち）
            setPhase('second');
            setRemainingSeconds(secondMinutes * 60);
        } else if (phase === 'second') {
            // 2回目終了 → サイクル数+1、停止状態へ
            setCycleCount((prev) => prev + 1);
            setPhase('idle');
            setRemainingSeconds(0);
        }
    }, [phase, firstMinutes, secondMinutes, playCompleteSoundFromRef]);

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
                // ここでは状態更新のみを行い、完了判定は別のuseEffectで行う
                // ただし、0未満にならないようにする
                return Math.max(0, prev - 1);
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning]);

    // 残り時間0の監視
    useEffect(() => {
        // タイマー動作中で、残り時間が0になったら完了処理を実行
        if (isRunning && remainingSeconds === 0) {
            handlePhaseComplete();
        }
    }, [isRunning, remainingSeconds, handlePhaseComplete]);

    // タイマー開始
    const start = useCallback(async () => {
        console.log('[HandpickTimer] Start clicked');

        // 完了音の準備（アンロック）
        // ユーザーインタラクション内で実行する必要がある
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

            // 再開時も念のため完了音を準備（アンロック）し直す
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

    // リセット（確認ダイアログは呼び出し側で実装）
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

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
    const [firstMinutes, setFirstMinutes] = useState(5);
    const [secondMinutes, setSecondMinutes] = useState(5);
    const [settings, setSettings] = useState<HandpickTimerSettings | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 初期化時にLocalStorageから復元
    useEffect(() => {
        const stored = loadHandpickTimerState();
        if (stored) {
            setPhase(stored.phase);
            setRemainingSeconds(stored.remainingSeconds);
            setCycleCount(stored.cycleCount);
            setFirstMinutes(stored.firstMinutes || 5);
            setSecondMinutes(stored.secondMinutes || 5);

            // 復元時は停止状態
            setIsRunning(false);
        }
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
        saveHandpickTimerState({
            phase,
            remainingSeconds,
            cycleCount,
            firstMinutes,
            secondMinutes,
        });
    }, [phase, remainingSeconds, cycleCount, firstMinutes, secondMinutes]);

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
                if (prev <= 1) {
                    // フェーズ終了
                    handlePhaseComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, phase]);

    // 開始音を再生
    const playStartSound = useCallback(async () => {
        if (!settings || !settings.soundEnabled) return;

        try {
            await playNotificationSound(settings.startSoundFile, settings.startSoundVolume);
        } catch (error) {
            console.error('Failed to play start sound:', error);
        }
    }, [settings]);

    // 完了音を再生
    const playCompleteSound = useCallback(async () => {
        if (!settings || !settings.soundEnabled) return;

        try {
            await playNotificationSound(settings.completeSoundFile, settings.completeSoundVolume);
        } catch (error) {
            console.error('Failed to play complete sound:', error);
        }
    }, [settings]);

    // フェーズ完了時の処理
    const handlePhaseComplete = useCallback(() => {
        // setIntervalのコールバック内から呼ばれるため、awaitは使わずに呼び出す
        void playCompleteSound();
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
    }, [phase, firstMinutes, secondMinutes, playCompleteSound]);

    // タイマー開始
    const start = useCallback(async () => {
        setPhase('first');
        setRemainingSeconds(firstMinutes * 60);
        setIsRunning(true);
        
        // スタート音を再生
        await playStartSound();
    }, [firstMinutes, playStartSound]);

    // 一時停止
    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    // 再開
    const resume = useCallback(async () => {
        if (phase !== 'idle' && remainingSeconds > 0) {
            // 2回目スタート時（phase === 'second' かつ remainingSeconds === secondMinutes * 60）に音を鳴らす
            const isSecondPhaseStart = phase === 'second' && remainingSeconds === secondMinutes * 60;
            
            if (isSecondPhaseStart) {
                // 2回目スタート音を再生（開始音を使用）
                await playStartSound();
            }
            
            setIsRunning(true);
        }
    }, [phase, remainingSeconds, secondMinutes, playStartSound]);

    // リセット（確認ダイアログは呼び出し側で実装）
    const reset = useCallback(() => {
        setIsRunning(false);
        setPhase('idle');
        setRemainingSeconds(0);
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

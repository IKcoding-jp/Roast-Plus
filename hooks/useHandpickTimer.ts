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

export interface HandpickTimerState {
    phase: TimerPhase;
    remainingSeconds: number;
    isRunning: boolean;
    cycleCount: number;
    soundEnabled: boolean;
    firstMinutes: number;  // 1回目の時間（分）
    secondMinutes: number; // 2回目の時間（分）
}

export function useHandpickTimer() {
    const [phase, setPhase] = useState<TimerPhase>('idle');
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [cycleCount, setCycleCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [firstMinutes, setFirstMinutes] = useState(5);
    const [secondMinutes, setSecondMinutes] = useState(5);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 初期化時にLocalStorageから復元
    useEffect(() => {
        const stored = loadHandpickTimerState();
        if (stored) {
            setPhase(stored.phase);
            setRemainingSeconds(stored.remainingSeconds);
            setCycleCount(stored.cycleCount);
            setSoundEnabled(stored.soundEnabled);
            setFirstMinutes(stored.firstMinutes || 5);
            setSecondMinutes(stored.secondMinutes || 5);

            // 復元時は停止状態
            setIsRunning(false);
        }
    }, []);

    // 状態変更時にLocalStorageに保存
    useEffect(() => {
        saveHandpickTimerState({
            phase,
            remainingSeconds,
            cycleCount,
            firstMinutes,
            secondMinutes,
            soundEnabled,
        });
    }, [phase, remainingSeconds, cycleCount, firstMinutes, secondMinutes, soundEnabled]);

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

    // 音を再生
    const playSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            // ブラウザのデフォルトbeep音を使用
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            // Web Audio APIを使用してビープ音を生成
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // 周波数
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }, [soundEnabled]);

    // フェーズ完了時の処理
    const handlePhaseComplete = useCallback(() => {
        playSound();
        setIsRunning(false);

        if (phase === 'first') {
            // 1回目終了 → 2回目へ自動移行
            setPhase('second');
            setRemainingSeconds(secondMinutes * 60);
            // 少し待ってから2回目を自動開始
            setTimeout(() => {
                setIsRunning(true);
            }, 100);
        } else if (phase === 'second') {
            // 2回目終了 → サイクル数+1、停止状態へ
            setCycleCount((prev) => prev + 1);
            setPhase('idle');
            setRemainingSeconds(0);
        }
    }, [phase, firstMinutes, secondMinutes, playSound]);

    // タイマー開始
    const start = useCallback(() => {
        setPhase('first');
        setRemainingSeconds(firstMinutes * 60);
        setIsRunning(true);
        playSound(); // スタート音
    }, [firstMinutes, playSound]);

    // 一時停止
    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    // 再開
    const resume = useCallback(() => {
        if (phase !== 'idle' && remainingSeconds > 0) {
            setIsRunning(true);
        }
    }, [phase, remainingSeconds]);

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
        soundEnabled,
        firstMinutes,
        secondMinutes,
    };

    return {
        state,
        start,
        pause,
        resume,
        reset,
        setSoundEnabled,
        setFirstMinutes,
        setSecondMinutes,
    };
}

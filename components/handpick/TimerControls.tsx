/**
 * タイマー操作ボタンコンポーネント
 */

'use client';

import { useState, useEffect } from 'react';
import { HiPlay, HiPause, HiRefresh, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { type TimerPhase } from '@/lib/handpickTimerUtils';

interface TimerControlsProps {
    phase: TimerPhase;
    isRunning: boolean;
    soundEnabled: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
    onToggleSound: () => void;
    isSecondPhaseStart?: boolean;
}

export function TimerControls({
    phase,
    isRunning,
    soundEnabled,
    onStart,
    onPause,
    onResume,
    onReset,
    onToggleSound,
    isSecondPhaseStart = false,
}: TimerControlsProps) {
    const [isResetConfirm, setIsResetConfirm] = useState(false);

    // 確認状態を3秒後に自動解除
    useEffect(() => {
        if (isResetConfirm) {
            const timer = setTimeout(() => {
                setIsResetConfirm(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isResetConfirm]);

    const handleReset = () => {
        if (isResetConfirm) {
            onReset();
            setIsResetConfirm(false);
        } else {
            setIsResetConfirm(true);
        }
    };

    return (
        <div className="space-y-2">
            {/* メイン操作ボタン */}
            <div className="grid grid-cols-2 gap-2">
                {phase === 'idle' ? (
                    <button
                        type="button"
                        onClick={onStart}
                        className="col-span-2 bg-[#EF8A00] text-white py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <HiPlay className="w-6 h-6 sm:w-6 sm:h-6" />
                        スタート
                    </button>
                ) : (
                    <>
                        {isRunning ? (
                            <button
                                type="button"
                                onClick={onPause}
                                className="bg-amber-500 text-white py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                            >
                                <HiPause className="w-6 h-6 sm:w-6 sm:h-6" />
                                一時停止
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onResume}
                                className="bg-[#EF8A00] text-white py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                            >
                                <HiPlay className="w-6 h-6 sm:w-6 sm:h-6" />
                                {isSecondPhaseStart ? '2回目スタート' : '再開'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleReset}
                            className={`py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg border transition-all flex items-center justify-center gap-2 min-h-[44px] ${isResetConfirm
                                ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            <HiRefresh className={`w-6 h-6 sm:w-6 sm:h-6 ${isResetConfirm ? 'animate-spin' : ''}`} />
                            {isResetConfirm ? '本当にリセット？' : 'リセット'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

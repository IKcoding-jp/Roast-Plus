/**
 * タイマー操作ボタンコンポーネント
 */

'use client';

import { useState, useEffect } from 'react';
import { HiPlay, HiPause, HiRefresh } from 'react-icons/hi';
import { type TimerStatus } from '@/hooks/useHandpickTimer';

interface TimerControlsProps {
    status: TimerStatus;
    onStart: () => void | Promise<void>;
    onPause: () => void;
    onResume: () => void | Promise<void>;
    onReset: () => void;
}

export function TimerControls({
    status,
    onStart,
    onPause,
    onResume,
    onReset,
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

    // statusに基づいてボタン表示を決定
    const getMainButton = () => {
        if (status === 'idle') {
            return (
                <button
                    type="button"
                    onClick={onStart}
                    className="col-span-2 bg-[#EF8A00] text-white py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                    <HiPlay className="w-6 h-6 sm:w-6 sm:h-6" />
                    スタート
                </button>
            );
        }

        if (status === 'first-running' || status === 'second-running') {
            return (
                <button
                    type="button"
                    onClick={onPause}
                    className="bg-amber-500 text-white py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                    <HiPause className="w-6 h-6 sm:w-6 sm:h-6" />
                    一時停止
                </button>
            );
        }

        // first-paused, second-waiting, second-paused
        return (
            <button
                type="button"
                onClick={onResume}
                className="bg-[#EF8A00] text-white py-3.5 sm:py-3 rounded-lg font-bold text-base sm:text-base lg:text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
                <HiPlay className="w-6 h-6 sm:w-6 sm:h-6" />
                {status === 'second-waiting' ? '2回目スタート' : '再開'}
            </button>
        );
    };

    return (
        <div className="space-y-2">
            {/* メイン操作ボタン */}
            <div className="grid grid-cols-2 gap-2">
                {getMainButton()}
                {status !== 'idle' && (
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
                )}
            </div>
        </div>
    );
}

/**
 * タイマー操作ボタンコンポーネント
 */

'use client';

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
}: TimerControlsProps) {
    const handleReset = () => {
        if (window.confirm('タイマーをリセットしますか？')) {
            onReset();
        }
    };

    return (
        <div className="space-y-2">
            {/* メイン操作ボタン */}
            <div className="grid grid-cols-2 gap-2">
                {phase === 'idle' ? (
                    <button
                        onClick={onStart}
                        className="col-span-2 bg-[#EF8A00] text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <HiPlay className="w-5 h-5 sm:w-6 sm:h-6" />
                        スタート
                    </button>
                ) : (
                    <>
                        {isRunning ? (
                            <button
                                onClick={onPause}
                                className="bg-amber-500 text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base lg:text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <HiPause className="w-5 h-5 sm:w-6 sm:h-6" />
                                一時停止
                            </button>
                        ) : (
                            <button
                                onClick={onResume}
                                className="bg-[#EF8A00] text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base lg:text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <HiPlay className="w-5 h-5 sm:w-6 sm:h-6" />
                                再開
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base lg:text-lg border border-gray-200 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <HiRefresh className="w-5 h-5 sm:w-6 sm:h-6" />
                            リセット
                        </button>
                    </>
                )}
            </div>

            {/* サウンド切り替えボタン */}
            <div className="flex justify-end">
                <button
                    onClick={onToggleSound}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-sm border transition-all flex items-center justify-center gap-2 ${soundEnabled
                            ? 'bg-[#EF8A00] text-white border-[#EF8A00]'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                >
                    {soundEnabled ? <HiVolumeUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <HiVolumeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="hidden sm:inline">{soundEnabled ? '音あり' : '音なし'}</span>
                </button>
            </div>
        </div>
    );
}

'use client';

import { RoastTimerState } from '@/types';
import { HiPlay, HiPause, HiRefresh, HiFastForward } from 'react-icons/hi';

interface RoastTimerControlsProps {
    state: RoastTimerState | null;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
    onSkip: () => void;
}

export function RoastTimerControls({
    state,
    onPause,
    onResume,
    onReset,
    onSkip,
}: RoastTimerControlsProps) {
    const isRunning = state?.status === 'running';
    const isCompleted = state?.status === 'completed';

    if (!state || isCompleted) return null;

    return (
        <div className="bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="max-w-md mx-auto grid grid-cols-3 gap-4">
                <button
                    onClick={onReset}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                >
                    <HiRefresh className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold">リセット</span>
                </button>

                {isRunning ? (
                    <button
                        onClick={onPause}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95 transition-all duration-200 border-2 border-amber-200"
                    >
                        <HiPause className="w-10 h-10 mb-1" />
                        <span className="text-xs font-bold">一時停止</span>
                    </button>
                ) : (
                    <button
                        onClick={onResume}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition-all duration-200 shadow-lg shadow-amber-200"
                    >
                        <HiPlay className="w-10 h-10 mb-1 pl-1" />
                        <span className="text-xs font-bold">再開</span>
                    </button>
                )}

                <button
                    onClick={onSkip}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                >
                    <HiFastForward className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold">スキップ</span>
                </button>
            </div>
        </div>
    );
}

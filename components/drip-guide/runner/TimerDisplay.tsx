'use client';

import React from 'react';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface TimerDisplayProps {
    currentTime: number;
    recipeName: string;
    totalDurationSec: number;
    isManualMode: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    currentTime,
    recipeName,
    totalDurationSec,
    isManualMode,
}) => {
    const overallProgress = Math.min(currentTime / totalDurationSec, 1);

    return (
        <div className="relative flex flex-col items-center pt-2 pb-5 w-full">
            {/* Recipe name */}
            <span className="text-sm text-ink-muted font-semibold mb-3 tracking-wide">
                {recipeName}
            </span>

            {/* Timer digits */}
            <div className="text-[4.5rem] font-extrabold text-ink tracking-[-0.04em] tabular-nums leading-none font-nunito">
                {formatTime(currentTime)}
            </div>

            {/* Overall micro progress */}
            {!isManualMode && (
                <div className="mt-4 flex items-center gap-2">
                    <div className="w-20 h-[3px] rounded-full bg-edge overflow-hidden">
                        <div
                            className="h-full rounded-full bg-spot/50 transition-all duration-1000 ease-linear"
                            style={{ width: `${overallProgress * 100}%` }}
                        />
                    </div>
                    <span className="text-[9px] text-ink-muted tabular-nums font-medium">
                        {formatTime(currentTime)} / {formatTime(totalDurationSec)}
                    </span>
                </div>
            )}
        </div>
    );
};

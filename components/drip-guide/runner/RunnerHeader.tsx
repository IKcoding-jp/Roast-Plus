'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface RunnerHeaderProps {
    currentStepIndex: number;
    totalSteps: number;
    currentTime?: number;
    totalDurationSec?: number;
    recipeName?: string;
}

export const RunnerHeader: React.FC<RunnerHeaderProps> = ({
    currentStepIndex,
    totalSteps,
    currentTime,
    totalDurationSec,
    recipeName,
}) => {
    const overallProgress =
        currentTime !== undefined && totalDurationSec
            ? Math.min(currentTime / totalDurationSec, 1)
            : 0;

    return (
        <div className="flex-none flex items-center justify-between px-5 pt-4 pb-1 md:justify-start md:gap-5 md:bg-surface/80 md:border-b md:border-edge md:py-3">
            <Link
                href="/drip-guide"
                className="p-1.5 rounded-full text-ink-muted hover:text-ink-sub transition-colors active:bg-ground flex-none"
            >
                <ArrowLeft size={18} weight="bold" />
            </Link>

            {/* iPad only: timer */}
            {currentTime !== undefined && (
                <div className="hidden md:flex items-baseline flex-none">
                    <span className="text-[3rem] font-extrabold text-ink tracking-[-0.04em] tabular-nums leading-none font-nunito">
                        {formatTime(currentTime)}
                    </span>
                </div>
            )}

            {/* iPad only: progress bar + recipe name + step counter */}
            {totalDurationSec !== undefined && (
                <div className="hidden md:flex flex-1 flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-ink-muted font-medium">{recipeName}</span>
                        <span className="text-[11px] font-bold text-ink-muted tracking-[0.12em] uppercase">
                            Step {currentStepIndex + 1} / {totalSteps}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-[4px] rounded-full bg-edge overflow-hidden">
                            <div
                                className="h-full rounded-full bg-spot/60 transition-all duration-1000 ease-linear"
                                style={{ width: `${overallProgress * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-ink-muted tabular-nums whitespace-nowrap">
                            {formatTime(currentTime ?? 0)} / {formatTime(totalDurationSec)}
                        </span>
                    </div>
                </div>
            )}

            {/* Mobile only: step counter */}
            <span className="md:hidden text-[10px] font-bold text-ink-muted tracking-[0.15em] uppercase">
                Step {currentStepIndex + 1} / {totalSteps}
            </span>
        </div>
    );
};

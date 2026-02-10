'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';

interface RunnerHeaderProps {
    currentStepIndex: number;
    totalSteps: number;
}

export const RunnerHeader: React.FC<RunnerHeaderProps> = ({
    currentStepIndex,
    totalSteps,
}) => {
    return (
        <div className="flex-none flex items-center justify-between px-5 pt-4 pb-1">
            <Link
                href="/drip-guide"
                className="p-1.5 rounded-full text-ink-muted hover:text-ink-sub transition-colors active:bg-ground"
            >
                <ArrowLeft size={18} weight="bold" />
            </Link>
            <span className="text-[10px] font-bold text-ink-muted tracking-[0.15em] uppercase">
                Step {currentStepIndex + 1} / {totalSteps}
            </span>
        </div>
    );
};

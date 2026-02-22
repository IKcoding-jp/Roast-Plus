'use client';

import React from 'react';
import { CheckCircle } from 'phosphor-react';
import { DripStep } from '@/lib/drip-guide/types';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface StepListSidebarProps {
    steps: DripStep[];
    currentStepIndex: number;
}

export const StepListSidebar: React.FC<StepListSidebarProps> = ({
    steps,
    currentStepIndex,
}) => {
    return (
        <div className="w-[220px] flex-none border-r border-edge bg-surface/20 overflow-y-auto py-3 px-3 h-full">
            <div className="space-y-0.5">
                {steps.map((step, index) => {
                    const isDone = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className={`flex items-start gap-2 px-2.5 py-2 rounded-xl transition-colors ${
                                isCurrent ? 'bg-spot/10 border border-spot/20' : ''
                            }`}
                        >
                            <div className="flex-none mt-0.5">
                                {isDone ? (
                                    <CheckCircle size={15} weight="fill" className="text-spot/50" />
                                ) : isCurrent ? (
                                    <div className="w-[15px] h-[15px] rounded-full bg-spot flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    </div>
                                ) : (
                                    <div className="w-[15px] h-[15px] rounded-full border-2 border-edge-strong" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[11px] font-semibold leading-tight truncate ${
                                    isCurrent ? 'text-spot' : isDone ? 'text-ink-muted line-through' : 'text-ink-sub'
                                }`}>
                                    {step.title}
                                </p>
                                <p className={`text-[9px] mt-0.5 tabular-nums font-medium ${
                                    isCurrent ? 'text-spot/70' : isDone ? 'text-ink-muted/50' : 'text-ink-muted'
                                }`}>
                                    {formatTime(step.startTimeSec)}{step.targetTotalWater ? `・${step.targetTotalWater}g` : ''}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

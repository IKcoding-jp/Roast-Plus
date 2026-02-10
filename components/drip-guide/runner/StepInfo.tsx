'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Drop, CaretRight } from 'phosphor-react';
import { DripStep } from '@/lib/drip-guide/types';

interface StepInfoProps {
    currentStep: DripStep | null;
    nextStep: DripStep | null;
    currentTime: number;
    isManualMode: boolean;
    remainingStepsAfterNext: number;
}

export const StepInfo: React.FC<StepInfoProps> = ({
    currentStep,
    nextStep,
    currentTime,
    isManualMode,
    remainingStepsAfterNext,
}) => {
    // Calculate countdown values
    const stepStart = currentStep?.startTimeSec ?? 0;
    const stepEnd = nextStep ? nextStep.startTimeSec : undefined;
    const secondsUntilNext = stepEnd !== undefined ? Math.max(stepEnd - currentTime, 0) : null;
    const stepDuration = stepEnd !== undefined ? stepEnd - stepStart : undefined;
    const stepProgress = stepDuration && stepDuration > 0
        ? Math.min((currentTime - stepStart) / stepDuration, 1)
        : 0;

    return (
        <div className="w-full max-w-md flex-shrink-0">
            <AnimatePresence mode="wait">
                {currentStep ? (
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Unified Step Card */}
                        <div className="rounded-2xl overflow-hidden bg-surface border border-edge shadow-card">
                            {/* Accent top bar */}
                            <div className="h-[3px] w-full bg-gradient-to-r from-spot to-spot/15" />

                            {/* Current step — top section */}
                            <div className="px-4 pt-4 pb-3">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-spot flex items-center justify-center shadow-sm">
                                        <Drop size={14} weight="fill" className="text-white" />
                                    </div>
                                    <span className="text-[15px] font-bold text-ink leading-tight">
                                        {currentStep.title}
                                    </span>
                                </div>

                                {currentStep.targetTotalWater && (
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-[2.25rem] font-extrabold text-spot tabular-nums tracking-tight leading-none font-nunito">
                                            {currentStep.targetTotalWater}
                                        </span>
                                        <span className="text-lg font-bold text-spot/50">g</span>
                                        <span className="text-sm text-ink-muted ml-1 font-medium">まで注ぐ</span>
                                    </div>
                                )}

                                <p className="text-[13px] text-ink-sub leading-relaxed">
                                    {currentStep.description}
                                </p>

                                {currentStep.note && (
                                    <p className="text-[11px] text-ink-muted mt-2 leading-relaxed italic">
                                        {currentStep.note}
                                    </p>
                                )}
                            </div>

                            {/* Next step countdown — integrated bottom section */}
                            {nextStep && !isManualMode && secondsUntilNext !== null && (
                                <div className="border-t border-edge-subtle">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        {/* Left accent line */}
                                        <div className="w-[3px] self-stretch rounded-full bg-spot/25 flex-shrink-0" />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <CaretRight size={11} weight="bold" className="text-spot/40" />
                                                    <span className="text-[13px] font-semibold text-ink-sub truncate">
                                                        {nextStep.title}
                                                    </span>
                                                    {nextStep.targetTotalWater && (
                                                        <span className="text-[11px] font-medium text-ink-muted ml-0.5">
                                                            {nextStep.targetTotalWater}gまで
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline flex-shrink-0 ml-2">
                                                    <span className="text-xl font-extrabold text-spot tabular-nums leading-none font-nunito">
                                                        {secondsUntilNext}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-spot/50 ml-0.5">秒</span>
                                                </div>
                                            </div>

                                            {/* Countdown bar */}
                                            <div className="w-full h-1 rounded-full bg-edge overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-spot/50 transition-all duration-1000 ease-linear"
                                                    style={{ width: `${(1 - stepProgress) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Remaining steps */}
                        {remainingStepsAfterNext > 0 && (
                            <p className="text-[10px] text-ink-muted text-center mt-3 tracking-wide font-medium">
                                残り {remainingStepsAfterNext} ステップ
                            </p>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-ink-muted text-base py-4 text-center"
                    >
                        準備ができたら
                        <br />
                        スタートボタンを押してください
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

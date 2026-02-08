'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ArrowCounterClockwise, X, ArrowLeft, ArrowRight, CheckCircle } from 'phosphor-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { DripStep } from '@/lib/drip-guide/types';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface FooterControlsProps {
    isManualMode: boolean;
    isRunning: boolean;
    nextStep: DripStep | null;
    manualStepIndex: number;
    stepsLength: number;
    currentStepIndex: number;
    onToggleTimer: () => void;
    onResetTimer: () => void;
    onGoToNextStep: () => void;
    onGoToPrevStep: () => void;
    onComplete: () => void;
}

export const FooterControls: React.FC<FooterControlsProps> = ({
    isManualMode,
    isRunning,
    nextStep,
    manualStepIndex,
    stepsLength,
    currentStepIndex,
    onToggleTimer,
    onResetTimer,
    onGoToNextStep,
    onGoToPrevStep,
    onComplete,
}) => {
    return (
        <div className="flex-none bg-surface border-t border-edge pb-8 pt-4 px-6 safe-area-bottom">
            {/* Next Step Preview */}
            {!isManualMode && (
                <div className="h-8 mb-4 flex justify-center items-center">
                    {nextStep && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-ink-muted text-xs font-medium bg-ground px-3 py-1 rounded-full"
                        >
                            Next: {formatTime(nextStep.startTimeSec)} - {nextStep.title}
                        </motion.div>
                    )}
                </div>
            )}

            {isManualMode ? (
                // Manual mode controls
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <button
                        onClick={onResetTimer}
                        className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2 active:scale-95 min-h-[44px] min-w-[44px]"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <ArrowCounterClockwise size={24} />
                        </div>
                        <span className="text-xs font-medium">リセット</span>
                    </button>

                    <button
                        onClick={onGoToPrevStep}
                        disabled={manualStepIndex === 0}
                        className={clsx(
                            'flex flex-col items-center gap-1 transition-colors p-2 active:scale-95 min-h-[44px] min-w-[44px]',
                            manualStepIndex === 0
                                ? 'text-ink-muted/50 cursor-not-allowed'
                                : 'text-ink-muted hover:text-ink-sub'
                        )}
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <ArrowLeft size={24} />
                        </div>
                        <span className="text-xs font-medium">前へ</span>
                    </button>

                    <button
                        onClick={onToggleTimer}
                        className={clsx(
                            'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 touch-manipulation',
                            isRunning
                                ? 'bg-surface border-2 border-spot/20 text-spot'
                                : 'bg-spot text-white shadow-spot/30'
                        )}
                    >
                        {isRunning ? (
                            <Pause size={28} weight="fill" className="sm:w-9 sm:h-9" />
                        ) : (
                            <Play size={28} weight="fill" className="ml-1 sm:w-9 sm:h-9" />
                        )}
                    </button>

                    {currentStepIndex === stepsLength - 1 ? (
                        <button
                            onClick={onComplete}
                            className="flex flex-col items-center gap-1 text-success hover:text-success/80 transition-colors p-2 active:scale-95 min-h-[44px] min-w-[44px]"
                        >
                            <div className="p-3 rounded-full bg-success-subtle">
                                <CheckCircle size={24} weight="fill" />
                            </div>
                            <span className="text-xs font-medium">完了</span>
                        </button>
                    ) : (
                        <button
                            onClick={onGoToNextStep}
                            className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2 active:scale-95 min-h-[44px] min-w-[44px]"
                        >
                            <div className="p-3 rounded-full bg-ground">
                                <ArrowRight size={24} />
                            </div>
                            <span className="text-xs font-medium">次へ</span>
                        </button>
                    )}

                    <Link
                        href="/drip-guide"
                        className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2 active:scale-95 min-h-[44px] min-w-[44px]"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <X size={24} />
                        </div>
                        <span className="text-xs font-medium">終了</span>
                    </Link>
                </div>
            ) : (
                // Auto mode controls
                <div className="flex items-center justify-center gap-10">
                    <button
                        onClick={onResetTimer}
                        className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2 active:scale-95"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <ArrowCounterClockwise size={24} />
                        </div>
                        <span className="text-xs font-medium">リセット</span>
                    </button>

                    <button
                        onClick={onToggleTimer}
                        className={clsx(
                            'w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 touch-manipulation',
                            isRunning
                                ? 'bg-surface border-2 border-spot/20 text-spot'
                                : 'bg-spot text-white shadow-spot/30'
                        )}
                    >
                        {isRunning ? (
                            <Pause size={36} weight="fill" />
                        ) : (
                            <Play size={36} weight="fill" className="ml-1" />
                        )}
                    </button>

                    <Link
                        href="/drip-guide"
                        className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2 active:scale-95"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <X size={24} />
                        </div>
                        <span className="text-xs font-medium">終了</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

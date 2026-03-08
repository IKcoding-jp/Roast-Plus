'use client';

import React from 'react';
import { Play, Pause, ArrowCounterClockwise, X, ArrowLeft, ArrowRight, CheckCircle } from 'phosphor-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import type { DripStep } from '@/lib/drip-guide/types';
import { IconButton } from '@/components/ui';

interface FooterControlsProps {
    isManualMode: boolean;
    isRunning: boolean;
    nextStep?: DripStep | null;
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
            {isManualMode ? (
                // Manual mode controls
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <IconButton
                        variant="ghost"
                        onClick={onResetTimer}
                        className="!p-2 flex-col gap-1 text-ink-muted hover:text-ink-sub active:scale-95 min-h-[44px] min-w-[44px]"
                        aria-label="リセット"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <ArrowCounterClockwise size={24} />
                        </div>
                        <span className="text-xs font-medium">リセット</span>
                    </IconButton>

                    <IconButton
                        variant="ghost"
                        onClick={onGoToPrevStep}
                        disabled={manualStepIndex === 0}
                        className={clsx(
                            '!p-2 flex-col gap-1 active:scale-95 min-h-[44px] min-w-[44px]',
                            manualStepIndex === 0
                                ? 'text-ink-muted/50'
                                : 'text-ink-muted hover:text-ink-sub'
                        )}
                        aria-label="前へ"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <ArrowLeft size={24} />
                        </div>
                        <span className="text-xs font-medium">前へ</span>
                    </IconButton>

                    <IconButton
                        variant="ghost"
                        rounded
                        onClick={onToggleTimer}
                        className={clsx(
                            'w-16 h-16 sm:w-20 sm:h-20 !p-0 shadow-xl active:scale-95 touch-manipulation',
                            isRunning
                                ? 'bg-surface border-2 border-spot/20 text-spot'
                                : 'bg-spot text-white shadow-spot/30'
                        )}
                        aria-label={isRunning ? '一時停止' : '再生'}
                    >
                        {isRunning ? (
                            <Pause size={28} weight="fill" className="sm:w-9 sm:h-9" />
                        ) : (
                            <Play size={28} weight="fill" className="ml-1 sm:w-9 sm:h-9" />
                        )}
                    </IconButton>

                    {currentStepIndex === stepsLength - 1 ? (
                        <IconButton
                            variant="ghost"
                            onClick={onComplete}
                            className="!p-2 flex-col gap-1 text-success hover:text-success/80 active:scale-95 min-h-[44px] min-w-[44px]"
                            aria-label="完了"
                        >
                            <div className="p-3 rounded-full bg-success-subtle">
                                <CheckCircle size={24} weight="fill" />
                            </div>
                            <span className="text-xs font-medium">完了</span>
                        </IconButton>
                    ) : (
                        <IconButton
                            variant="ghost"
                            onClick={onGoToNextStep}
                            className="!p-2 flex-col gap-1 text-ink-muted hover:text-ink-sub active:scale-95 min-h-[44px] min-w-[44px]"
                            aria-label="次へ"
                        >
                            <div className="p-3 rounded-full bg-ground">
                                <ArrowRight size={24} />
                            </div>
                            <span className="text-xs font-medium">次へ</span>
                        </IconButton>
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
                    <IconButton
                        variant="ghost"
                        onClick={onResetTimer}
                        className="!p-2 flex-col gap-1 text-ink-muted hover:text-ink-sub active:scale-95"
                        aria-label="リセット"
                    >
                        <div className="p-3 rounded-full bg-ground">
                            <ArrowCounterClockwise size={24} />
                        </div>
                        <span className="text-xs font-medium">リセット</span>
                    </IconButton>

                    <IconButton
                        variant="ghost"
                        rounded
                        onClick={onToggleTimer}
                        className={clsx(
                            'w-20 h-20 !p-0 shadow-xl active:scale-95 touch-manipulation',
                            isRunning
                                ? 'bg-surface border-2 border-spot/20 text-spot'
                                : 'bg-spot text-white shadow-spot/30'
                        )}
                        aria-label={isRunning ? '一時停止' : '再生'}
                    >
                        {isRunning ? (
                            <Pause size={36} weight="fill" />
                        ) : (
                            <Play size={36} weight="fill" className="ml-1" />
                        )}
                    </IconButton>

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

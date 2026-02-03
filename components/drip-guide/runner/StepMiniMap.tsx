'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { DripStep } from '@/lib/drip-guide/types';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface StepMiniMapProps {
    steps: DripStep[];
    currentStep: DripStep | null;
    currentTime: number;
    totalDurationSec: number;
    isManualMode: boolean;
    currentStepIndex: number;
    scrollKey: number;
}

export const StepMiniMap: React.FC<StepMiniMapProps> = ({
    steps,
    currentStep,
    currentTime,
    totalDurationSec,
    isManualMode,
    currentStepIndex,
    scrollKey,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentStep && scrollContainerRef.current) {
            const activeStepElement = document.getElementById(`step-card-${currentStep.id}`);
            if (activeStepElement) {
                activeStepElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
        }
    }, [currentStep, scrollKey]);

    return (
        <div className="w-full max-w-2xl mb-2 sm:mb-3 px-2 flex-shrink-0">
            <div className="overflow-x-auto scrollbar-hide pb-1 -mx-2 px-2" ref={scrollContainerRef}>
                <div className="flex gap-2 sm:gap-2 min-w-max">
                    {steps.map((step, index) => {
                        const stepEndTime =
                            index < steps.length - 1 ? steps[index + 1].startTimeSec : totalDurationSec;
                        const isStepCompleted = isManualMode
                            ? index < currentStepIndex
                            : currentTime > stepEndTime;
                        const isCurrent = currentStep?.id === step.id;

                        return (
                            <motion.div
                                key={step.id}
                                id={`step-card-${step.id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={clsx(
                                    'flex-shrink-0 rounded-lg px-3 py-2 sm:px-3 sm:py-2 min-w-[120px] sm:min-w-[120px] border-2 transition-all',
                                    isCurrent
                                        ? 'bg-amber-50 border-amber-400 shadow-md'
                                        : isStepCompleted
                                        ? 'bg-gray-50 border-gray-200'
                                        : 'bg-gray-100 border-gray-200 opacity-60'
                                )}
                            >
                                <div
                                    className={clsx(
                                        'text-sm sm:text-sm font-bold truncate',
                                        isCurrent
                                            ? 'text-amber-800'
                                            : isStepCompleted
                                            ? 'text-gray-700'
                                            : 'text-gray-500'
                                    )}
                                >
                                    {step.title}
                                </div>
                                {!isManualMode && (
                                    <div
                                        className={clsx(
                                            'text-xs sm:text-xs font-semibold mt-0.5 sm:mt-0.5',
                                            isCurrent
                                                ? 'text-amber-700'
                                                : isStepCompleted
                                                ? 'text-gray-600'
                                                : 'text-gray-400'
                                        )}
                                    >
                                        {formatTime(step.startTimeSec)} - {formatTime(stepEndTime)}
                                    </div>
                                )}
                                {step.targetTotalWater && (
                                    <div
                                        className={clsx(
                                            'text-xs sm:text-xs mt-0.5 sm:mt-0.5',
                                            isCurrent
                                                ? 'text-amber-600'
                                                : isStepCompleted
                                                ? 'text-gray-500'
                                                : 'text-gray-400'
                                        )}
                                    >
                                        {step.targetTotalWater}gまで注ぐ
                                    </div>
                                )}
                                {isCurrent && !isManualMode && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${Math.min(
                                                ((currentTime - step.startTimeSec) /
                                                    (stepEndTime - step.startTimeSec)) *
                                                    100,
                                                100
                                            )}%`,
                                        }}
                                        className="h-1 sm:h-1 bg-amber-500 rounded-full mt-1.5 sm:mt-1.5"
                                        transition={{ duration: 1, ease: 'linear' }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

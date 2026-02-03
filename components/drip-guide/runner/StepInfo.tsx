'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'phosphor-react';
import { DripStep } from '@/lib/drip-guide/types';

interface StepInfoProps {
    currentStep: DripStep | null;
}

export const StepInfo: React.FC<StepInfoProps> = ({ currentStep }) => {
    return (
        <div className="w-full max-w-md text-center flex-shrink-0 flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {currentStep ? (
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center"
                    >
                        <h3 className="text-3xl sm:text-2xl md:text-3xl font-bold text-amber-700 mb-4 sm:mb-3">
                            {currentStep.title}
                        </h3>

                        {currentStep.targetTotalWater && (
                            <div className="mb-4 sm:mb-3">
                                <span className="inline-block bg-blue-50 text-blue-600 px-6 py-3 sm:px-5 sm:py-2 rounded-full font-bold text-xl sm:text-lg shadow-sm border border-blue-100">
                                    {currentStep.targetTotalWater}g{' '}
                                    <span className="text-base sm:text-sm font-normal text-blue-400">
                                        まで注ぐ
                                    </span>
                                </span>
                            </div>
                        )}

                        <p className="text-lg sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-3 max-w-xs mx-auto">
                            {currentStep.description}
                        </p>

                        {currentStep.note && (
                            <div className="bg-amber-50 p-4 sm:p-3 rounded-xl border border-amber-100 text-amber-800 text-base sm:text-sm max-w-xs mx-auto flex items-start gap-2">
                                <Lightbulb
                                    size={20}
                                    className="sm:w-4 sm:h-4 text-amber-600 flex-shrink-0 mt-0.5"
                                    weight="fill"
                                />
                                <span>{currentStep.note}</span>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-400 text-base py-4"
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

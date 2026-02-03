'use client';

import React from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Drop, Timer, SpinnerGap } from 'phosphor-react';
import { RECIPE_HOFFMANN_STEP_DETAILS } from '@/lib/drip-guide/recipeHoffmannContent';

type StepDetailKey = keyof typeof RECIPE_HOFFMANN_STEP_DETAILS;

const overlayMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const dialogMotion: MotionProps = {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
    transition: { type: 'spring', stiffness: 240, damping: 28 },
};

interface HoffmannStepDetailModalProps {
    detailKey: StepDetailKey | null;
    onClose: () => void;
}

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'bloom':
            return <Drop size={20} weight="fill" />;
        case 'pour':
            return <Drop size={20} weight="duotone" />;
        case 'stir':
            return <SpinnerGap size={20} weight="bold" />;
        case 'timer':
            return <Timer size={20} weight="duotone" />;
        default:
            return <Drop size={20} weight="bold" />;
    }
};

export const HoffmannStepDetailModal: React.FC<HoffmannStepDetailModalProps> = ({
    detailKey,
    onClose,
}) => {
    if (!detailKey) return null;

    const detail = RECIPE_HOFFMANN_STEP_DETAILS[detailKey];

    return (
        <AnimatePresence>
            {detailKey && (
                <>
                    <motion.div
                        {...overlayMotion}
                        className="fixed inset-0 z-[60] bg-black/40"
                        onClick={onClose}
                    />
                    <motion.div
                        {...dialogMotion}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
                        onClick={onClose}
                    >
                        <div
                            className="w-full max-w-md rounded-2xl bg-white shadow-xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                                        {getIcon(detail.icon)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{detail.title}</h3>
                                        <p className="text-xs text-amber-700 font-medium">
                                            {detail.technique}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <span className="text-2xl leading-none">×</span>
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-4">
                                <p className="text-gray-700 leading-relaxed">{detail.description}</p>

                                <div className="bg-amber-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-800 mb-2 text-sm">ポイント</h4>
                                    <ul className="space-y-2">
                                        {detail.tips.map((tip, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm text-amber-900"
                                            >
                                                <span className="text-amber-600 mt-0.5">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors"
                                >
                                    閉じる
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

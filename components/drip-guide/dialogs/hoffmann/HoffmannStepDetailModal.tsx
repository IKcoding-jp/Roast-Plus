'use client';

import React from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Drop, Timer, SpinnerGap } from 'phosphor-react';
import { RECIPE_HOFFMANN_STEP_DETAILS } from '@/lib/drip-guide/recipeHoffmannContent';
import { Button } from '@/components/ui';

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
                            className="w-full max-w-md rounded-2xl bg-overlay shadow-xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-spot-subtle text-spot flex items-center justify-center">
                                        {getIcon(detail.icon)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-ink">{detail.title}</h3>
                                        <p className="text-xs text-spot font-medium">
                                            {detail.technique}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-ink-muted hover:text-ink hover:bg-ground rounded-full transition-colors"
                                >
                                    <span className="text-2xl leading-none">×</span>
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-4">
                                <p className="text-ink-sub leading-relaxed">{detail.description}</p>

                                <div className="bg-spot-subtle rounded-lg p-4">
                                    <h4 className="font-semibold text-spot-hover mb-2 text-sm">ポイント</h4>
                                    <ul className="space-y-2">
                                        {detail.tips.map((tip, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm text-ink"
                                            >
                                                <span className="text-spot mt-0.5">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-ground border-t border-edge flex justify-end">
                                <Button
                                    variant="coffee"
                                    size="sm"
                                    onClick={onClose}
                                >
                                    閉じる
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

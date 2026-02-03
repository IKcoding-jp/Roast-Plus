'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { calculateRecipeForServings } from '@/lib/drip-guide/recipeCalculator';
import { MOCK_RECIPES } from '@/lib/drip-guide/mockData';
import { RECIPE_HOFFMANN_STEP_DETAILS } from '@/lib/drip-guide/recipeHoffmannContent';
import { useDialogKeyboard } from '@/hooks/drip-guide/useDialogKeyboard';
import { DialogOverlay } from './dialogs/shared/DialogOverlay';
import { HoffmannDialogHeader } from './dialogs/hoffmann/HoffmannDialogHeader';
import { HoffmannDialogForm } from './dialogs/hoffmann/HoffmannDialogForm';
import { HoffmannPreview } from './dialogs/hoffmann/HoffmannPreview';
import { HoffmannDescriptionModal } from './dialogs/hoffmann/HoffmannDescriptionModal';
import { HoffmannStepDetailModal } from './dialogs/hoffmann/HoffmannStepDetailModal';

interface StartHoffmannDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialServings?: number;
}

const dialogMotion: MotionProps = {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
    transition: { type: 'spring', stiffness: 240, damping: 28 },
};

type StepDetailKey = keyof typeof RECIPE_HOFFMANN_STEP_DETAILS;

export const StartHoffmannDialog: React.FC<StartHoffmannDialogProps> = ({
    isOpen,
    onClose,
    initialServings = 1,
}) => {
    const router = useRouter();
    const [servings, setServings] = useState(initialServings);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [selectedStepDetail, setSelectedStepDetail] = useState<StepDetailKey | null>(null);

    useEffect(() => {
        setServings(initialServings);
    }, [initialServings]);

    useDialogKeyboard({
        isOpen,
        onClose,
        onEscape: () => {
            if (selectedStepDetail) {
                setSelectedStepDetail(null);
            } else if (isDescriptionModalOpen) {
                setIsDescriptionModalOpen(false);
            } else {
                onClose();
            }
        },
    });

    const baseRecipe = useMemo(() => {
        return MOCK_RECIPES.find((r) => r.id === 'recipe-hoffmann');
    }, []);

    const previewRecipe = useMemo(() => {
        if (!baseRecipe) return null;
        return calculateRecipeForServings(baseRecipe, servings);
    }, [baseRecipe, servings]);

    const handleStartGuide = () => {
        router.push(`/drip-guide/run?id=recipe-hoffmann&servings=${servings}`);
        onClose();
    };

    if (!previewRecipe) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <DialogOverlay onClick={onClose} />
                    <motion.div
                        {...dialogMotion}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={onClose}
                    >
                        <div
                            className="w-full max-w-2xl rounded-2xl border border-amber-100 bg-white shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <HoffmannDialogHeader />

                            <HoffmannDialogForm
                                servings={servings}
                                onServingsChange={setServings}
                                onDescriptionClick={() => setIsDescriptionModalOpen(true)}
                            />

                            <HoffmannPreview
                                recipe={previewRecipe}
                                onStepDetailClick={setSelectedStepDetail}
                            />

                            <div className="flex items-center justify-between px-5 pb-5 pt-1">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                >
                                    <span className="text-base">×</span>
                                    <span className="text-sm font-medium">閉じる</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartGuide}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.99] touch-manipulation"
                                >
                                    ガイド開始
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <HoffmannDescriptionModal
                        isOpen={isDescriptionModalOpen}
                        onClose={() => setIsDescriptionModalOpen(false)}
                    />

                    <HoffmannStepDetailModal
                        detailKey={selectedStepDetail}
                        onClose={() => setSelectedStepDetail(null)}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

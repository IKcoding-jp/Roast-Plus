'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { calculateRecipeForServings } from '@/lib/drip-guide/recipeCalculator';
import { MOCK_RECIPES } from '@/lib/drip-guide/mockData';
import { RECIPE_HOFFMANN_STEP_DETAILS } from '@/lib/drip-guide/recipeHoffmannContent';
import { useDialogKeyboard } from '@/hooks/drip-guide/useDialogKeyboard';
import { Button } from '@/components/ui';
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
                            className="w-full max-w-2xl rounded-2xl border border-edge bg-overlay shadow-2xl my-8"
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="gap-2"
                                >
                                    <span className="text-base">×</span>
                                    閉じる
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleStartGuide}
                                    className="!rounded-full !px-5 !py-3 active:scale-[0.99] touch-manipulation"
                                >
                                    ガイド開始
                                </Button>
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

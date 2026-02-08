'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateRecipe46, type Taste46, type Strength46 } from '@/lib/drip-guide/recipe46';
import { getLast46Taste, getLast46Strength, setLast46Taste, setLast46Strength } from '@/lib/localStorage';
import { useDialogKeyboard } from '@/hooks/drip-guide/useDialogKeyboard';
import { Button } from '@/components/ui';
import { DialogOverlay } from './dialogs/shared/DialogOverlay';
import { Dialog46Header } from './dialogs/46/Dialog46Header';
import { Dialog46Form } from './dialogs/46/Dialog46Form';
import { Dialog46Preview } from './dialogs/46/Dialog46Preview';
import { Dialog46DescriptionModal } from './dialogs/46/Dialog46DescriptionModal';

interface Start46DialogProps {
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

export const Start46Dialog: React.FC<Start46DialogProps> = ({
    isOpen,
    onClose,
    initialServings = 1,
}) => {
    const router = useRouter();
    const [servings, setServings] = useState(initialServings);
    const [taste, setTaste] = useState<Taste46>('basic');
    const [strength, setStrength] = useState<Strength46>('light');
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

    // 前回の選択を読み込む
    useEffect(() => {
        if (!isOpen) return;

        const lastTaste = getLast46Taste();
        const lastStrength = getLast46Strength();

        if (lastTaste === 'basic' || lastTaste === 'sweet' || lastTaste === 'bright') {
            setTaste(lastTaste);
        }
        if (lastStrength === 'light' || lastStrength === 'strong2' || lastStrength === 'strong3') {
            setStrength(lastStrength);
        }
    }, [isOpen]);

    useEffect(() => {
        setServings(initialServings);
    }, [initialServings]);

    useDialogKeyboard({
        isOpen,
        onClose,
        onEscape: () => {
            if (isDescriptionModalOpen) {
                setIsDescriptionModalOpen(false);
            } else {
                onClose();
            }
        },
    });

    const previewRecipe = useMemo(() => {
        return generateRecipe46(servings, taste, strength);
    }, [servings, taste, strength]);

    const handleStartGuide = () => {
        setLast46Taste(taste);
        setLast46Strength(strength);

        router.push(`/drip-guide/run?id=recipe-046&servings=${servings}&taste=${taste}&strength=${strength}`);
        onClose();
    };

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
                            <Dialog46Header />

                            <Dialog46Form
                                servings={servings}
                                taste={taste}
                                strength={strength}
                                onServingsChange={setServings}
                                onTasteChange={setTaste}
                                onStrengthChange={setStrength}
                                onDescriptionClick={() => setIsDescriptionModalOpen(true)}
                            />

                            <Dialog46Preview recipe={previewRecipe} />

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

                    <Dialog46DescriptionModal
                        isOpen={isDescriptionModalOpen}
                        onClose={() => setIsDescriptionModalOpen(false)}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

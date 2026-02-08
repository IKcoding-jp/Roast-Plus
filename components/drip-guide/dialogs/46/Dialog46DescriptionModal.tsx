'use client';

import React from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Coffee, Timer, Drop } from 'phosphor-react';
import { RECIPE46_DESCRIPTION_SECTIONS } from '@/lib/drip-guide/recipe46Content';
import { Button } from '@/components/ui';

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

interface Dialog46DescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Dialog46DescriptionModal: React.FC<Dialog46DescriptionModalProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
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
                            className="w-full max-w-xl rounded-2xl bg-overlay shadow-xl relative overflow-hidden flex flex-col"
                            style={{ maxHeight: '90vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
                                <h3 className="text-xl font-bold text-ink">
                                    4:6メソッドのポイント
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-ink-muted hover:text-ink hover:bg-ground rounded-full transition-colors"
                                >
                                    <span className="text-2xl leading-none">×</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                                {RECIPE46_DESCRIPTION_SECTIONS.map((section, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-spot-subtle text-spot flex items-center justify-center">
                                            {section.icon === 'target' && <Drop size={20} weight="bold" />}
                                            {section.icon === 'rule' && <Coffee size={20} weight="bold" />}
                                            {section.icon === 'timer' && <Timer size={20} weight="bold" />}
                                            {section.icon === 'thermometer' && (
                                                <Drop size={20} weight="duotone" />
                                            )}
                                        </div>
                                        <div className="flex-1 border-b border-edge/30 pb-4">
                                            <h4 className="font-bold text-ink mb-1 text-base">
                                                {section.title}
                                            </h4>
                                            <p className="text-[15px] leading-relaxed text-ink-sub whitespace-pre-wrap">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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

'use client';

import React from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Coffee, Timer, Drop, Spiral } from 'phosphor-react';
import { RECIPE_HOFFMANN_DESCRIPTION_SECTIONS } from '@/lib/drip-guide/recipeHoffmannContent';

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

interface HoffmannDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'target':
            return <Drop size={20} weight="bold" />;
        case 'rule':
            return <Coffee size={20} weight="bold" />;
        case 'swirl':
            return <Spiral size={20} weight="bold" />;
        case 'thermometer':
            return <Timer size={20} weight="bold" />;
        default:
            return <Coffee size={20} weight="bold" />;
    }
};

export const HoffmannDescriptionModal: React.FC<HoffmannDescriptionModalProps> = ({
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
                            className="w-full max-w-xl rounded-2xl bg-white shadow-xl relative overflow-hidden flex flex-col"
                            style={{ maxHeight: '90vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Hoffmann V60のポイント
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <span className="text-2xl leading-none">×</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                                {RECIPE_HOFFMANN_DESCRIPTION_SECTIONS.map((section, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                                            {getIcon(section.icon)}
                                        </div>
                                        <div className="flex-1 border-b border-gray-50 pb-4">
                                            <h4 className="font-bold text-gray-900 mb-1 text-base">
                                                {section.title}
                                            </h4>
                                            <p className="text-[15px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-900 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-colors"
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

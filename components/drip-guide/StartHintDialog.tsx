'use client';

import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Coffee, Timer } from 'phosphor-react';
import { GiCoffeePot } from 'react-icons/gi';

interface StartHintDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    totalWaterGram?: number;
    servings?: number;
    recipeName?: string;
}

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

export const StartHintDialog: React.FC<StartHintDialogProps> = ({
    isOpen,
    onClose,
    onStart,
    totalWaterGram,
    servings,
    recipeName,
}) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isOpen) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        },
        [isOpen, onClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const waterInfo =
        typeof totalWaterGram === 'number'
            ? `${totalWaterGram}g${servings ? ` / ${servings}人前` : ''}`
            : undefined;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        {...overlayMotion}
                        className="fixed inset-0 z-50 bg-black/55"
                        onClick={onClose}
                    />
                    <motion.div
                        {...dialogMotion}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="w-full max-w-md rounded-2xl border border-amber-100 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-3 px-5 pt-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                                    <Coffee size={24} weight="duotone" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                        ドリップ前のヒント
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-gray-900">
                                        一杯をおいしく淹れるために
                                    </h3>
                                    {recipeName && (
                                        <p className="mt-1 text-sm text-gray-500">レシピ: {recipeName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
                                <div className="flex gap-3">
                                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                        <GiCoffeePot size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">湯量は総量表示です</p>
                                        <p className="text-gray-700">
                                            表示される湯量は合計量です。スケールを毎回0に戻す必要はありません。
                                        </p>
                                        {waterInfo && (
                                            <p className="mt-1 text-xs text-amber-700">今回の総湯量: {waterInfo}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                        <Timer size={18} weight="duotone" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">蒸らし後にタイマー開始</p>
                                        <p className="text-gray-700">
                                            蒸らしのお湯を入れたら、タイマーを開始してください。
                                        </p>
                                    </div>
                                </div>

                            </div>

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
                                    onClick={onStart}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-3 font-semibold text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.99] touch-manipulation"
                                >
                                    ガイド開始
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};


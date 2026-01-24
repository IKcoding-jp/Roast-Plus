'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Coffee, Timer, Drop, Spiral, SpinnerGap } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import {
    RECIPE_HOFFMANN_DESCRIPTION_SECTIONS,
    RECIPE_HOFFMANN_STEP_DETAILS,
} from '@/lib/drip-guide/recipeHoffmannContent';
import { calculateRecipeForServings } from '@/lib/drip-guide/recipeCalculator';
import { MOCK_RECIPES } from '@/lib/drip-guide/mockData';

interface StartHoffmannDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialServings?: number;
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

// ステップ詳細の型
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

    // 人前が変更された場合に更新
    useEffect(() => {
        if (initialServings !== servings) {
             
            setServings(initialServings);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialServings変更時のみ実行
    }, [initialServings]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isOpen) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                if (selectedStepDetail) {
                    setSelectedStepDetail(null);
                } else if (isDescriptionModalOpen) {
                    setIsDescriptionModalOpen(false);
                } else {
                    onClose();
                }
            }
        },
        [isOpen, onClose, isDescriptionModalOpen, selectedStepDetail]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Hoffmannレシピを取得して人前に応じて計算
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

    const formatTime = (seconds: number): string => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    // ステップからステップ詳細へのマッピング
    const stepToDetailKey = (stepTitle: string): StepDetailKey | null => {
        if (stepTitle.includes('蒸らし')) return 'bloom';
        if (stepTitle.includes('第1注湯')) return 'pour1';
        if (stepTitle.includes('第2注湯')) return 'pour2';
        if (stepTitle.includes('かき混ぜ')) return 'stir';
        if (stepTitle.includes('落ち切り')) return 'drawdown';
        return null;
    };

    // アイコン取得
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
            case 'bloom':
                return <Drop size={20} weight="fill" />;
            case 'pour':
                return <Drop size={20} weight="duotone" />;
            case 'stir':
                return <SpinnerGap size={20} weight="bold" />;
            case 'timer':
                return <Timer size={20} weight="duotone" />;
            default:
                return <Coffee size={20} weight="bold" />;
        }
    };

    if (!previewRecipe) return null;

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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={onClose}
                    >
                        <div
                            className="w-full max-w-2xl rounded-2xl border border-amber-100 bg-white shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-3 px-5 pt-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                                    <Coffee size={24} weight="duotone" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                        James Hoffmann V60
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-gray-900">
                                        Ultimate V60 Technique
                                    </h3>
                                </div>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                                {/* メソッドのポイント（解説ボタン） */}
                                <button
                                    type="button"
                                    onClick={() => setIsDescriptionModalOpen(true)}
                                    className="w-full rounded-lg bg-amber-50 border border-amber-100 p-3 text-left hover:bg-amber-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-amber-800">
                                            Hoffmann V60のポイント（必読）
                                        </span>
                                        <span className="text-amber-600 text-xs">クリックして開く</span>
                                    </div>
                                </button>

                                {/* 人前選択 */}
                                <div>
                                    <label htmlFor="servings-hoffmann" className="block text-sm font-semibold text-gray-900 mb-2">
                                        人前
                                    </label>
                                    <select
                                        id="servings-hoffmann"
                                        value={servings}
                                        onChange={(e) => setServings(parseInt(e.target.value, 10))}
                                        className="w-full py-2 px-3 pr-10 rounded-lg text-sm font-medium transition-colors min-h-[44px] bg-white border border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer"
                                        aria-label="人前を選択"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s}>
                                                {s}人前 ({s * 15}g / {s * 250}g)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* プレビュー情報 */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Coffee size={20} className="text-amber-700" />
                                            <span className="text-sm text-gray-600">豆量:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {previewRecipe.beanAmountGram}g
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Drop size={20} className="text-blue-500" />
                                            <span className="text-sm text-gray-600">総湯量:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {previewRecipe.totalWaterGram}g
                                            </span>
                                        </div>
                                    </div>

                                    {/* ステッププレビューテーブル */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">開始時刻</th>
                                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">ステップ</th>
                                                    <th className="text-right py-2 px-2 font-semibold text-gray-700">累積(g)</th>
                                                    <th className="text-center py-2 px-2 font-semibold text-gray-700">詳細</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewRecipe.steps.map((step) => {
                                                    const detailKey = stepToDetailKey(step.title);
                                                    return (
                                                        <tr key={step.id} className="border-b border-gray-100">
                                                            <td className="py-2 px-2 text-gray-700 font-mono">
                                                                {formatTime(step.startTimeSec)}
                                                            </td>
                                                            <td className="py-2 px-2 text-gray-700">{step.title}</td>
                                                            <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                                                                {step.targetTotalWater ?? '-'}
                                                            </td>
                                                            <td className="py-2 px-2 text-center">
                                                                {detailKey && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedStepDetail(detailKey)}
                                                                        className="text-amber-600 hover:text-amber-800 text-xs underline"
                                                                    >
                                                                        詳細
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                        <Timer size={16} />
                                        <span>
                                            総時間: {formatTime(previewRecipe.totalDurationSec)} ({Math.floor(previewRecipe.totalDurationSec / 60)}分{previewRecipe.totalDurationSec % 60}秒)
                                        </span>
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
                                    onClick={handleStartGuide}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.99] touch-manipulation"
                                >
                                    ガイド開始
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* メソッドのポイント説明モーダル */}
                    <AnimatePresence>
                        {isDescriptionModalOpen && (
                            <>
                                <motion.div
                                    {...overlayMotion}
                                    className="fixed inset-0 z-[60] bg-black/40"
                                    onClick={() => setIsDescriptionModalOpen(false)}
                                />
                                <motion.div
                                    {...dialogMotion}
                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
                                    onClick={() => setIsDescriptionModalOpen(false)}
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
                                                onClick={() => setIsDescriptionModalOpen(false)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <span className="text-2xl leading-none">×</span>
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                                            {RECIPE_HOFFMANN_DESCRIPTION_SECTIONS.map((section, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex gap-4"
                                                >
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
                                                onClick={() => setIsDescriptionModalOpen(false)}
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

                    {/* ステップ詳細モーダル */}
                    <AnimatePresence>
                        {selectedStepDetail && (
                            <>
                                <motion.div
                                    {...overlayMotion}
                                    className="fixed inset-0 z-[60] bg-black/40"
                                    onClick={() => setSelectedStepDetail(null)}
                                />
                                <motion.div
                                    {...dialogMotion}
                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
                                    onClick={() => setSelectedStepDetail(null)}
                                >
                                    <div
                                        className="w-full max-w-md rounded-2xl bg-white shadow-xl relative overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                                                    {getIcon(RECIPE_HOFFMANN_STEP_DETAILS[selectedStepDetail].icon)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {RECIPE_HOFFMANN_STEP_DETAILS[selectedStepDetail].title}
                                                    </h3>
                                                    <p className="text-xs text-amber-700 font-medium">
                                                        {RECIPE_HOFFMANN_STEP_DETAILS[selectedStepDetail].technique}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedStepDetail(null)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <span className="text-2xl leading-none">×</span>
                                            </button>
                                        </div>

                                        <div className="px-6 py-5 space-y-4">
                                            <p className="text-gray-700 leading-relaxed">
                                                {RECIPE_HOFFMANN_STEP_DETAILS[selectedStepDetail].description}
                                            </p>

                                            <div className="bg-amber-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-amber-800 mb-2 text-sm">
                                                    ポイント
                                                </h4>
                                                <ul className="space-y-2">
                                                    {RECIPE_HOFFMANN_STEP_DETAILS[selectedStepDetail].tips.map((tip, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
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
                                                onClick={() => setSelectedStepDetail(null)}
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
                </>
            )}
        </AnimatePresence>
    );
};

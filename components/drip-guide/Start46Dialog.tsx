'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { Coffee, Timer, Drop } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import { generateRecipe46, TASTE_LABELS, STRENGTH_LABELS, type Taste46, type Strength46 } from '@/lib/drip-guide/recipe46';
import { getLast46Taste, getLast46Strength, setLast46Taste, setLast46Strength } from '@/lib/localStorage';
import { RECIPE46_DESCRIPTION_SECTIONS } from '@/lib/drip-guide/recipe46Content';

interface Start46DialogProps {
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
                onClose();
            }
        },
        [isOpen, onClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // レシピを生成してプレビュー表示用のデータを作成
    const previewRecipe = useMemo(() => {
        return generateRecipe46(servings, taste, strength);
    }, [servings, taste, strength]);

    const handleStartGuide = () => {
        // 前回の選択を保存
        setLast46Taste(taste);
        setLast46Strength(strength);

        // /drip-guide/run へ遷移
        router.push(`/drip-guide/run?id=recipe-046&servings=${servings}&taste=${taste}&strength=${strength}`);
        onClose();
    };

    const formatTime = (seconds: number): string => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

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
                                        4:6メソッド（粕谷）
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-gray-900">
                                        条件を選択してください
                                    </h3>
                                </div>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                                {/* 4:6メソッドのポイント（解説ボタン） */}
                                <button
                                    type="button"
                                    onClick={() => setIsDescriptionModalOpen(true)}
                                    className="w-full rounded-lg bg-amber-50 border border-amber-100 p-3 text-left hover:bg-amber-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-amber-800">
                                            4:6メソッドのポイント（必読）
                                        </span>
                                        <span className="text-amber-600 text-xs">クリックして開く</span>
                                    </div>
                                </button>

                                {/* 人前選択 */}
                                <div>
                                    <label htmlFor="servings-46" className="block text-sm font-semibold text-gray-900 mb-2">
                                        人前
                                    </label>
                                    <select
                                        id="servings-46"
                                        value={servings}
                                        onChange={(e) => setServings(parseInt(e.target.value, 10))}
                                        className="w-full py-2 px-3 pr-10 rounded-lg text-sm font-medium transition-colors min-h-[44px] bg-white border border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer"
                                        aria-label="人前を選択"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s}>
                                                {s}人前 ({s * 10}g / {s * 150}g)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 味わい選択 */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        味わい
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['basic', 'sweet', 'bright'] as Taste46[]).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setTaste(t)}
                                                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px] ${taste === t
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {TASTE_LABELS[t]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 濃度選択 */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        濃度
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['light', 'strong2', 'strong3'] as Strength46[]).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setStrength(s)}
                                                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px] ${strength === s
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {STRENGTH_LABELS[s]}
                                            </button>
                                        ))}
                                    </div>
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
                                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">タイトル</th>
                                                    <th className="text-right py-2 px-2 font-semibold text-gray-700">注湯量(g)</th>
                                                    <th className="text-right py-2 px-2 font-semibold text-gray-700">累積(g)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewRecipe.steps.map((step, index) => {
                                                    const prevTarget = index > 0 ? previewRecipe.steps[index - 1].targetTotalWater || 0 : 0;
                                                    const currentTarget = step.targetTotalWater || 0;
                                                    const pourAmount = currentTarget - prevTarget;
                                                    return (
                                                        <tr key={step.id} className="border-b border-gray-100">
                                                            <td className="py-2 px-2 text-gray-700 font-mono">
                                                                {formatTime(step.startTimeSec)}
                                                            </td>
                                                            <td className="py-2 px-2 text-gray-700">{step.title}</td>
                                                            <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                                                                {pourAmount}
                                                            </td>
                                                            <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                                                                {currentTarget}
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

                    {/* 4:6メソッドのポイント説明モーダル */}
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
                                                4:6メソッドのポイント
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
                                            {RECIPE46_DESCRIPTION_SECTIONS.map((section, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex gap-4"
                                                >
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                                                        {section.icon === 'target' && <Drop size={20} weight="bold" />}
                                                        {section.icon === 'rule' && <Coffee size={20} weight="bold" />}
                                                        {section.icon === 'timer' && <Timer size={20} weight="bold" />}
                                                        {section.icon === 'thermometer' && <Drop size={20} weight="duotone" />}
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
                </>
            )}
        </AnimatePresence>
    );
};

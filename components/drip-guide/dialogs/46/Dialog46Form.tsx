'use client';

import React from 'react';
import { TASTE_LABELS, STRENGTH_LABELS, type Taste46, type Strength46 } from '@/lib/drip-guide/recipe46';

interface Dialog46FormProps {
    servings: number;
    taste: Taste46;
    strength: Strength46;
    onServingsChange: (servings: number) => void;
    onTasteChange: (taste: Taste46) => void;
    onStrengthChange: (strength: Strength46) => void;
    onDescriptionClick: () => void;
}

export const Dialog46Form: React.FC<Dialog46FormProps> = ({
    servings,
    taste,
    strength,
    onServingsChange,
    onTasteChange,
    onStrengthChange,
    onDescriptionClick,
}) => {
    return (
        <div className="px-5 py-4 space-y-4">
            {/* 4:6メソッドのポイント（解説ボタン） */}
            <button
                type="button"
                onClick={onDescriptionClick}
                className="w-full rounded-lg bg-spot-subtle border border-spot/20 p-3 text-left hover:bg-spot-surface transition-colors"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-spot-hover">
                        4:6メソッドのポイント（必読）
                    </span>
                    <span className="text-spot text-xs">クリックして開く</span>
                </div>
            </button>

            {/* 人前選択 */}
            <div>
                <label htmlFor="servings-46" className="block text-sm font-semibold text-ink mb-2">
                    人前
                </label>
                <select
                    id="servings-46"
                    value={servings}
                    onChange={(e) => onServingsChange(parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 pr-10 rounded-lg text-sm font-medium transition-colors min-h-[44px] bg-field border border-edge text-ink hover:border-edge-strong focus:outline-none focus:ring-2 focus:ring-spot focus:border-spot appearance-none cursor-pointer"
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
                <label className="block text-sm font-semibold text-ink mb-2">味わい</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['basic', 'sweet', 'bright'] as Taste46[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => onTasteChange(t)}
                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                                taste === t
                                    ? 'bg-spot text-white shadow-md'
                                    : 'bg-ground text-ink-sub hover:bg-ground/80'
                            }`}
                        >
                            {TASTE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* 濃度選択 */}
            <div>
                <label className="block text-sm font-semibold text-ink mb-2">濃度</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['light', 'strong2', 'strong3'] as Strength46[]).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onStrengthChange(s)}
                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                                strength === s
                                    ? 'bg-spot text-white shadow-md'
                                    : 'bg-ground text-ink-sub hover:bg-ground/80'
                            }`}
                        >
                            {STRENGTH_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

'use client';

import React from 'react';

interface HoffmannDialogFormProps {
    servings: number;
    onServingsChange: (servings: number) => void;
    onDescriptionClick: () => void;
}

export const HoffmannDialogForm: React.FC<HoffmannDialogFormProps> = ({
    servings,
    onServingsChange,
    onDescriptionClick,
}) => {
    return (
        <div className="px-5 py-4 space-y-4">
            {/* メソッドのポイント（解説ボタン） */}
            <button
                type="button"
                onClick={onDescriptionClick}
                className="w-full rounded-lg bg-spot-subtle border border-spot/20 p-3 text-left hover:bg-spot-surface transition-colors"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-spot-hover">
                        Hoffmann V60のポイント（必読）
                    </span>
                    <span className="text-spot text-xs">クリックして開く</span>
                </div>
            </button>

            {/* 人前選択 */}
            <div>
                <label htmlFor="servings-hoffmann" className="block text-sm font-semibold text-ink mb-2">
                    人前
                </label>
                <select
                    id="servings-hoffmann"
                    value={servings}
                    onChange={(e) => onServingsChange(parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 pr-10 rounded-lg text-sm font-medium transition-colors min-h-[44px] bg-field border border-edge text-ink hover:border-edge-strong focus:outline-none focus:ring-2 focus:ring-spot focus:border-spot appearance-none cursor-pointer"
                    aria-label="人前を選択"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                            {s}人前 ({s * 15}g / {s * 250}g)
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

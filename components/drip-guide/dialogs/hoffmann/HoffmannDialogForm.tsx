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
                    onChange={(e) => onServingsChange(parseInt(e.target.value, 10))}
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
        </div>
    );
};

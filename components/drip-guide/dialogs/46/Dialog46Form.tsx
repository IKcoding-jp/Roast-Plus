'use client';

import React from 'react';
import { TASTE_LABELS, STRENGTH_LABELS, type Taste46, type Strength46 } from '@/lib/drip-guide/recipe46';
import { Button, Select } from '@/components/ui';

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
            <Button
                variant="ghost"
                type="button"
                onClick={onDescriptionClick}
                className="!min-h-0 w-full !rounded-lg bg-spot-subtle border border-spot/20 !p-3 !text-left hover:bg-spot-surface !justify-between"
            >
                <span className="text-sm font-semibold text-spot-hover">
                    4:6メソッドのポイント（必読）
                </span>
                <span className="text-spot text-xs">クリックして開く</span>
            </Button>

            {/* 人前選択 */}
            <Select
                id="servings-46"
                label="人前"
                value={String(servings)}
                onChange={(e) => onServingsChange(parseInt(e.target.value, 10))}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                    value: String(s),
                    label: `${s}人前 (${s * 10}g / ${s * 150}g)`,
                }))}
                className="!text-sm !font-medium !py-2 !px-3 cursor-pointer"
                aria-label="人前を選択"
            />

            {/* 味わい選択 */}
            <div>
                <label className="block text-sm font-semibold text-ink mb-2">味わい</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['basic', 'sweet', 'bright'] as Taste46[]).map((t) => (
                        <Button
                            key={t}
                            variant={taste === t ? 'primary' : 'surface'}
                            size="sm"
                            type="button"
                            onClick={() => onTasteChange(t)}
                            className={`!py-3 !px-4 !text-sm justify-center ${
                                taste === t
                                    ? '!bg-spot !text-white shadow-md'
                                    : '!bg-ground !text-ink-sub hover:!bg-ground/80 !border-0 !shadow-none'
                            }`}
                        >
                            {TASTE_LABELS[t]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 濃度選択 */}
            <div>
                <label className="block text-sm font-semibold text-ink mb-2">濃度</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['light', 'strong2', 'strong3'] as Strength46[]).map((s) => (
                        <Button
                            key={s}
                            variant={strength === s ? 'primary' : 'surface'}
                            size="sm"
                            type="button"
                            onClick={() => onStrengthChange(s)}
                            className={`!py-3 !px-4 !text-sm justify-center ${
                                strength === s
                                    ? '!bg-spot !text-white shadow-md'
                                    : '!bg-ground !text-ink-sub hover:!bg-ground/80 !border-0 !shadow-none'
                            }`}
                        >
                            {STRENGTH_LABELS[s]}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

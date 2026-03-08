'use client';

import React from 'react';
import { Button, Select } from '@/components/ui';

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
            <Button
                variant="ghost"
                type="button"
                onClick={onDescriptionClick}
                className="!min-h-0 w-full !rounded-lg bg-spot-subtle border border-spot/20 !p-3 !text-left hover:bg-spot-surface !justify-between"
            >
                <span className="text-sm font-semibold text-spot-hover">
                    Hoffmann V60のポイント（必読）
                </span>
                <span className="text-spot text-xs">クリックして開く</span>
            </Button>

            {/* 人前選択 */}
            <Select
                id="servings-hoffmann"
                label="人前"
                value={String(servings)}
                onChange={(e) => onServingsChange(parseInt(e.target.value, 10))}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                    value: String(s),
                    label: `${s}人前 (${s * 15}g / ${s * 250}g)`,
                }))}
                className="!text-sm !font-medium !py-2 !px-3 cursor-pointer"
                aria-label="人前を選択"
            />
        </div>
    );
};

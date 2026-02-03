'use client';

import React from 'react';
import { Coffee, Drop, Timer } from 'phosphor-react';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface RecipeSummaryProps {
    beanAmountGram: number;
    totalWaterGram: number;
    totalDurationSec: number;
}

export const RecipeSummary: React.FC<RecipeSummaryProps> = ({
    beanAmountGram,
    totalWaterGram,
    totalDurationSec,
}) => {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <Coffee size={20} className="text-amber-700" />
                    <span className="text-sm text-gray-600">豆量:</span>
                    <span className="text-sm font-semibold text-gray-900">{beanAmountGram}g</span>
                </div>
                <div className="flex items-center gap-2">
                    <Drop size={20} className="text-blue-500" />
                    <span className="text-sm text-gray-600">総湯量:</span>
                    <span className="text-sm font-semibold text-gray-900">{totalWaterGram}g</span>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Timer size={16} />
                <span>
                    総時間: {formatTime(totalDurationSec)} ({Math.floor(totalDurationSec / 60)}分
                    {totalDurationSec % 60}秒)
                </span>
            </div>
        </>
    );
};

'use client';

import React from 'react';
import { DripStep } from '@/lib/drip-guide/types';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface RecipeStepTableProps {
    steps: DripStep[];
    onStepDetailClick?: (stepId: string, stepTitle: string) => void;
    showPourAmount?: boolean;
}

export const RecipeStepTable: React.FC<RecipeStepTableProps> = ({
    steps,
    onStepDetailClick,
    showPourAmount = false,
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">開始時刻</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">
                            {showPourAmount ? 'タイトル' : 'ステップ'}
                        </th>
                        {showPourAmount && (
                            <th className="text-right py-2 px-2 font-semibold text-gray-700">注湯量(g)</th>
                        )}
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">累積(g)</th>
                        {onStepDetailClick && (
                            <th className="text-center py-2 px-2 font-semibold text-gray-700">詳細</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {steps.map((step, index) => {
                        const prevTarget = index > 0 ? steps[index - 1].targetTotalWater || 0 : 0;
                        const currentTarget = step.targetTotalWater || 0;
                        const pourAmount = currentTarget - prevTarget;

                        return (
                            <tr key={step.id} className="border-b border-gray-100">
                                <td className="py-2 px-2 text-gray-700 font-mono">
                                    {formatTime(step.startTimeSec)}
                                </td>
                                <td className="py-2 px-2 text-gray-700">{step.title}</td>
                                {showPourAmount && (
                                    <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                                        {pourAmount}
                                    </td>
                                )}
                                <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                                    {step.targetTotalWater ?? '-'}
                                </td>
                                {onStepDetailClick && (
                                    <td className="py-2 px-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onStepDetailClick(step.id, step.title)}
                                            className="text-amber-600 hover:text-amber-800 text-xs underline"
                                        >
                                            詳細
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

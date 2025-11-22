/**
 * 今日のサイクル数表示コンポーネント
 */

'use client';

interface CycleCounterProps {
    count: number;
}

export function CycleCounter({ count }: CycleCounterProps) {
    return (
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">今日のサイクル数</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#EF8A00] tabular-nums">{count}</span>
                    <span className="text-sm font-bold text-gray-400">セット</span>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { RecordItem } from '../types';
import { HiPlus } from 'react-icons/hi';

type Props = {
    records: RecordItem[];
    onSaveResult: (value: number, type: 'sum' | 'diff') => void;
};

export const StatsPanel = ({ records, onSaveResult }: Props) => {
    const checkedRecords = records.filter(r => r.checked);
    const count = checkedRecords.length;

    if (count === 0) return null;

    const sum = checkedRecords.reduce((acc, r) => acc + r.value, 0);
    let diff: number | null = null;

    if (count === 2) {
        const val1 = checkedRecords[0].value;
        const val2 = checkedRecords[1].value;
        diff = Math.abs(val1 - val2);
    }

    return (
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-sm z-20">
            <div className="w-full space-y-3">
                {/* Sum */}
                <div className="flex items-center justify-between bg-white rounded-xl p-1">
                    <div className="flex items-center gap-2 pl-2">
                        <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">合計</div>
                        <div className="text-xs text-gray-400">{count}件選択中</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-gray-800 tabular-nums">{sum}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSaveResult(sum, 'sum');
                            }}
                            className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg font-bold transition-colors active:scale-95"
                        >
                            <HiPlus className="w-3 h-3" />
                            保存
                        </button>
                    </div>
                </div>

                {/* Diff (Only if 2 items) */}
                {count === 2 && diff !== null && (
                    <div className="flex items-center justify-between bg-orange-50 rounded-xl p-1 border border-orange-100">
                        <div className="flex items-center gap-2 pl-2">
                            <div className="bg-[#EF8A00] text-white text-xs font-bold px-2 py-1 rounded-md">差分</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-[#EF8A00] tabular-nums">{diff}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveResult(diff, 'diff');
                                }}
                                className="flex items-center gap-1 text-xs bg-[#EF8A00] hover:brightness-110 text-white px-3 py-2 rounded-lg font-bold transition-colors active:scale-95"
                            >
                                <HiPlus className="w-3 h-3" />
                                保存
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

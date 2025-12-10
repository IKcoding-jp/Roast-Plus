import React from 'react';
import { RecordItem } from '../types';
type Props = {
    records: RecordItem[];
    onToggleCheck: (id: string) => void;
};

export const RecordList = ({ records, onToggleCheck }: Props) => {
    if (records.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">記録はまだありません</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-40">
            {records.map((record) => (
                <div
                    key={record.id}
                    className={`
            group flex flex-col p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden
            ${record.checked
                            ? 'bg-orange-50 border-orange-200 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }
          `}
                    onClick={() => onToggleCheck(record.id)}
                >
                    <div className="flex items-center w-full">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mr-4">
                            <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${record.checked
                                    ? 'border-[#EF8A00] bg-[#EF8A00]'
                                    : 'border-gray-300 group-hover:border-gray-400'
                                }
              `}>
                                {record.checked && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`font-bold truncate ${record.type === 'sum' ? 'text-[#EF8A00]' :
                                    record.type === 'diff' ? 'text-blue-600' :
                                        'text-gray-700'
                                    }`}>
                                    {record.name}
                                </span>
                                <span className="text-xs text-gray-400 font-mono flex-none ml-2">
                                    {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-800 tabular-nums tracking-tight">
                                    {record.value}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">count</span>
                            </div>
                        </div>
                    </div>

                    {/* Source Records Visualization */}
                    {record.sources && record.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 border-dashed w-full pl-10">
                            <p className="text-[10px] text-gray-400 mb-1">計算元:</p>
                            <div className="flex flex-wrap items-center gap-1">
                                {record.sources.map((source, idx) => (
                                    <React.Fragment key={idx}>
                                        {idx > 0 && (
                                            <span className="text-gray-400 text-[10px] font-bold mx-0.5">
                                                {record.type === 'sum' ? '＋' : '－'}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 border border-gray-200">
                                            {source.name} <span className="ml-1 text-gray-400">({source.value})</span>
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

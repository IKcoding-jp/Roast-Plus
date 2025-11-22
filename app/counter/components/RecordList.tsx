import React from 'react';
import { RecordItem } from '../types';
import { HiTrash } from 'react-icons/hi';

type Props = {
    records: RecordItem[];
    onToggleCheck: (id: string) => void;
    onDelete?: (id: string) => void; // Optional delete functionality might be nice
};

export const RecordList = ({ records, onToggleCheck, onDelete }: Props) => {
    if (records.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">記録はまだありません</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-40"> {/* Extra padding for fixed bottom panel */}
            {records.map((record) => (
                <div
                    key={record.id}
                    className={`
            group flex items-center p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden
            ${record.checked
                            ? 'bg-orange-50 border-orange-200 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }
          `}
                    onClick={() => onToggleCheck(record.id)}
                >
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
                        <div className={`font-bold truncate transition-colors ${record.checked ? 'text-[#EF8A00]' : 'text-gray-800'}`}>
                            {record.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(record.createdAt).toLocaleString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>

                    {/* Value */}
                    <div className="text-xl font-black text-gray-800 ml-4 tabular-nums">
                        {record.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

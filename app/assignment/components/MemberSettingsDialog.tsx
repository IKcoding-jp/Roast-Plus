import React from 'react';
import { Member, TaskLabel } from '../../../types';
import { Button } from '@/components/ui';

type Props = {
    member: Member;
    taskLabels: TaskLabel[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateExclusions: (memberId: string, excludedTaskLabelIds: string[]) => void;
    isChristmasMode?: boolean;
};

export const MemberSettingsDialog: React.FC<Props> = ({
    member,
    taskLabels,
    isOpen,
    onClose,
    onUpdateExclusions,
    isChristmasMode = false,
}) => {
    if (!isOpen) return null;

    const handleToggle = (taskLabelId: string) => {
        const current = member.excludedTaskLabelIds || [];
        const next = current.includes(taskLabelId)
            ? current.filter(id => id !== taskLabelId)
            : [...current, taskLabelId];
        onUpdateExclusions(member.id, next);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`rounded-xl shadow-2xl w-full max-w-md overflow-hidden ${
                isChristmasMode ? 'bg-[#1a1a1a] border border-[#d4af37]/30' : 'bg-white'
            }`}>
                <div className={`px-6 py-4 flex justify-between items-center ${
                    isChristmasMode ? 'bg-[#6d1a1a]' : 'bg-primary'
                }`}>
                    <h3 className={`font-bold text-lg ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-white'}`}>
                        {member.name} さんの設定
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        isChristmasMode={isChristmasMode}
                        className="!p-1 !min-h-0 !text-white hover:!text-gray-200"
                    >
                        ×
                    </Button>
                </div>

                <div className="p-6">
                    <p className={`mb-4 text-sm ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
                        このメンバーが担当できない（または担当させたくない）作業にチェックを入れてください。
                        次回のシャッフルから除外されます。
                    </p>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {taskLabels.map(task => {
                            const isExcluded = member.excludedTaskLabelIds?.includes(task.id);
                            return (
                                <label key={task.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                    isChristmasMode
                                        ? 'border-[#d4af37]/20 hover:bg-white/5'
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={isExcluded}
                                        onChange={() => handleToggle(task.id)}
                                        className={`w-5 h-5 rounded focus:ring-2 ${
                                            isChristmasMode
                                                ? 'text-[#d4af37] border-[#d4af37]/40 focus:ring-[#d4af37]/20 bg-white/10'
                                                : 'text-primary border-gray-300 focus:ring-primary'
                                        }`}
                                    />
                                    <span className={`ml-3 font-medium ${
                                        isExcluded
                                            ? 'text-red-500'
                                            : isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
                                    }`}>
                                        {task.leftLabel} {task.rightLabel || ''}
                                    </span>
                                    {isExcluded && <span className="ml-auto text-xs text-red-500 font-bold">除外中</span>}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className={`p-4 flex justify-end ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        isChristmasMode={isChristmasMode}
                    >
                        閉じる
                    </Button>
                </div>
            </div>
        </div>
    );
};

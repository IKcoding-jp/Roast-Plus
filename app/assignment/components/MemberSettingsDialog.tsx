import React from 'react';
import { Member, TaskLabel } from '../../../types';

type Props = {
    member: Member;
    taskLabels: TaskLabel[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateExclusions: (memberId: string, excludedTaskLabelIds: string[]) => void;
};

export const MemberSettingsDialog: React.FC<Props> = ({
    member,
    taskLabels,
    isOpen,
    onClose,
    onUpdateExclusions,
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-primary px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">{member.name} さんの設定</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">
                        このメンバーが担当できない（または担当させたくない）作業にチェックを入れてください。
                        次回のシャッフルから除外されます。
                    </p>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {taskLabels.map(task => {
                            const isExcluded = member.excludedTaskLabelIds?.includes(task.id);
                            return (
                                <label key={task.id} className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isExcluded}
                                        onChange={() => handleToggle(task.id)}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className={`ml-3 font-medium ${isExcluded ? 'text-red-500' : 'text-gray-700'}`}>
                                        {task.leftLabel} {task.rightLabel || ''}
                                    </span>
                                    {isExcluded && <span className="ml-auto text-xs text-red-500 font-bold">除外中</span>}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Team, TaskLabel, Assignment, Member } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
    teams: Team[];
    taskLabels: TaskLabel[];
    assignments: Assignment[];
    members: Member[];
    onSwap: (assignment1: Assignment, assignment2: Assignment) => void;
    onUpdateMember: (assignment: Assignment, memberId: string | null) => void;
    onMemberClick: (member: Member) => void; // 設定ダイアログ用
};

export const AssignmentTable: React.FC<Props> = ({
    teams,
    taskLabels,
    assignments,
    members,
    onSwap,
    onUpdateMember,
    onMemberClick,
}) => {
    const [selectedCell, setSelectedCell] = useState<{ teamId: string; taskLabelId: string } | null>(null);
    const [showMenu, setShowMenu] = useState<{ teamId: string; taskLabelId: string } | null>(null);

    const getAssignment = (teamId: string, taskLabelId: string) => {
        return assignments.find(a => a.teamId === teamId && a.taskLabelId === taskLabelId);
    };

    const getMember = (memberId: string | null) => {
        return members.find(m => m.id === memberId);
    };

    const handleCellClick = (teamId: string, taskLabelId: string) => {
        if (showMenu) {
            setShowMenu(null);
            return;
        }

        if (!selectedCell) {
            setSelectedCell({ teamId, taskLabelId });
        } else {
            // 同じセルをタップ -> 選択解除
            if (selectedCell.teamId === teamId && selectedCell.taskLabelId === taskLabelId) {
                setSelectedCell(null);
                // ここでメニューを開くロジックにしてもいいが、要件では「長押し」推奨
                // 今回はシンプルに「選択中に再度タップでメニュー」にするか、長押し実装するか。
                // 要件: "セルを長押し or メニューアイコンから"
                // 実装簡易化のため、選択状態で再度タップ -> メニュー表示 にする
                setShowMenu({ teamId, taskLabelId });
            } else if (selectedCell.teamId === teamId) {
                // 同じチームの別セル -> スワップ
                const asg1 = getAssignment(selectedCell.teamId, selectedCell.taskLabelId);
                const asg2 = getAssignment(teamId, taskLabelId);

                // Assignmentが存在しない場合は仮想的に作成して渡す
                const safeAsg1 = asg1 || { teamId: selectedCell.teamId, taskLabelId: selectedCell.taskLabelId, memberId: null };
                const safeAsg2 = asg2 || { teamId, taskLabelId, memberId: null };

                onSwap(safeAsg1, safeAsg2);
                setSelectedCell(null);
            } else {
                // 違うチーム -> 選択解除
                setSelectedCell(null);
            }
        }
    };

    return (
        <div className="overflow-x-auto pb-20">
            <table className="w-full border-collapse text-sm md:text-base">
                <thead>
                    <tr>
                        <th className="p-2 border-b-2 border-gray-200 bg-gray-50 text-left text-gray-500 font-semibold">
                            {/* 左上空欄 */}
                        </th>
                        {teams.map(team => (
                            <th key={team.id} className="p-2 border-b-2 border-gray-200 bg-gray-50 text-center text-gray-700 font-bold min-w-[100px]">
                                {team.name}班
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {taskLabels.map(task => (
                        <tr key={task.id} className="border-b border-gray-100">
                            <th className="p-3 text-left text-gray-700 font-medium bg-gray-50 sticky left-0 z-10 shadow-sm md:shadow-none">
                                {task.name}
                            </th>
                            {teams.map(team => {
                                const assignment = getAssignment(team.id, task.id);
                                const member = getMember(assignment?.memberId || null);
                                const isSelected = selectedCell?.teamId === team.id && selectedCell?.taskLabelId === task.id;
                                const isMenuOpen = showMenu?.teamId === team.id && showMenu?.taskLabelId === task.id;

                                return (
                                    <td key={team.id} className="p-1 relative">
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleCellClick(team.id, task.id)}
                                            className={`
                        relative h-14 md:h-16 rounded-lg flex items-center justify-center cursor-pointer transition-colors border-2
                        ${isSelected ? 'border-primary bg-orange-50' : 'border-transparent bg-white hover:bg-gray-50'}
                        ${!member ? 'text-gray-300' : 'text-gray-800 font-bold'}
                        shadow-sm
                      `}
                                        >
                                            {member ? member.name : '未割当'}

                                            {/* メンバー設定ボタン (名前の横に小さく、あるいは長押し代わりのUI) */}
                                            {member && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMemberClick(member);
                                                    }}
                                                    className="absolute top-1 right-1 text-xs text-gray-400 hover:text-primary p-1"
                                                >
                                                    ⚙️
                                                </button>
                                            )}
                                        </motion.div>

                                        {/* 簡易メニュー (メンバー変更用) */}
                                        <AnimatePresence>
                                            {isMenuOpen && (
                                                <div className="absolute top-full left-0 z-20 bg-white shadow-xl rounded-lg p-2 w-48 border border-gray-100">
                                                    <div className="text-xs text-gray-500 mb-2">メンバー変更</div>
                                                    <div className="max-h-40 overflow-y-auto">
                                                        <button
                                                            onClick={() => {
                                                                onUpdateMember({ teamId: team.id, taskLabelId: task.id, memberId: null } as Assignment, null);
                                                                setShowMenu(null);
                                                                setSelectedCell(null);
                                                            }}
                                                            className="w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500 text-sm"
                                                        >
                                                            未割り当てにする
                                                        </button>
                                                        {members.filter(m => !m.isManager).map(m => (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => {
                                                                    onUpdateMember({ teamId: team.id, taskLabelId: task.id, memberId: null } as Assignment, m.id);
                                                                    setShowMenu(null);
                                                                    setSelectedCell(null);
                                                                }}
                                                                className="w-full text-left px-2 py-1 hover:bg-gray-100 text-gray-700 text-sm"
                                                            >
                                                                {m.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

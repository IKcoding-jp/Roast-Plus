import React from 'react';
import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';
import { MdDelete, MdCheck } from 'react-icons/md';
import { DEFAULT_TABLE_SETTINGS } from './types';
import { Button, Input } from '@/components/ui';

type MobileListViewProps = {
    teams: Team[];
    taskLabels: TaskLabel[];
    assignments: Assignment[];
    members: Member[];
    tableSettings: TableSettings | null;
    selectedCell: { teamId: string; taskLabelId: string } | null;
    editingLabelId: string | null;
    editLeftLabel: string;
    setEditLeftLabel: (v: string) => void;
    editRightLabel: string;
    setEditRightLabel: (v: string) => void;
    startEditLabel: (label: TaskLabel) => void;
    saveLabel: (labelId: string) => Promise<void>;
    handleDeleteTaskLabel: (id: string) => Promise<void>;
    handleCellTouchStart: (teamId: string, taskLabelId: string, memberId: string | null, e: React.TouchEvent | React.MouseEvent) => void;
    handleCellTouchEnd: () => void;
    handleCellTouchMove: (e: React.TouchEvent | React.MouseEvent) => void;
    handleCellClick: (teamId: string, taskLabelId: string) => void;
};

export const MobileListView: React.FC<MobileListViewProps> = ({
    teams,
    taskLabels,
    assignments,
    members,
    tableSettings,
    selectedCell,
    editingLabelId,
    editLeftLabel,
    setEditLeftLabel,
    editRightLabel,
    setEditRightLabel,
    startEditLabel,
    saveLabel,
    handleDeleteTaskLabel,
    handleCellTouchStart,
    handleCellTouchEnd,
    handleCellTouchMove,
    handleCellClick,
}) => {
    const headerLabels = tableSettings?.headerLabels ?? DEFAULT_TABLE_SETTINGS.headerLabels;
    const formatTeamTitle = (teamName?: string) => {
        return teamName && teamName.trim().length > 0 ? `${teamName.trim()}班` : '';
    };

    return (
        <div className="md:hidden w-full space-y-4 px-2">
            {taskLabels.map(label => {
                const isEditing = editingLabelId === label.id;

                return (
                    <div key={label.id} className="rounded-xl shadow-sm p-4 flex flex-col gap-3 bg-surface border border-edge">
                        {/* Header: Label Names */}
                        <div className="flex justify-between items-start pb-2 min-h-[40px] border-b border-edge">
                            {isEditing ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <Input
                                        value={editLeftLabel}
                                        onChange={e => setEditLeftLabel(e.target.value)}
                                        placeholder={headerLabels.left}
                                        className="!p-2 !text-lg !font-bold !min-h-0"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            value={editRightLabel}
                                            onChange={e => setEditRightLabel(e.target.value)}
                                            placeholder={headerLabels.right}
                                            className="flex-1 !p-2 !text-sm !min-h-0"
                                        />
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => saveLabel(label.id)}
                                            className="!p-2 !min-h-0 shrink-0"
                                        >
                                            <MdCheck size={20} />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeleteTaskLabel(label.id)}
                                            className="!p-2 !min-h-0 shrink-0"
                                        >
                                            <MdDelete size={20} />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 w-full flex-wrap">
                                    <div
                                        className="text-sm px-2 py-1 rounded cursor-pointer font-bold text-ink bg-ground border border-edge"
                                        onClick={() => startEditLabel(label)}
                                    >
                                        {label.leftLabel}
                                    </div>
                                    {label.rightLabel && (
                                        <div
                                            className="text-sm px-2 py-1 rounded cursor-pointer font-bold text-ink bg-ground border border-edge"
                                            onClick={() => startEditLabel(label)}
                                        >
                                            {label.rightLabel}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Teams Grid */}
                        {teams.length === 0 ? (
                            <div className="text-center py-4 rounded-lg text-sm bg-ground text-ink-muted">
                                班を作成してください
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {teams.map(team => {
                                    const assignment = assignments.find(a => a.teamId === team.id && a.taskLabelId === label.id);
                                    const member = members.find(m => m.id === assignment?.memberId);
                                    const isSelected = selectedCell?.teamId === team.id && selectedCell?.taskLabelId === label.id;

                                    return (
                                        <div key={team.id} className="flex flex-col gap-1">
                                            <div className="text-[10px] font-bold px-1 text-ink-muted">{formatTeamTitle(team.name)}</div>
                                            <button
                                                onMouseDown={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                onMouseUp={handleCellTouchEnd}
                                                onMouseMove={handleCellTouchMove}
                                                onMouseLeave={handleCellTouchEnd}
                                                onTouchStart={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                onTouchEnd={handleCellTouchEnd}
                                                onTouchMove={handleCellTouchMove}
                                                onClick={() => handleCellClick(team.id, label.id)}
                                                className={`
                                                    w-full py-3 px-2 rounded-lg text-sm font-bold text-center transition-all truncate select-none
                                                    ${member
                                                        ? isSelected
                                                            ? 'bg-primary text-white shadow-md scale-105'
                                                            : 'text-gray-800 bg-gray-50 border border-gray-200 shadow-sm'
                                                        : isSelected
                                                            ? 'bg-primary/20 text-primary border border-primary'
                                                            : 'text-gray-400 bg-gray-50 border border-dashed border-gray-300'}
                                                `}
                                            >
                                                {member ? member.name : '未割当'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

import React from 'react';
import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';
import { MdAdd } from 'react-icons/md';
import { PiShuffleBold } from 'react-icons/pi';
import { DEFAULT_TABLE_SETTINGS, WidthConfig, HeightConfig } from './types';
import { Button, Input, InlineInput, IconButton, Card } from '@/components/ui';

type DesktopTableViewProps = {
    teams: Team[];
    taskLabels: TaskLabel[];
    assignments: Assignment[];
    members: Member[];
    tableSettings: TableSettings | null;
    selectedCell: { teamId: string; taskLabelId: string } | null;
    // チーム関連
    isAddingTeam: boolean;
    setIsAddingTeam: (v: boolean) => void;
    newTeamName: string;
    setNewTeamName: (v: string) => void;
    handleAddTeam: () => Promise<void>;
    editingTeamId: string | null;
    editTeamName: string;
    setEditTeamName: (v: string) => void;
    handleUpdateTeam: (teamId: string) => Promise<void>;
    setActiveTeamActionId: (id: string | null) => void;
    setActiveTeamName: (name: string) => void;
    // ラベル関連
    newLeftLabel: string;
    setNewLeftLabel: (v: string) => void;
    newRightLabel: string;
    setNewRightLabel: (v: string) => void;
    handleAddTaskLabel: () => Promise<void>;
    // 設定
    setWidthConfig: (config: WidthConfig | null) => void;
    setHeightConfig: (config: HeightConfig | null) => void;
    // イベント
    handleCellTouchStart: (teamId: string, taskLabelId: string, memberId: string | null, e: React.TouchEvent | React.MouseEvent) => void;
    handleCellTouchEnd: () => void;
    handleCellTouchMove: (e: React.TouchEvent | React.MouseEvent) => void;
    handleCellClick: (teamId: string, taskLabelId: string) => void;
    onShuffle: () => Promise<void>;
    isShuffleDisabled: boolean;
};

export const DesktopTableView: React.FC<DesktopTableViewProps> = ({
    teams,
    taskLabels,
    assignments,
    members,
    tableSettings,
    selectedCell,
    isAddingTeam,
    setIsAddingTeam,
    newTeamName,
    setNewTeamName,
    handleAddTeam,
    editingTeamId,
    editTeamName,
    setEditTeamName,
    handleUpdateTeam,
    setActiveTeamActionId,
    setActiveTeamName,
    newLeftLabel,
    setNewLeftLabel,
    newRightLabel,
    setNewRightLabel,
    handleAddTaskLabel,
    setWidthConfig,
    setHeightConfig,
    handleCellTouchStart,
    handleCellTouchEnd,
    handleCellTouchMove,
    handleCellClick,
    onShuffle,
    isShuffleDisabled,
}) => {
    const headerLabels = tableSettings?.headerLabels ?? DEFAULT_TABLE_SETTINGS.headerLabels;
    const formatTeamTitle = (teamName?: string) => {
        return teamName && teamName.trim().length > 0 ? `${teamName.trim()}班` : '';
    };

    const generateGridTemplateColumns = () => {
        const defaultWidth = 140;
        const labelWidth = tableSettings?.colWidths?.taskLabel ?? 160;
        const noteWidth = tableSettings?.colWidths?.note ?? 160;

        if (teams.length === 0) {
            return `${labelWidth}px 160px ${noteWidth}px`;
        }

        const teamColumns = teams.map(team => {
            const w = tableSettings?.colWidths?.teams?.[team.id] ?? defaultWidth;
            return `${w}px`;
        }).join(' ');

        return `${labelWidth}px ${teamColumns} ${noteWidth}px`;
    };

    const gridTemplateColumns = generateGridTemplateColumns();

    return (
        <Card variant="table" className="hidden md:block w-fit mx-auto max-w-full overflow-x-auto relative">
            {/* ヘッダー */}
            <div
                className="grid border-b md:text-base font-semibold text-white sticky top-0 z-20 bg-dark border-gray-700"
                style={{ gridTemplateColumns, minWidth: 'max-content' }}
            >
                <div
                    className="py-2 px-2 sm:px-3 border-r flex items-center justify-center cursor-pointer transition-colors bg-dark border-gray-700 hover:bg-gray-800"
                    onClick={() => setWidthConfig({
                        type: 'taskLabel',
                        currentWidth: tableSettings?.colWidths?.taskLabel ?? 160,
                        label: `${headerLabels.left}列の幅`,
                        currentTitle: headerLabels.left
                    })}
                    title="クリックして幅を変更"
                >
                    {headerLabels.left}
                </div>

                {/* チーム列 */}
                {teams.length === 0 ? (
                    <div className="py-2 px-2 border-r text-center flex flex-col items-center justify-center h-full min-h-[44px] bg-dark border-gray-700">
                        {isAddingTeam ? (
                            <div className="relative z-20 flex items-center shadow-lg rounded p-1 w-32 md:w-40 bg-surface border border-spot">
                                <InlineInput
                                    placeholder="班名(任意)"
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddTeam();
                                        if (e.key === 'Escape') setIsAddingTeam(false);
                                    }}
                                    variant="dark"
                                    className="!border-none !px-1 md:!p-2 md:!text-base !text-sm"
                                />
                                <IconButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAddTeam}
                                >
                                    <MdAdd size={20} className="md:w-6 md:h-6" />
                                </IconButton>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingTeam(true)}
                                className="!text-sm md:!text-base !gap-1 !bg-transparent"
                            >
                                <MdAdd className="md:w-5 md:h-5" /> 最初の班を追加
                            </Button>
                        )}
                    </div>
                ) : (
                    teams.map(team => (
                        <div
                            key={team.id}
                            className="py-2 px-2 border-r text-center relative group flex items-center justify-center bg-dark border-gray-700"
                        >
                            {editingTeamId === team.id ? (
                                <InlineInput
                                    value={editTeamName}
                                    onChange={e => setEditTeamName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleUpdateTeam(team.id)}
                                    onBlur={() => handleUpdateTeam(team.id)}
                                    variant="light"
                                    className="!text-sm md:!text-base"
                                />
                            ) : (
                                <div
                                    className="cursor-pointer rounded px-2 py-1 truncate w-full select-none hover:bg-gray-800 active:bg-gray-700"
                                    onClick={() => {
                                        setActiveTeamActionId(team.id);
                                        setActiveTeamName(team.name);
                                    }}
                                >
                                    {formatTeamTitle(team.name)}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* チーム追加 & 補足ヘッダー */}
                <div
                    className="py-2 px-2 sm:px-3 text-center flex items-center justify-between relative cursor-pointer transition-colors bg-dark hover:bg-gray-800"
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, input')) return;
                        setWidthConfig({
                            type: 'note',
                            currentWidth: tableSettings?.colWidths?.note ?? 160,
                            label: `${headerLabels.right}列の幅`,
                            currentTitle: headerLabels.right
                        });
                    }}
                    title="クリックして幅を変更"
                >
                    <div className="relative">
                        {teams.length > 0 && (
                            isAddingTeam ? (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAddingTeam(false);
                                        }}
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 flex items-center shadow-lg rounded p-1 w-32 md:w-40 bg-surface border border-spot">
                                        <InlineInput
                                            placeholder="班名(任意)"
                                            value={newTeamName}
                                            onChange={e => setNewTeamName(e.target.value)}
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleAddTeam();
                                                if (e.key === 'Escape') setIsAddingTeam(false);
                                            }}
                                            variant="dark"
                                            className="!border-none !px-1 md:!p-2 !text-sm md:!text-base"
                                        />
                                        <IconButton
                                            variant="primary"
                                            size="sm"
                                            onClick={handleAddTeam}
                                        >
                                            <MdAdd size={20} className="md:w-6 md:h-6" />
                                        </IconButton>
                                    </div>
                                </>
                            ) : (
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    rounded
                                    onClick={() => setIsAddingTeam(true)}
                                    className="!bg-gray-700 !text-gray-300 hover:!bg-primary hover:!text-white"
                                    title="班を追加"
                                >
                                    <MdAdd size={16} className="md:w-5 md:h-5" />
                                </IconButton>
                            )
                        )}
                    </div>
                    <span>{headerLabels.right}</span>
                    <span className="w-4"></span>
                </div>
            </div>

            {/* ボディ */}
            <div className="divide-y divide-edge bg-surface" style={{ minWidth: 'max-content' }}>
                {taskLabels.map(label => (
                    <div
                        key={label.id}
                        className="grid items-center transition-colors group hover:bg-spot-subtle/30"
                        style={{
                            gridTemplateColumns,
                            minHeight: `${tableSettings?.rowHeights?.[label.id] ?? 60}px`
                        }}
                    >
                        {/* 左ラベル列 */}
                        <div className="p-3 md:p-4 py-2 border-r h-full flex items-center justify-center border-edge">
                            <div
                                className="w-full p-1 cursor-pointer font-medium text-sm md:text-base whitespace-nowrap text-center rounded transition-colors overflow-visible text-ink hover:bg-ground"
                                onClick={() => {
                                    setHeightConfig({
                                        taskLabelId: label.id,
                                        currentHeight: tableSettings?.rowHeights?.[label.id] ?? 60,
                                        label: `${headerLabels.left}の設定`,
                                        currentName: label.leftLabel,
                                        editMode: 'left',
                                        currentRightLabel: label.rightLabel || ''
                                    });
                                }}
                            >
                                {label.leftLabel}
                            </div>
                        </div>

                        {/* 各チームの担当者列 */}
                        {teams.length === 0 ? (
                            <div className="p-2 md:p-4 border-r h-full flex items-center justify-center border-edge bg-ground/30">
                                <span className="text-xs md:text-sm text-ink-muted">班を作成してください</span>
                            </div>
                        ) : (
                            teams.map(team => {
                                const assignment = assignments.find(a => a.teamId === team.id && a.taskLabelId === label.id);
                                const member = members.find(m => m.id === assignment?.memberId);
                                const isSelected = selectedCell?.teamId === team.id && selectedCell?.taskLabelId === label.id;

                                return (
                                    <div key={team.id} className="p-2 md:p-4 py-2 border-r h-full flex items-center justify-center relative border-edge">
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
                                                w-full py-2 md:py-3 px-1 rounded-lg text-sm md:text-base font-bold text-center transition-all truncate select-none
                                                ${member
                                                    ? isSelected
                                                        ? 'bg-primary text-white shadow-md scale-105'
                                                        : 'text-ink bg-surface border border-edge shadow-sm hover:shadow'
                                                    : isSelected
                                                        ? 'bg-spot/20 text-spot border border-spot'
                                                        : 'text-ink-muted bg-ground border border-dashed border-edge-strong hover:bg-ground/80'}
                                            `}
                                        >
                                            {member ? member.name : '未割当'}
                                        </button>
                                    </div>
                                );
                            })
                        )}

                        {/* 右ラベル列 */}
                        <div className="p-3 md:p-4 py-2 h-full flex items-center relative">
                            <div
                                className="w-full p-1 cursor-pointer font-medium text-sm md:text-base whitespace-nowrap text-center rounded transition-colors overflow-visible text-ink hover:bg-ground"
                                onClick={() => {
                                    setHeightConfig({
                                        taskLabelId: label.id,
                                        currentHeight: tableSettings?.rowHeights?.[label.id] ?? 60,
                                        label: `${headerLabels.right}の設定`,
                                        currentName: label.rightLabel || '',
                                        editMode: 'right',
                                        currentRightLabel: label.leftLabel
                                    });
                                }}
                            >
                                {label.rightLabel}
                            </div>
                        </div>
                    </div>
                ))}

                {/* 新規ラベル追加行 */}
                <div
                    className="grid items-center p-2 py-2 border-t min-h-[60px] bg-ground border-edge"
                    style={{ gridTemplateColumns }}
                >
                    <div className="pr-2">
                        <Input
                            value={newLeftLabel}
                            onChange={e => setNewLeftLabel(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTaskLabel();
                            }}
                            className="!p-2 !text-sm !min-h-0"
                        />
                    </div>

                    {/* シャッフルボタン（中央配置） */}
                    <div className="col-span-full px-2 flex items-center justify-center" style={{ gridColumn: `2 / span ${Math.max(1, teams.length)}` }}>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onShuffle}
                            disabled={isShuffleDisabled}
                            className="!rounded-full !px-4 shadow-md active:scale-95"
                        >
                            <PiShuffleBold className="w-5 h-5" />
                            <span className="font-medium text-sm">シャッフル</span>
                        </Button>
                    </div>

                    <div className="pl-2 flex gap-2 w-full h-full" style={{ gridColumn: '-2 / -1' }}>
                        <Input
                            value={newRightLabel}
                            onChange={e => setNewRightLabel(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTaskLabel();
                            }}
                            className="!min-w-0 !p-2 !text-right !text-sm !min-h-0"
                        />
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddTaskLabel}
                            disabled={!newLeftLabel.trim()}
                            className="!px-2 !py-1 !min-h-0 !h-full max-h-[38px] flex-shrink-0"
                        >
                            <MdAdd size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

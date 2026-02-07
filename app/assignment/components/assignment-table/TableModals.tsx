import React from 'react';
import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdDelete, MdPersonOff, MdBlock, MdPerson, MdClose, MdCheck, MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { DEFAULT_TABLE_SETTINGS, WidthConfig, HeightConfig } from './types';
import { Button, Input, IconButton, NumberInput } from '@/components/ui';

type TableModalsProps = {
    teams: Team[];
    taskLabels: TaskLabel[];
    assignments: Assignment[];
    members: Member[];
    tableSettings: TableSettings | null;
    // コンテキストメニュー
    contextMenu: { teamId: string; taskLabelId: string; memberId: string | null } | null;
    setContextMenu: (menu: { teamId: string; taskLabelId: string; memberId: string | null } | null) => void;
    editingMemberName: string;
    setEditingMemberName: (v: string) => void;
    isExclusionSettingsOpen: boolean;
    setIsExclusionSettingsOpen: (v: boolean) => void;
    // メンバー選択
    showMemberMenu: { taskLabelId: string; teamId: string } | null;
    setShowMemberMenu: (v: { taskLabelId: string; teamId: string } | null) => void;
    newMemberName: string;
    setNewMemberName: (v: string) => void;
    handleAddMember: (taskLabelId: string, teamId: string) => Promise<void>;
    // チームアクション
    activeTeamActionId: string | null;
    setActiveTeamActionId: (id: string | null) => void;
    activeTeamName: string;
    setActiveTeamName: (v: string) => void;
    handleUpdateTeamFromModal: () => Promise<void>;
    handleDeleteTeamFromModal: () => Promise<void>;
    // 幅設定
    widthConfig: WidthConfig | null;
    setWidthConfig: (config: WidthConfig | null) => void;
    handleSaveWidth: (width: number, headerName?: string) => Promise<void>;
    // 高さ設定
    heightConfig: HeightConfig | null;
    setHeightConfig: (config: HeightConfig | null) => void;
    handleSaveRowConfig: (height: number, name: string) => Promise<void>;
    // コールバック
    onUpdateMember: (assignment: Assignment, memberId: string | null) => Promise<void>;
    onUpdateMemberName: (memberId: string, name: string) => Promise<void>;
    onUpdateMemberExclusion: (memberId: string, taskLabelId: string, isExcluded: boolean) => Promise<void>;
    onDeleteMember: (memberId: string) => Promise<void>;
    onDeleteTaskLabel: (taskLabelId: string) => Promise<void>;
    onUpdateTableSettings: (settings: TableSettings) => Promise<void>;
};

export const TableModals: React.FC<TableModalsProps> = ({
    teams,
    taskLabels,
    assignments,
    members,
    tableSettings,
    contextMenu,
    setContextMenu,
    editingMemberName,
    setEditingMemberName,
    isExclusionSettingsOpen,
    setIsExclusionSettingsOpen,
    showMemberMenu,
    setShowMemberMenu,
    newMemberName,
    setNewMemberName,
    handleAddMember,
    activeTeamActionId,
    setActiveTeamActionId,
    activeTeamName,
    setActiveTeamName,
    handleUpdateTeamFromModal,
    handleDeleteTeamFromModal,
    widthConfig,
    setWidthConfig,
    handleSaveWidth,
    heightConfig,
    setHeightConfig,
    handleSaveRowConfig,
    onUpdateMember,
    onUpdateMemberName,
    onUpdateMemberExclusion,
    onDeleteMember,
    onDeleteTaskLabel,
    onUpdateTableSettings,
}) => {
    const headerLabels = tableSettings?.headerLabels ?? DEFAULT_TABLE_SETTINGS.headerLabels;
    const formatTeamTitle = (teamName?: string) => {
        return teamName && teamName.trim().length > 0 ? `${teamName.trim()}班` : '';
    };

    return (
        <>
            {/* コンテキストメニューモーダル */}
            <AnimatePresence>
                {contextMenu && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setContextMenu(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="rounded-xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden bg-surface border border-edge"
                        >
                            <div className="px-4 py-3 flex items-center justify-between bg-ground border-b border-edge">
                                <h3 className="font-bold text-ink">
                                    {(() => {
                                        const team = teams.find(t => t.id === contextMenu.teamId);
                                        const title = formatTeamTitle(team?.name);
                                        const label = taskLabels.find(l => l.id === contextMenu.taskLabelId)?.leftLabel ?? '';
                                        return title ? `${title} - ${label}` : label;
                                    })()}
                                </h3>
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setContextMenu(null)}
                                >
                                    <MdClose size={20} />
                                </IconButton>
                            </div>

                            <div className="p-4 space-y-4">
                                {contextMenu.memberId ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink-sub">
                                            メンバー名
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingMemberName}
                                                onChange={(e) => setEditingMemberName(e.target.value)}
                                                className="flex-1 !py-2"
                                            />
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={async () => {
                                                    if (contextMenu.memberId && editingMemberName.trim()) {
                                                        await onUpdateMemberName(contextMenu.memberId, editingMemberName);
                                                        setContextMenu(null);
                                                    }
                                                }}
                                                disabled={!editingMemberName.trim()}
                                                className="!px-3"
                                            >
                                                <MdCheck size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-2 text-ink-muted">
                                        メンバーが割り当てられていません
                                    </div>
                                )}

                                <div className="pt-4 grid gap-2 border-t border-edge">
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        onClick={() => {
                                            setShowMemberMenu({ taskLabelId: contextMenu.taskLabelId, teamId: contextMenu.teamId });
                                            setContextMenu(null);
                                        }}
                                        className="!justify-start !gap-3 !p-3 !bg-ground hover:!bg-ground/80"
                                    >
                                        <MdPerson size={20} />
                                        <span className="text-sm font-bold">メンバーを変更・追加</span>
                                    </Button>

                                    {contextMenu.memberId && (
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={async () => {
                                                await onUpdateMember({ teamId: contextMenu.teamId, taskLabelId: contextMenu.taskLabelId, memberId: null, assignedDate: '' }, null);
                                                setContextMenu(null);
                                            }}
                                            className="!justify-start !gap-3 !p-3 !bg-ground hover:!bg-red-50 !text-red-600"
                                        >
                                            <MdPersonOff size={20} />
                                            <span className="text-sm font-bold">未割り当てにする</span>
                                        </Button>
                                    )}

                                    {contextMenu.memberId && (
                                        <div className="rounded-lg overflow-hidden mt-2 border border-edge">
                                            <Button
                                                variant="ghost"
                                                size="md"
                                                onClick={() => setIsExclusionSettingsOpen(!isExclusionSettingsOpen)}
                                                className="!w-full !justify-between !gap-3 !p-3 !rounded-none !bg-ground hover:!bg-ground/80"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <MdBlock size={20} className="text-ink-muted" />
                                                    <span className="text-sm font-bold">除外ラベル設定</span>
                                                </div>
                                                {isExclusionSettingsOpen ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
                                            </Button>

                                            <AnimatePresence>
                                                {isExclusionSettingsOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-surface"
                                                    >
                                                        <div className="p-2 border-t border-edge">
                                                            <div className="text-xs mb-2 px-1 text-ink-muted">
                                                                チェックした作業には割り当てられません
                                                            </div>
                                                            <div className="max-h-40 overflow-y-auto space-y-1">
                                                                {taskLabels.map(label => {
                                                                    const member = members.find(m => m.id === contextMenu.memberId);
                                                                    const isExcluded = member?.excludedTaskLabelIds.includes(label.id) || false;

                                                                    return (
                                                                        <label
                                                                            key={label.id}
                                                                            className={`
                                                                                flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
                                                                                ${isExcluded
                                                                                    ? 'bg-red-50'
                                                                                    : 'hover:bg-ground'
                                                                                }
                                                                            `}
                                                                        >
                                                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isExcluded}
                                                                                    onChange={async (e) => {
                                                                                        if (contextMenu.memberId) {
                                                                                            await onUpdateMemberExclusion(contextMenu.memberId, label.id, e.target.checked);
                                                                                        }
                                                                                    }}
                                                                                    className="appearance-none w-5 h-5 border rounded checked:bg-red-500 checked:border-red-500 transition-colors cursor-pointer border-edge-strong focus:ring-2 focus:ring-red-200"
                                                                                />
                                                                                {isExcluded && (
                                                                                    <MdClose className="absolute text-white pointer-events-none" size={14} />
                                                                                )}
                                                                            </div>
                                                                            <div className="text-sm flex-1 truncate">
                                                                                <span className={
                                                                                    isExcluded
                                                                                        ? 'text-red-700 font-medium'
                                                                                        : 'text-ink'
                                                                                }>
                                                                                    {label.leftLabel}
                                                                                </span>
                                                                                {label.rightLabel && (
                                                                                    <span className={`ml-1 text-xs ${
                                                                                        isExcluded
                                                                                            ? 'text-red-500'
                                                                                            : 'text-ink-muted'
                                                                                    }`}>
                                                                                        ({label.rightLabel})
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 既存のメンバー選択メニュー */}
            <AnimatePresence>
                {showMemberMenu && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowMemberMenu(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="rounded-lg shadow-xl p-4 w-full max-w-sm relative z-10 bg-surface border border-edge"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm font-bold text-ink-sub">
                                    {(() => {
                                        const team = teams.find(t => t.id === showMemberMenu.teamId);
                                        const title = formatTeamTitle(team?.name);
                                        const label = taskLabels.find(l => l.id === showMemberMenu.taskLabelId)?.leftLabel ?? '';
                                        return title ? `${title} - ${label}` : label;
                                    })()}
                                </div>
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMemberMenu(null)}
                                >
                                    <MdClose />
                                </IconButton>
                            </div>

                            {/* 新規追加 */}
                            <div className="flex gap-2 mb-4 pb-4 border-b border-edge">
                                <Input
                                    placeholder="新規メンバー名"
                                    value={newMemberName}
                                    onChange={e => setNewMemberName(e.target.value)}
                                    className="flex-1 !py-2 !text-sm"
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleAddMember(showMemberMenu.taskLabelId, showMemberMenu.teamId)}
                                    disabled={!newMemberName.trim()}
                                    className="!px-3"
                                >
                                    <MdAdd size={20} />
                                </Button>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {members.map(m => {
                                    const isAssigned = assignments.some(a => a.memberId === m.id);
                                    if (isAssigned) return null;

                                    return (
                                        <div key={m.id} className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    onUpdateMember({ teamId: showMemberMenu.teamId, taskLabelId: showMemberMenu.taskLabelId, memberId: null, assignedDate: '' }, m.id);
                                                    setShowMemberMenu(null);
                                                }}
                                                className="flex-1 !justify-start !text-left hover:!bg-ground"
                                            >
                                                {m.name}
                                            </Button>
                                            <IconButton
                                                variant="danger"
                                                size="sm"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`${m.name}を削除しますか？\n割り当てからも解除されます。`)) {
                                                        await onDeleteMember(m.id);
                                                    }
                                                }}
                                                title="メンバーを削除"
                                            >
                                                <MdDelete size={20} />
                                            </IconButton>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* チーム編集/削除モーダル */}
            <AnimatePresence>
                {activeTeamActionId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setActiveTeamActionId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="rounded-xl shadow-xl p-6 w-full max-w-sm relative z-10 bg-surface border border-edge"
                        >
                            <h3 className="text-lg font-bold mb-4 text-ink">
                                班の編集
                            </h3>

                            <div className="mb-6">
                                <Input
                                    label="班名"
                                    value={activeTeamName}
                                    onChange={e => setActiveTeamName(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <NumberInput
                                    label="幅"
                                    suffix="px"
                                    value={tableSettings?.colWidths?.teams?.[activeTeamActionId] ?? 100}
                                    onChange={async (e) => {
                                        if (!activeTeamActionId || !tableSettings) return;
                                        const val = parseInt(e.target.value) || 100;
                                        const newSettings = { ...tableSettings };
                                        if (!newSettings.colWidths.teams) newSettings.colWidths.teams = {};
                                        newSettings.colWidths.teams[activeTeamActionId] = val;
                                        await onUpdateTableSettings(newSettings);
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    size="md"
                                    fullWidth
                                    onClick={handleUpdateTeamFromModal}
                                >
                                    更新する
                                </Button>
                                <Button
                                    variant="danger"
                                    size="md"
                                    fullWidth
                                    onClick={handleDeleteTeamFromModal}
                                    className="!flex !items-center !justify-center !gap-2 !bg-ground hover:!bg-red-50"
                                >
                                    <MdDelete size={20} />
                                    この班を削除
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fullWidth
                                    onClick={() => setActiveTeamActionId(null)}
                                >
                                    キャンセル
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 幅設定モーダル */}
            <AnimatePresence>
                {widthConfig && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setWidthConfig(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="rounded-xl shadow-xl p-6 w-full max-w-xs relative z-10 bg-surface border border-edge"
                        >
                            <h3 className="text-lg font-bold mb-4 text-ink">
                                {widthConfig.label}
                            </h3>
                            {(widthConfig.type === 'taskLabel' || widthConfig.type === 'note') && (
                                <div className="mb-4">
                                    <Input
                                        label="列の表示名"
                                        value={widthConfig.currentTitle ?? ''}
                                        onChange={e => setWidthConfig({ ...widthConfig, currentTitle: e.target.value })}
                                        placeholder={`${widthConfig.type === 'taskLabel' ? '左' : '右'}ラベル名`}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveWidth(widthConfig.currentWidth, widthConfig.currentTitle)}
                                    />
                                </div>
                            )}
                            <div className="mb-6">
                                <NumberInput
                                    suffix="px"
                                    value={widthConfig.currentWidth}
                                    onChange={e => setWidthConfig({ ...widthConfig, currentWidth: parseInt(e.target.value) || 0 })}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSaveWidth(widthConfig.currentWidth, widthConfig.currentTitle)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="md"
                                    onClick={() => setWidthConfig(null)}
                                    className="flex-1"
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={() => handleSaveWidth(widthConfig.currentWidth, widthConfig.currentTitle)}
                                    className="flex-1"
                                >
                                    保存
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 高さ設定モーダル */}
            <AnimatePresence>
                {heightConfig && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setHeightConfig(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="rounded-xl shadow-xl p-6 w-full max-w-xs relative z-10 bg-surface border border-edge"
                        >
                            <h3 className="text-lg font-bold mb-4 text-ink">
                                {heightConfig.label}
                            </h3>

                            <div className="mb-4">
                                <Input
                                    label={heightConfig.editMode === 'left' ? `${headerLabels.left}の名前` : `${headerLabels.right}の名前`}
                                    value={heightConfig.currentName}
                                    onChange={e => setHeightConfig({ ...heightConfig, currentName: e.target.value })}
                                    placeholder={heightConfig.editMode === 'left' ? `${headerLabels.left}を入力` : `${headerLabels.right}を入力（任意）`}
                                />
                                {heightConfig.editMode === 'right' && (
                                    <p className="text-xs mt-1 text-ink-muted">
                                        {headerLabels.right}は任意です。空欄にすると削除されます。
                                    </p>
                                )}
                            </div>

                            <div className="mb-6">
                                <NumberInput
                                    label="高さ"
                                    suffix="px"
                                    value={heightConfig.currentHeight}
                                    onChange={e => setHeightConfig({ ...heightConfig, currentHeight: parseInt(e.target.value) || 0 })}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveRowConfig(heightConfig.currentHeight, heightConfig.currentName)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm('この作業ラベルを削除しますか？\n（全てのチームから削除されます）')) {
                                            onDeleteTaskLabel(heightConfig.taskLabelId);
                                            setHeightConfig(null);
                                        }
                                    }}
                                    className="flex-1 !flex !items-center !justify-center !gap-1 !bg-ground hover:!bg-red-50"
                                >
                                    <MdDelete size={18} />
                                    削除
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setHeightConfig(null)}
                                    className="flex-1"
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleSaveRowConfig(heightConfig.currentHeight, heightConfig.currentName)}
                                    className="flex-1"
                                >
                                    保存
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

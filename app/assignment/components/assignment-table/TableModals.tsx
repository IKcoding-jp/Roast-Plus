import React from 'react';
import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdDelete, MdPersonOff, MdBlock, MdPerson, MdClose, MdCheck, MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { DEFAULT_TABLE_SETTINGS, WidthConfig, HeightConfig } from './types';

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
                            className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">
                                    {(() => {
                                        const team = teams.find(t => t.id === contextMenu.teamId);
                                        const title = formatTeamTitle(team?.name);
                                        const label = taskLabels.find(l => l.id === contextMenu.taskLabelId)?.leftLabel ?? '';
                                        return title ? `${title} - ${label}` : label;
                                    })()}
                                </h3>
                                <button onClick={() => setContextMenu(null)} className="text-gray-400 hover:text-gray-600">
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {contextMenu.memberId ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500">メンバー名</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900"
                                                value={editingMemberName}
                                                onChange={(e) => setEditingMemberName(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (contextMenu.memberId && editingMemberName.trim()) {
                                                        await onUpdateMemberName(contextMenu.memberId, editingMemberName);
                                                        setContextMenu(null);
                                                    }
                                                }}
                                                className="bg-primary text-white px-3 py-2 rounded hover:bg-primary-dark flex items-center justify-center"
                                                disabled={!editingMemberName.trim()}
                                            >
                                                <MdCheck size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-2 text-gray-500">
                                        メンバーが割り当てられていません
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-4 grid gap-2">
                                    <button
                                        onClick={() => {
                                            setShowMemberMenu({ taskLabelId: contextMenu.taskLabelId, teamId: contextMenu.teamId });
                                            setContextMenu(null);
                                        }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <MdPerson size={20} />
                                        <div className="text-sm font-bold">メンバーを変更・追加</div>
                                    </button>

                                    {contextMenu.memberId && (
                                        <button
                                            onClick={async () => {
                                                await onUpdateMember({ teamId: contextMenu.teamId, taskLabelId: contextMenu.taskLabelId, memberId: null, assignedDate: '' }, null);
                                                setContextMenu(null);
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <MdPersonOff size={20} />
                                            <div className="text-sm font-bold">未割り当てにする</div>
                                        </button>
                                    )}

                                    {contextMenu.memberId && (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
                                            <button
                                                onClick={() => setIsExclusionSettingsOpen(!isExclusionSettingsOpen)}
                                                className="w-full flex items-center justify-between gap-3 p-3 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <MdBlock size={20} className="text-gray-500" />
                                                    <div className="text-sm font-bold">除外ラベル設定</div>
                                                </div>
                                                {isExclusionSettingsOpen ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
                                            </button>

                                            <AnimatePresence>
                                                {isExclusionSettingsOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-white"
                                                    >
                                                        <div className="p-2 border-t border-gray-200">
                                                            <div className="text-xs text-gray-500 mb-2 px-1">
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
                                                                                ${isExcluded ? 'bg-red-50' : 'hover:bg-gray-50'}
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
                                                                                    className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-red-500 checked:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors cursor-pointer"
                                                                                />
                                                                                {isExcluded && (
                                                                                    <MdClose className="absolute text-white pointer-events-none" size={14} />
                                                                                )}
                                                                            </div>
                                                                            <div className="text-sm flex-1 truncate">
                                                                                <span className={isExcluded ? 'text-red-700 font-medium' : 'text-gray-700'}>
                                                                                    {label.leftLabel}
                                                                                </span>
                                                                                {label.rightLabel && (
                                                                                    <span className={`ml-1 text-xs ${isExcluded ? 'text-red-500' : 'text-gray-400'}`}>
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
                            className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm relative z-10"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-500 font-bold">
                                    {(() => {
                                        const team = teams.find(t => t.id === showMemberMenu.teamId);
                                        const title = formatTeamTitle(team?.name);
                                        const label = taskLabels.find(l => l.id === showMemberMenu.taskLabelId)?.leftLabel ?? '';
                                        return title ? `${title} - ${label}` : label;
                                    })()}
                                </div>
                                <button onClick={() => setShowMemberMenu(null)}><MdClose /></button>
                            </div>

                            {/* 新規追加 */}
                            <div className="flex gap-2 mb-4 pb-4 border-b border-gray-100">
                                <input
                                    className="flex-1 border rounded px-3 py-2 text-sm text-gray-900"
                                    placeholder="新規メンバー名"
                                    value={newMemberName}
                                    onChange={e => setNewMemberName(e.target.value)}
                                />
                                <button
                                    onClick={() => handleAddMember(showMemberMenu.taskLabelId, showMemberMenu.teamId)}
                                    disabled={!newMemberName.trim()}
                                    className="bg-primary text-white px-3 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
                                >
                                    <MdAdd size={20} />
                                </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {members.map(m => {
                                    const isAssigned = assignments.some(a => a.memberId === m.id);
                                    if (isAssigned) return null;

                                    return (
                                        <div key={m.id} className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    onUpdateMember({ teamId: showMemberMenu.teamId, taskLabelId: showMemberMenu.taskLabelId, memberId: null, assignedDate: '' }, m.id);
                                                    setShowMemberMenu(null);
                                                }}
                                                className="flex-1 text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                                            >
                                                {m.name}
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`${m.name}を削除しますか？\n割り当てからも解除されます。`)) {
                                                        await onDeleteMember(m.id);
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                title="メンバーを削除"
                                            >
                                                <MdDelete size={20} />
                                            </button>
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
                            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative z-10"
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-4">班の編集</h3>

                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">班名</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded text-lg text-gray-800"
                                    value={activeTeamName}
                                    onChange={e => setActiveTeamName(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">幅(px)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded text-lg text-gray-800"
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
                                <button
                                    onClick={handleUpdateTeamFromModal}
                                    className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark"
                                >
                                    更新する
                                </button>
                                <button
                                    onClick={handleDeleteTeamFromModal}
                                    className="w-full py-3 bg-gray-100 text-red-500 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                                >
                                    <MdDelete size={20} />
                                    この班を削除
                                </button>
                                <button
                                    onClick={() => setActiveTeamActionId(null)}
                                    className="w-full py-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                                >
                                    キャンセル
                                </button>
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
                            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative z-10"
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{widthConfig.label}</h3>
                            {(widthConfig.type === 'taskLabel' || widthConfig.type === 'note') && (
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        列の表示名
                                    </label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded text-base text-gray-900"
                                        value={widthConfig.currentTitle ?? ''}
                                        onChange={e => setWidthConfig({ ...widthConfig, currentTitle: e.target.value })}
                                        placeholder={`${widthConfig.type === 'taskLabel' ? '左' : '右'}ラベル名`}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveWidth(widthConfig.currentWidth, widthConfig.currentTitle)}
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-6">
                                <input
                                    type="number"
                                    className="flex-1 p-2 border border-gray-300 rounded text-lg text-center text-gray-800"
                                    value={widthConfig.currentWidth}
                                    onChange={e => setWidthConfig({ ...widthConfig, currentWidth: parseInt(e.target.value) || 0 })}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSaveWidth(widthConfig.currentWidth, widthConfig.currentTitle)}
                                />
                                <span className="text-gray-500 font-bold">px</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setWidthConfig(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">キャンセル</button>
                                <button onClick={() => handleSaveWidth(widthConfig.currentWidth, widthConfig.currentTitle)} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">保存</button>
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
                            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative z-10"
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{heightConfig.label}</h3>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-500 mb-1">
                                    {heightConfig.editMode === 'left' ? `${headerLabels.left}の名前` : `${headerLabels.right}の名前`}
                                </label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded text-lg text-gray-900"
                                    value={heightConfig.currentName}
                                    onChange={e => setHeightConfig({ ...heightConfig, currentName: e.target.value })}
                                    placeholder={heightConfig.editMode === 'left' ? `${headerLabels.left}を入力` : `${headerLabels.right}を入力（任意）`}
                                />
                                {heightConfig.editMode === 'right' && (
                                    <p className="text-xs text-gray-500 mt-1">{headerLabels.right}は任意です。空欄にすると削除されます。</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">高さ(px)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="flex-1 p-2 border border-gray-300 rounded text-lg text-center text-gray-900"
                                        value={heightConfig.currentHeight}
                                        onChange={e => setHeightConfig({ ...heightConfig, currentHeight: parseInt(e.target.value) || 0 })}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveRowConfig(heightConfig.currentHeight, heightConfig.currentName)}
                                    />
                                    <span className="text-gray-500 font-bold">px</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => {
                                    if (confirm('この作業ラベルを削除しますか？\n（全てのチームから削除されます）')) {
                                        onDeleteTaskLabel(heightConfig.taskLabelId);
                                        setHeightConfig(null);
                                    }
                                }} className="flex-1 py-2 bg-gray-100 text-red-500 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2">
                                    <MdDelete size={20} />
                                    削除
                                </button>
                                <button onClick={() => setHeightConfig(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">キャンセル</button>
                                <button onClick={() => handleSaveRowConfig(heightConfig.currentHeight, heightConfig.currentName)} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">保存</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

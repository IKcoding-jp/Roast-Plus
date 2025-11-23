import React, { useState, useRef, useEffect } from 'react';
import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdDelete, MdEdit, MdSwapHoriz, MdPersonOff, MdBlock, MdPerson, MdClose, MdCheck, MdKeyboardArrowRight, MdKeyboardArrowDown, MdLinearScale, MdHeight, MdInfoOutline } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';

type Props = {
    teams: Team[];
    taskLabels: TaskLabel[];
    assignments: Assignment[];
    members: Member[];
    tableSettings: TableSettings | null;
    onUpdateTableSettings: (settings: TableSettings) => Promise<void>;
    onUpdateMember: (assignment: Assignment, memberId: string | null) => Promise<void>;
    onAddMember: (member: Member) => Promise<void>;
    onDeleteMember: (memberId: string) => Promise<void>;
    onUpdateTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onAddTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onDeleteTaskLabel: (taskLabelId: string) => Promise<void>;
    onAddTeam: (team: Team) => Promise<void>;
    onDeleteTeam: (teamId: string) => Promise<void>;
    onUpdateTeam: (team: Team) => Promise<void>;
    onUpdateMemberName: (memberId: string, name: string) => Promise<void>;
    onUpdateMemberExclusion: (memberId: string, taskLabelId: string, isExcluded: boolean) => Promise<void>;
    onSwapAssignments: (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => Promise<void>;
};

export const AssignmentTable: React.FC<Props> = ({
    teams,
    taskLabels,
    assignments,
    members,
    onUpdateMember,
    onAddMember,
    onDeleteMember,
    onUpdateTaskLabel,
    onAddTaskLabel,
    onDeleteTaskLabel,
    onAddTeam,
    onDeleteTeam,
    onUpdateTeam,
    onUpdateMemberName,
    onUpdateMemberExclusion,
    onSwapAssignments,
    tableSettings,
    onUpdateTableSettings,
}) => {
    // 新規ラベル入力用
    const [newLeftLabel, setNewLeftLabel] = useState('');
    const [newRightLabel, setNewRightLabel] = useState('');

    // 新規チーム入力用
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddingTeam, setIsAddingTeam] = useState(false);

    // 編集中のセル状態
    const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
    const [editLeftLabel, setEditLeftLabel] = useState('');
    const [editRightLabel, setEditRightLabel] = useState('');

    // チーム編集モード（インライン編集用）
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editTeamName, setEditTeamName] = useState('');

    // チームアクションモーダル (編集・削除用)
    const [activeTeamActionId, setActiveTeamActionId] = useState<string | null>(null);
    const [activeTeamName, setActiveTeamName] = useState('');

    // メンバー選択メニュー (既存)
    const [showMemberMenu, setShowMemberMenu] = useState<{ taskLabelId: string, teamId: string } | null>(null);
    const [newMemberName, setNewMemberName] = useState('');

    // 新しいUI状態
    const [selectedCell, setSelectedCell] = useState<{ teamId: string, taskLabelId: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ teamId: string, taskLabelId: string, memberId: string | null } | null>(null);
    const [editingMemberName, setEditingMemberName] = useState('');
    
    // 除外設定アコーディオンの開閉状態
    const [isExclusionSettingsOpen, setIsExclusionSettingsOpen] = useState(false);

    // 幅設定モーダル用
    const [widthConfig, setWidthConfig] = useState<{
        type: 'taskLabel' | 'note' | 'team';
        id?: string;
        currentWidth: number;
        label: string;
    } | null>(null);

    // 高さ設定モーダル用
    const [heightConfig, setHeightConfig] = useState<{
        taskLabelId: string;
        currentHeight: number;
        label: string;
        currentName: string; // 名前変更用
    } | null>(null);

    // 幅変更保存
    const handleSaveWidth = async (width: number) => {
        if (!widthConfig) return;
        
        const currentSettings: TableSettings = tableSettings || {
            colWidths: { taskLabel: 160, note: 160, teams: {} },
            rowHeights: {}
        };

        const newSettings = { 
            ...currentSettings,
            colWidths: {
                ...currentSettings.colWidths,
                teams: { ...currentSettings.colWidths.teams }
            }
        };
        
        if (widthConfig.type === 'taskLabel') {
            newSettings.colWidths.taskLabel = width;
        } else if (widthConfig.type === 'note') {
            newSettings.colWidths.note = width;
        } else if (widthConfig.type === 'team' && widthConfig.id) {
            newSettings.colWidths.teams[widthConfig.id] = width;
        }
        
        await onUpdateTableSettings(newSettings);
        setWidthConfig(null);
    };

    // 行設定（高さ・名前）保存
    const handleSaveRowConfig = async (height: number, name: string) => {
        if (!heightConfig) return;

        // 高さの保存
        const currentSettings: TableSettings = tableSettings || {
            colWidths: { taskLabel: 160, note: 160, teams: {} },
            rowHeights: {}
        };

        const newSettings = { 
            ...currentSettings,
            rowHeights: { ...currentSettings.rowHeights }
        };

        newSettings.rowHeights[heightConfig.taskLabelId] = height;
        await onUpdateTableSettings(newSettings);

        // 名前の保存（変更がある場合のみ）
        const label = taskLabels.find(l => l.id === heightConfig.taskLabelId);
        if (label && name.trim() && name !== label.leftLabel) {
            await onUpdateTaskLabel({
                ...label,
                leftLabel: name
            });
        }

        setHeightConfig(null);
    };

    // 長押し検知用
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);
    const touchStartPos = useRef<{ x: number, y: number } | null>(null);

    // コンテキストメニューが開いたときに名前をセット、アコーディオンをリセット
    useEffect(() => {
        if (contextMenu?.memberId) {
            const member = members.find(m => m.id === contextMenu.memberId);
            if (member) {
                setEditingMemberName(member.name);
            }
            setIsExclusionSettingsOpen(false); // メニューを開くたびに閉じた状態に戻す
        } else {
            setEditingMemberName('');
        }
    }, [contextMenu, members]);

    // ラベル編集開始
    const startEditLabel = (label: TaskLabel) => {
        setEditingLabelId(label.id);
        setEditLeftLabel(label.leftLabel);
        setEditRightLabel(label.rightLabel || '');
    };

    // ラベル保存
    const saveLabel = async (labelId: string) => {
        const label = taskLabels.find(l => l.id === labelId);
        if (label) {
            await onUpdateTaskLabel({
                ...label,
                leftLabel: editLeftLabel,
                rightLabel: editRightLabel || null
            });
        }
        setEditingLabelId(null);
    };

    // 新規ラベル追加
    const handleAddTaskLabel = async () => {
        if (!newLeftLabel.trim()) return;

        const maxOrder = taskLabels.length > 0 ? Math.max(...taskLabels.map(t => t.order || 0)) : 0;
        
        await onAddTaskLabel({
            id: uuidv4(),
            leftLabel: newLeftLabel,
            rightLabel: newRightLabel || null,
            order: maxOrder + 1
        });

        setNewLeftLabel('');
        setNewRightLabel('');
    };

    // 新規メンバー追加 & 割り当て
    const handleAddMember = async (taskLabelId: string, teamId: string) => {
        if (!newMemberName.trim()) return;

        const newMember: Member = {
            id: uuidv4(),
            name: newMemberName,
            teamId: teamId, 
            excludedTaskLabelIds: [],
        };

        await onAddMember(newMember);
        await onUpdateMember({ 
            teamId: teamId, 
            taskLabelId: taskLabelId, 
            memberId: null,
            assignedDate: '' // This will be ignored or overwritten by update logic
        }, newMember.id);

        setNewMemberName('');
        setShowMemberMenu(null);
    };

    // チーム追加
    const handleAddTeam = async () => {
        if (!newTeamName.trim()) return;
        
        const maxOrder = teams.length > 0 ? Math.max(...teams.map(t => t.order || 0)) : 0;
        const newTeam: Team = {
            id: uuidv4(),
            name: newTeamName,
            order: maxOrder + 1
        };

        await onAddTeam(newTeam);
        setNewTeamName('');
        setIsAddingTeam(false);
    };

    // チーム更新 (インライン)
    const handleUpdateTeam = async (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (team && editTeamName.trim()) {
            await onUpdateTeam({ ...team, name: editTeamName });
        }
        setEditingTeamId(null);
    };

    // チーム更新 (モーダル経由)
    const handleUpdateTeamFromModal = async () => {
        if (!activeTeamActionId || !activeTeamName.trim()) return;
        
        const team = teams.find(t => t.id === activeTeamActionId);
        if (team) {
            await onUpdateTeam({ ...team, name: activeTeamName });
        }
        setActiveTeamActionId(null);
    };

    // チーム削除 (モーダル経由)
    const handleDeleteTeamFromModal = async () => {
        if (!activeTeamActionId) return;
        
        if (confirm('本当に削除しますか？\n所属するメンバーも削除されます。')) {
            await onDeleteTeam(activeTeamActionId);
            setActiveTeamActionId(null);
        }
    };

    // 削除確認
    const handleDeleteTaskLabel = async (id: string) => {
        if (confirm('この作業ラベルを削除しますか？\n（全てのチームから削除されます）')) {
            await onDeleteTaskLabel(id);
        }
    };

    // イベントハンドラ: 長押し判定
    const handleCellTouchStart = (teamId: string, taskLabelId: string, memberId: string | null, e: React.TouchEvent | React.MouseEvent) => {
        isLongPress.current = false;
        if ('touches' in e) {
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            touchStartPos.current = { x: e.clientX, y: e.clientY };
        }

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setContextMenu({ teamId, taskLabelId, memberId });
            setSelectedCell(null); // 選択は解除
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleCellTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const diffX = Math.abs(clientX - touchStartPos.current.x);
        const diffY = Math.abs(clientY - touchStartPos.current.y);

        // 10px以上動いたら長押しキャンセル
        if (diffX > 10 || diffY > 10) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleCellTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleCellClick = (teamId: string, taskLabelId: string) => {
        if (isLongPress.current) {
            isLongPress.current = false;
            return;
        }
        
        // コンテキストメニューが開いていたら何もしない（オーバーレイクリックで閉じるため）
        if (contextMenu) return;

        if (selectedCell) {
            if (selectedCell.teamId === teamId && selectedCell.taskLabelId === taskLabelId) {
                // 選択解除
                setSelectedCell(null);
            } else {
                // スワップ実行
                onSwapAssignments(selectedCell, { teamId, taskLabelId });
                setSelectedCell(null);
            }
        } else {
            // 選択
            setSelectedCell({ teamId, taskLabelId });
        }
    };

    // Grid style definition
    const generateGridTemplateColumns = () => {
        const defaultWidth = 140;
        const labelWidth = tableSettings?.colWidths?.taskLabel ?? 160;
        const noteWidth = tableSettings?.colWidths?.note ?? 160;
        
        // チームがない場合は、プレースホルダー用の幅（160px）を確保
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
        <div className="w-full max-w-full flex flex-col items-center gap-6">
            {/* データがない場合の初期ガイドメッセージ */}
            {teams.length === 0 && taskLabels.length === 0 && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-orange-100 p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-orange-50 rounded-full text-primary">
                            <MdInfoOutline size={32} />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">担当表をはじめましょう</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        まずは「班」と「作業」を追加して、<br />
                        日々の役割分担を管理する表を作成しましょう。
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded border border-primary/20">
                            <span className="font-bold text-primary">STEP 1</span>
                            <span>班を追加</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-bold">STEP 2</span>
                            <span>作業を追加</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-bold">STEP 3</span>
                            <span>割当開始</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block w-fit mx-auto max-w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 relative">
                {/* ヘッダー */}
                <div 
                    className="grid bg-dark border-b border-gray-700 md:text-base font-semibold text-white sticky top-0 z-20"
                    style={{ gridTemplateColumns, minWidth: 'max-content' }}
                >
                <div 
                    className="py-2 px-2 sm:px-3 border-r border-gray-700 flex items-center justify-center bg-dark cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => setWidthConfig({
                        type: 'taskLabel',
                        currentWidth: tableSettings?.colWidths?.taskLabel ?? 160,
                        label: '左ラベル列の幅'
                    })}
                    title="クリックして幅を変更"
                >
                    左ラベル
                </div>
                
                {/* チーム列（チームがない場合も表示） */}
                {teams.length === 0 ? (
                    <div className="py-2 px-2 border-r border-gray-700 text-center bg-dark flex flex-col items-center justify-center h-full min-h-[44px]">
                        {isAddingTeam ? (
                            <div className="relative z-20 flex items-center bg-white shadow-lg rounded border border-primary p-1 w-32 md:w-40">
                                <input
                                    className="w-full px-1 md:p-2 md:text-base text-sm outline-none text-gray-900"
                                    placeholder="班名"
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddTeam();
                                        if (e.key === 'Escape') setIsAddingTeam(false);
                                    }}
                                />
                                <button onClick={handleAddTeam} className="text-primary hover:bg-primary/10 rounded p-1 md:p-2">
                                    <MdAdd size={20} className="md:w-6 md:h-6" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingTeam(true)}
                                className="text-primary text-sm md:text-base font-bold flex items-center gap-1 hover:underline py-1 px-3 rounded hover:bg-white/10 border border-primary/20 bg-transparent shadow-sm"
                            >
                                <MdAdd className="md:w-5 md:h-5" /> 最初の班を追加
                            </button>
                        )}
                    </div>
                ) : (
                    teams.map(team => (
                        <div 
                            key={team.id} 
                            className="py-2 px-2 border-r border-gray-700 text-center relative group bg-dark flex items-center justify-center"
                        >
                            {editingTeamId === team.id ? (
                                <input
                                    className="w-full px-1 py-1 text-center border rounded bg-white text-gray-900 text-sm md:text-base"
                                    value={editTeamName}
                                    onChange={e => setEditTeamName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleUpdateTeam(team.id)}
                                    onBlur={() => handleUpdateTeam(team.id)}
                                />
                            ) : (
                                <div 
                                    className="cursor-pointer hover:bg-gray-800 rounded px-2 py-1 truncate w-full select-none active:bg-gray-700"
                                    onClick={() => {
                                        setActiveTeamActionId(team.id);
                                        setActiveTeamName(team.name);
                                    }}
                                >
                                    {team.name}班
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* チーム追加 & 補足ヘッダー */}
                <div 
                    className="py-2 px-2 sm:px-3 text-center flex items-center justify-between bg-dark relative cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, input')) return;
                        setWidthConfig({
                            type: 'note',
                            currentWidth: tableSettings?.colWidths?.note ?? 160,
                            label: '右ラベル列の幅'
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
                                    <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 flex items-center bg-white shadow-lg rounded border border-primary p-1 w-32 md:w-40">
                                        <input
                                            className="w-full px-1 md:p-2 text-sm md:text-base outline-none text-gray-900"
                                            placeholder="班名"
                                            value={newTeamName}
                                            onChange={e => setNewTeamName(e.target.value)}
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleAddTeam();
                                                if (e.key === 'Escape') setIsAddingTeam(false);
                                            }}
                                        />
                                        <button onClick={handleAddTeam} className="text-primary hover:bg-primary/10 rounded p-1 md:p-2">
                                            <MdAdd size={20} className="md:w-6 md:h-6" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsAddingTeam(true)}
                                    className="p-1 rounded-full bg-gray-700 text-gray-300 hover:bg-primary hover:text-white transition-colors shadow-sm"
                                    title="班を追加"
                                >
                                    <MdAdd size={16} className="md:w-5 md:h-5" />
                                </button>
                            )
                        )}
                    </div>
                    <span>右ラベル</span>
                    <span className="w-4"></span> {/* スペーサー */}
                </div>
            </div>

            {/* ボディ */}
            <div className="divide-y divide-gray-100 bg-white" style={{ minWidth: 'max-content' }}>
                {taskLabels.map(label => {
                    const isEditing = editingLabelId === label.id;

                    return (
                        <div 
                            key={label.id} 
                            className="grid items-center hover:bg-orange-50/30 transition-colors group"
                            style={{ 
                                gridTemplateColumns,
                                minHeight: `${tableSettings?.rowHeights?.[label.id] ?? 60}px`
                            }}
                        >
                            {/* 左ラベル列 */}
                            <div className="p-3 md:p-4 py-2 border-r border-gray-100 h-full flex items-center">
                                <div 
                                    className="w-full p-1 cursor-pointer font-medium text-gray-800 text-sm md:text-base break-words whitespace-pre-wrap hover:bg-gray-100 rounded transition-colors"
                                    onClick={() => {
                                        setHeightConfig({
                                            taskLabelId: label.id,
                                            currentHeight: tableSettings?.rowHeights?.[label.id] ?? 60,
                                            label: '行の設定',
                                            currentName: label.leftLabel
                                        });
                                    }}
                                >
                                    {label.leftLabel}
                                </div>
                            </div>

                            {/* 各チームの担当者列 */}
                            {teams.length === 0 ? (
                                <div className="p-2 md:p-4 border-r border-gray-100 h-full bg-gray-50/30 flex items-center justify-center">
                                    <span className="text-xs md:text-sm text-gray-300">班を作成してください</span>
                                </div>
                            ) : (
                                teams.map(team => {
                                    const assignment = assignments.find(a => a.teamId === team.id && a.taskLabelId === label.id);
                                    const member = members.find(m => m.id === assignment?.memberId);
                                    
                                    const isSelected = selectedCell?.teamId === team.id && selectedCell?.taskLabelId === label.id;

                                    return (
                                        <div key={team.id} className="p-2 md:p-4 py-2 border-r border-gray-100 h-full flex items-center justify-center relative">
                                            <button
                                                onMouseDown={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                onMouseUp={handleCellTouchEnd}
                                                onMouseMove={handleCellTouchMove}
                                                onMouseLeave={handleCellTouchEnd}
                                                onTouchStart={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                onTouchEnd={handleCellTouchEnd}
                                                onTouchMove={handleCellTouchMove}
                                                onClick={(e) => handleCellClick(team.id, label.id)}
                                                className={`
                                                    w-full py-2 md:py-3 px-1 rounded-lg text-sm md:text-base font-bold text-center transition-all truncate select-none
                                                    ${member 
                                                        ? isSelected
                                                            ? 'bg-primary text-white shadow-md scale-105'
                                                            : 'text-gray-800 bg-white border border-gray-200 shadow-sm hover:shadow' 
                                                        : isSelected
                                                            ? 'bg-primary/20 text-primary border border-primary'
                                                            : 'text-gray-400 bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100'}
                                                `}
                                            >
                                                {member ? member.name : '未割当'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}

                            {/* 右ラベル列 */}
                            <div className="p-3 md:p-4 py-2 h-full flex items-center relative pr-8 md:pr-10">
                                {isEditing ? (
                                    <div className="flex gap-1 w-full min-w-0 items-center justify-end">
                                        <input
                                            className="w-full min-w-0 p-2 md:p-3 border rounded bg-white text-right text-sm md:text-base text-gray-900"
                                            value={editRightLabel}
                                            onChange={e => setEditRightLabel(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') saveLabel(label.id);
                                            }}
                                        />
                                        <button 
                                            onClick={() => saveLabel(label.id)} 
                                            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 text-green-600 p-1.5 md:p-2 rounded hover:bg-green-50 transition-colors"
                                            title="保存"
                                        >
                                            <MdCheck size={18} className="md:w-6 md:h-6" />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        className="w-full p-1 cursor-pointer font-medium text-gray-800 text-sm md:text-base break-words whitespace-pre-wrap text-right hover:bg-gray-100 rounded transition-colors"
                                        onClick={() => startEditLabel(label)}
                                    >
                                        {label.rightLabel}
                                    </div>
                                )}
                                
                                {/* 削除ボタン（ホバー時のみ表示、編集中は非表示） */}
                                {!isEditing && (
                                    <button 
                                        onClick={() => handleDeleteTaskLabel(label.id)}
                                        className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MdDelete size={18} className="md:w-6 md:h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* 新規ラベル追加行 */}
                <div 
                    className="grid items-center bg-gray-50 p-2 py-2 border-t border-gray-200 min-h-[60px]"
                    style={{ gridTemplateColumns }}
                >
                    <div className="pr-2">
                        <input
                            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary text-sm text-gray-800 placeholder-gray-500"
                            placeholder="左ラベル"
                            value={newLeftLabel}
                            onChange={e => setNewLeftLabel(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTaskLabel();
                            }}
                        />
                    </div>
                    
                    {/* チーム列の空白（結合） */}
                    <div className="col-span-full px-2 text-center text-gray-600 text-xs font-bold flex items-center justify-center" style={{ gridColumn: `2 / span ${Math.max(1, teams.length)}` }}>
                        <span className="hidden md:inline">左と右を入力して追加</span>
                    </div>

                    <div className="pl-2 flex gap-2 w-full h-full" style={{ gridColumn: '-2 / -1' }}>
                        <input
                            className="w-full min-w-0 p-2 border border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary text-right text-sm text-gray-800 placeholder-gray-500"
                            placeholder="右ラベル(任意)"
                            value={newRightLabel}
                            onChange={e => setNewRightLabel(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTaskLabel();
                            }}
                        />
                        <button
                            onClick={handleAddTaskLabel}
                            disabled={!newLeftLabel.trim()}
                            className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark shadow-sm disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0 flex items-center justify-center h-full max-h-[38px]"
                        >
                            <MdAdd size={20} />
                        </button>
                    </div>
                </div>
            </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden w-full space-y-4 px-2">
                {taskLabels.map(label => {
                    const isEditing = editingLabelId === label.id;
                    
                    return (
                        <div key={label.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                            {/* Header: Label Names */}
                            <div className="flex justify-between items-start border-b border-gray-50 pb-2 min-h-[40px]">
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <input
                                            className="w-full p-2 border rounded bg-white text-lg font-bold text-gray-800"
                                            value={editLeftLabel}
                                            onChange={e => setEditLeftLabel(e.target.value)}
                                            placeholder="左ラベル"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 p-2 border rounded bg-white text-sm text-gray-600"
                                                value={editRightLabel}
                                                onChange={e => setEditRightLabel(e.target.value)}
                                                placeholder="右ラベル"
                                            />
                                            <button 
                                                onClick={() => saveLabel(label.id)} 
                                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 shrink-0"
                                            >
                                                <MdCheck size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTaskLabel(label.id)} 
                                                className="bg-red-50 text-red-500 p-2 rounded hover:bg-red-100 border border-red-200 shrink-0"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 w-full flex-wrap">
                                        <div 
                                            className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 cursor-pointer font-bold"
                                            onClick={() => startEditLabel(label)}
                                        >
                                            {label.leftLabel}
                                        </div>
                                        {label.rightLabel && (
                                            <div 
                                                className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 cursor-pointer font-bold"
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
                                <div className="text-center py-4 bg-gray-50 rounded-lg text-sm text-gray-400">
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
                                                <div className="text-[10px] text-gray-400 font-bold px-1">{team.name}班</div>
                                                <button
                                                    onMouseDown={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                    onMouseUp={handleCellTouchEnd}
                                                    onMouseMove={handleCellTouchMove}
                                                    onMouseLeave={handleCellTouchEnd}
                                                    onTouchStart={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                    onTouchEnd={handleCellTouchEnd}
                                                    onTouchMove={handleCellTouchMove}
                                                    onClick={(e) => handleCellClick(team.id, label.id)}
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
                                    {teams.find(t => t.id === contextMenu.teamId)?.name}班 - {taskLabels.find(l => l.id === contextMenu.taskLabelId)?.leftLabel}
                                </h3>
                                <button onClick={() => setContextMenu(null)} className="text-gray-400 hover:text-gray-600">
                                    <MdClose size={20} />
                                </button>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                {/* メンバー名変更エリア */}
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
                                    
                                    {/* メンバー変更 (既存メニュー呼び出し) */}
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

                                    {/* 未割り当てにする */}
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

                                    {/* 除外ラベル設定（アコーディオン形式） */}
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

                                    {/* 行の設定変更 - メンバー編集時には不要なので削除 */}
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
                                    {teams.find(t => t.id === showMemberMenu.teamId)?.name}班 - {taskLabels.find(l => l.id === showMemberMenu.taskLabelId)?.leftLabel}
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
                                {members.map(m => (
                                    <div key={m.id} className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                onUpdateMember({ teamId: showMemberMenu.teamId, taskLabelId: showMemberMenu.taskLabelId, memberId: null, assignedDate: '' }, m.id);
                                                setShowMemberMenu(null);
                                            }}
                                            className={`
                                                flex-1 text-left px-3 py-2 hover:bg-gray-100 rounded
                                                ${assignments.find(a => a.teamId === showMemberMenu.teamId && a.taskLabelId === showMemberMenu.taskLabelId)?.memberId === m.id 
                                                    ? 'bg-primary/10 text-primary font-bold' 
                                                    : 'text-gray-700'}
                                            `}
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
                                ))}
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
                            <div className="flex items-center gap-2 mb-6">
                                <input
                                    type="number"
                                    className="flex-1 p-2 border border-gray-300 rounded text-lg text-center text-gray-800"
                                    value={widthConfig.currentWidth}
                                    onChange={e => setWidthConfig({ ...widthConfig, currentWidth: parseInt(e.target.value) || 0 })}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSaveWidth(widthConfig.currentWidth)}
                                />
                                <span className="text-gray-500 font-bold">px</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setWidthConfig(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">キャンセル</button>
                                <button onClick={() => handleSaveWidth(widthConfig.currentWidth)} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">保存</button>
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
                                <label className="block text-sm text-gray-500 mb-1">ラベル名</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded text-lg text-gray-900"
                                    value={heightConfig.currentName}
                                    onChange={e => setHeightConfig({ ...heightConfig, currentName: e.target.value })}
                                />
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
                                <button onClick={() => setHeightConfig(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">キャンセル</button>
                                <button onClick={() => handleSaveRowConfig(heightConfig.currentHeight, heightConfig.currentName)} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">保存</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

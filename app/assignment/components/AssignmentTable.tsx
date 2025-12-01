import React, { useState, useRef, useEffect } from 'react';
import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdDelete, MdPersonOff, MdBlock, MdPerson, MdClose, MdCheck, MdKeyboardArrowRight, MdKeyboardArrowDown, MdInfoOutline } from 'react-icons/md';
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
    // 譁ｰ隕上Λ繝吶Ν蜈･蜉帷畑
    const [newLeftLabel, setNewLeftLabel] = useState('');
    const [newRightLabel, setNewRightLabel] = useState('');

    // 譁ｰ隕上メ繝ｼ繝蜈･蜉帷畑
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddingTeam, setIsAddingTeam] = useState(false);

    // 邱ｨ髮・ｸｭ縺ｮ繧ｻ繝ｫ迥ｶ諷・    const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
    const [editLeftLabel, setEditLeftLabel] = useState('');
    const [editRightLabel, setEditRightLabel] = useState('');

    // 繝√・繝邱ｨ髮・Δ繝ｼ繝会ｼ医う繝ｳ繝ｩ繧､繝ｳ邱ｨ髮・畑・・    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editTeamName, setEditTeamName] = useState('');

    // 繝√・繝繧｢繧ｯ繧ｷ繝ｧ繝ｳ繝｢繝ｼ繝繝ｫ (邱ｨ髮・・蜑企勁逕ｨ)
    const [activeTeamActionId, setActiveTeamActionId] = useState<string | null>(null);
    const [activeTeamName, setActiveTeamName] = useState('');

    // 繝｡繝ｳ繝舌・驕ｸ謚槭Γ繝九Η繝ｼ (譌｢蟄・
    const [showMemberMenu, setShowMemberMenu] = useState<{ taskLabelId: string, teamId: string } | null>(null);
    const [newMemberName, setNewMemberName] = useState('');

    // 譁ｰ縺励＞UI迥ｶ諷・    const [selectedCell, setSelectedCell] = useState<{ teamId: string, taskLabelId: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ teamId: string, taskLabelId: string, memberId: string | null } | null>(null);
    const [editingMemberName, setEditingMemberName] = useState('');
    
    // 髯､螟冶ｨｭ螳壹い繧ｳ繝ｼ繝・ぅ繧ｪ繝ｳ縺ｮ髢矩哩迥ｶ諷・    const [isExclusionSettingsOpen, setIsExclusionSettingsOpen] = useState(false);

    const openContextMenu = (teamId: string, taskLabelId: string, memberId: string | null) => {
        const selectedMember = memberId ? members.find(m => m.id === memberId) : undefined;
        setEditingMemberName(selectedMember?.name ?? '');
        setIsExclusionSettingsOpen(false);
        setContextMenu({ teamId, taskLabelId, memberId });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
        setIsExclusionSettingsOpen(false);
        setEditingMemberName('');
    };

    // 蟷・ｨｭ螳壹Δ繝ｼ繝繝ｫ逕ｨ
    const [widthConfig, setWidthConfig] = useState<{
        type: 'taskLabel' | 'note' | 'team';
        id?: string;
        currentWidth: number;
        label: string;
    } | null>(null);

    // 鬮倥＆險ｭ螳壹Δ繝ｼ繝繝ｫ逕ｨ
    const [heightConfig, setHeightConfig] = useState<{
        taskLabelId: string;
        currentHeight: number;
        label: string;
        currentName: string; // 蜷榊燕螟画峩逕ｨ
        editMode: 'left' | 'right'; // 邱ｨ髮・Δ繝ｼ繝会ｼ亥ｷｦ/蜿ｳ・・        currentRightLabel?: string; // 蜿ｳ繝ｩ繝吶Ν邱ｨ髮・畑・亥盾辣ｧ逕ｨ・・    } | null>(null);

    // 蟷・､画峩菫晏ｭ・    const handleSaveWidth = async (width: number) => {
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

    // 陦瑚ｨｭ螳夲ｼ磯ｫ倥＆繝ｻ蜷榊燕・我ｿ晏ｭ・    const handleSaveRowConfig = async (height: number, name: string) => {
        if (!heightConfig) return;

        // 鬮倥＆縺ｮ菫晏ｭ・        const currentSettings: TableSettings = tableSettings || {
            colWidths: { taskLabel: 160, note: 160, teams: {} },
            rowHeights: {}
        };

        const newSettings = { 
            ...currentSettings,
            rowHeights: { ...currentSettings.rowHeights }
        };

        newSettings.rowHeights[heightConfig.taskLabelId] = height;
        await onUpdateTableSettings(newSettings);

        // 繝ｩ繝吶Ν縺ｮ菫晏ｭ假ｼ育ｷｨ髮・Δ繝ｼ繝峨↓蠢懊§縺ｦ蟾ｦ蜿ｳ繧貞句挨縺ｫ菫晏ｭ假ｼ・        const label = taskLabels.find(l => l.id === heightConfig.taskLabelId);
        if (label) {
            if (heightConfig.editMode === 'left') {
                // 蟾ｦ繝ｩ繝吶Ν繧呈峩譁ｰ・亥､画峩縺後≠繧句ｴ蜷医・縺ｿ・・                if (name.trim() && name !== label.leftLabel) {
                    await onUpdateTaskLabel({
                        ...label,
                        leftLabel: name
                    });
                }
            } else {
                // 蜿ｳ繝ｩ繝吶Ν繧呈峩譁ｰ・育ｩｺ谺・・蝣ｴ蜷医・null縺ｫ險ｭ螳夲ｼ・                const newRightLabel = name.trim() || null;
                if (newRightLabel !== label.rightLabel) {
                    await onUpdateTaskLabel({
                        ...label,
                        rightLabel: newRightLabel
                    });
                }
            }
        }

        setHeightConfig(null);
    };

    // 髟ｷ謚ｼ縺玲､懃衍逕ｨ
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);
    const touchStartPos = useRef<{ x: number, y: number } | null>(null);


    // 繝ｩ繝吶Ν邱ｨ髮・幕蟋・    const startEditLabel = (label: TaskLabel) => {
        setEditingLabelId(label.id);
        setEditLeftLabel(label.leftLabel);
        setEditRightLabel(label.rightLabel || '');
    };

    // 繝ｩ繝吶Ν菫晏ｭ・    const saveLabel = async (labelId: string) => {
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

    // 譁ｰ隕上Λ繝吶Ν霑ｽ蜉
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

    // 譁ｰ隕上Γ繝ｳ繝舌・霑ｽ蜉 & 蜑ｲ繧雁ｽ薙※
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

    // 繝√・繝霑ｽ蜉
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

    // 繝√・繝譖ｴ譁ｰ (繧､繝ｳ繝ｩ繧､繝ｳ)
    const handleUpdateTeam = async (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (team && editTeamName.trim()) {
            await onUpdateTeam({ ...team, name: editTeamName });
        }
        setEditingTeamId(null);
    };

    // 繝√・繝譖ｴ譁ｰ (繝｢繝ｼ繝繝ｫ邨檎罰)
    const handleUpdateTeamFromModal = async () => {
        if (!activeTeamActionId || !activeTeamName.trim()) return;
        
        const team = teams.find(t => t.id === activeTeamActionId);
        if (team) {
            await onUpdateTeam({ ...team, name: activeTeamName });
        }
        setActiveTeamActionId(null);
    };

    // 繝√・繝蜑企勁 (繝｢繝ｼ繝繝ｫ邨檎罰)
    const handleDeleteTeamFromModal = async () => {
        if (!activeTeamActionId) return;
        
        if (confirm('譛ｬ蠖薙↓蜑企勁縺励∪縺吶°・歃n謇螻槭☆繧九Γ繝ｳ繝舌・繧ょ炎髯､縺輔ｌ縺ｾ縺吶・)) {
            await onDeleteTeam(activeTeamActionId);
            setActiveTeamActionId(null);
        }
    };

    // 蜑企勁遒ｺ隱・    const handleDeleteTaskLabel = async (id: string) => {
        if (confirm('縺薙・菴懈･ｭ繝ｩ繝吶Ν繧貞炎髯､縺励∪縺吶°・歃n・亥・縺ｦ縺ｮ繝√・繝縺九ｉ蜑企勁縺輔ｌ縺ｾ縺呻ｼ・)) {
            await onDeleteTaskLabel(id);
        }
    };

    // 繧､繝吶Φ繝医ワ繝ｳ繝峨Λ: 髟ｷ謚ｼ縺怜愛螳・    const handleCellTouchStart = (teamId: string, taskLabelId: string, memberId: string | null, e: React.TouchEvent | React.MouseEvent) => {
        isLongPress.current = false;
        if ('touches' in e) {
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            touchStartPos.current = { x: e.clientX, y: e.clientY };
        }

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            openContextMenu(teamId, taskLabelId, memberId);
            setSelectedCell(null); // 驕ｸ謚槭・隗｣髯､
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleCellTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const diffX = Math.abs(clientX - touchStartPos.current.x);
        const diffY = Math.abs(clientY - touchStartPos.current.y);

        // 10px莉･荳雁虚縺・◆繧蛾聞謚ｼ縺励く繝｣繝ｳ繧ｻ繝ｫ
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
        
        // 繧ｳ繝ｳ繝・く繧ｹ繝医Γ繝九Η繝ｼ縺碁幕縺・※縺・◆繧我ｽ輔ｂ縺励↑縺・ｼ医が繝ｼ繝舌・繝ｬ繧､繧ｯ繝ｪ繝・け縺ｧ髢峨§繧九◆繧・ｼ・        if (contextMenu) return;

        if (selectedCell) {
            if (selectedCell.teamId === teamId && selectedCell.taskLabelId === taskLabelId) {
                // 驕ｸ謚櫁ｧ｣髯､
                setSelectedCell(null);
            } else {
                // 繧ｹ繝ｯ繝・・螳溯｡・                onSwapAssignments(selectedCell, { teamId, taskLabelId });
                setSelectedCell(null);
            }
        } else {
            // 驕ｸ謚・            setSelectedCell({ teamId, taskLabelId });
        }
    };

    // Grid style definition
    const generateGridTemplateColumns = () => {
        const defaultWidth = 140;
        const labelWidth = tableSettings?.colWidths?.taskLabel ?? 160;
        const noteWidth = tableSettings?.colWidths?.note ?? 160;
        
        // 繝√・繝縺後↑縺・ｴ蜷医・縲√・繝ｬ繝ｼ繧ｹ繝帙Ν繝繝ｼ逕ｨ縺ｮ蟷・ｼ・60px・峨ｒ遒ｺ菫・        if (teams.length === 0) {
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
            {/* 繝・・繧ｿ縺後↑縺・ｴ蜷医・蛻晄悄繧ｬ繧､繝峨Γ繝・そ繝ｼ繧ｸ */}
            {teams.length === 0 && taskLabels.length === 0 && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-orange-100 p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-orange-50 rounded-full text-primary">
                            <MdInfoOutline size={32} />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">諡・ｽ楢｡ｨ繧偵・縺倥ａ縺ｾ縺励ｇ縺・/h3>
                    <p className="text-gray-600 text-sm mb-6">
                        縺ｾ縺壹・縲檎少縲阪→縲御ｽ懈･ｭ縲阪ｒ霑ｽ蜉縺励※縲・br />
                        譌･縲・・蠖ｹ蜑ｲ蛻・球繧堤ｮ｡逅・☆繧玖｡ｨ繧剃ｽ懈・縺励∪縺励ｇ縺・・                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded border border-primary/20">
                            <span className="font-bold text-primary">STEP 1</span>
                            <span>迴ｭ繧定ｿｽ蜉</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-bold">STEP 2</span>
                            <span>菴懈･ｭ繧定ｿｽ蜉</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-bold">STEP 3</span>
                            <span>蜑ｲ蠖馴幕蟋・/span>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block w-fit mx-auto max-w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 relative">
                {/* 繝倥ャ繝繝ｼ */}
                <div 
                    className="grid bg-dark border-b border-gray-700 md:text-base font-semibold text-white sticky top-0 z-20"
                    style={{ gridTemplateColumns, minWidth: 'max-content' }}
                >
                <div 
                    className="py-2 px-2 sm:px-3 border-r border-gray-700 flex items-center justify-center bg-dark cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => setWidthConfig({
                        type: 'taskLabel',
                        currentWidth: tableSettings?.colWidths?.taskLabel ?? 160,
                        label: '蟾ｦ繝ｩ繝吶Ν蛻励・蟷・
                    })}
                    title="繧ｯ繝ｪ繝・け縺励※蟷・ｒ螟画峩"
                >
                    蟾ｦ繝ｩ繝吶Ν
                </div>
                
                {/* 繝√・繝蛻暦ｼ医メ繝ｼ繝縺後↑縺・ｴ蜷医ｂ陦ｨ遉ｺ・・*/}
                {teams.length === 0 ? (
                    <div className="py-2 px-2 border-r border-gray-700 text-center bg-dark flex flex-col items-center justify-center h-full min-h-[44px]">
                        {isAddingTeam ? (
                            <div className="relative z-20 flex items-center bg-white shadow-lg rounded border border-primary p-1 w-32 md:w-40">
                                <input
                                    className="w-full px-1 md:p-2 md:text-base text-sm outline-none text-gray-900"
                                    placeholder="迴ｭ蜷・
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
                                <MdAdd className="md:w-5 md:h-5" /> 譛蛻昴・迴ｭ繧定ｿｽ蜉
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
                                    {team.name}迴ｭ
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* 繝√・繝霑ｽ蜉 & 陬懆ｶｳ繝倥ャ繝繝ｼ */}
                <div 
                    className="py-2 px-2 sm:px-3 text-center flex items-center justify-between bg-dark relative cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, input')) return;
                        setWidthConfig({
                            type: 'note',
                            currentWidth: tableSettings?.colWidths?.note ?? 160,
                            label: '蜿ｳ繝ｩ繝吶Ν蛻励・蟷・
                        });
                    }}
                    title="繧ｯ繝ｪ繝・け縺励※蟷・ｒ螟画峩"
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
                                            placeholder="迴ｭ蜷・
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
                                    title="迴ｭ繧定ｿｽ蜉"
                                >
                                    <MdAdd size={16} className="md:w-5 md:h-5" />
                                </button>
                            )
                        )}
                    </div>
                    <span>蜿ｳ繝ｩ繝吶Ν</span>
                    <span className="w-4"></span> {/* 繧ｹ繝壹・繧ｵ繝ｼ */}
                </div>
                </div>

                {/* 繝懊ョ繧｣ */}
                <div className="divide-y divide-gray-100 bg-white" style={{ minWidth: 'max-content' }}>
                {taskLabels.map(label => {


                    return (
                        <div 
                            key={label.id} 
                            className="grid items-center hover:bg-orange-50/30 transition-colors group"
                            style={{ 
                                gridTemplateColumns,
                                minHeight: `${tableSettings?.rowHeights?.[label.id] ?? 60}px`
                            }}
                        >
                            {/* 蟾ｦ繝ｩ繝吶Ν蛻・*/}
                            <div className="p-3 md:p-4 py-2 border-r border-gray-100 h-full flex items-center justify-center">
                                <div 
                                    className="w-full p-1 cursor-pointer font-medium text-gray-800 text-sm md:text-base break-words whitespace-pre-wrap text-center hover:bg-gray-100 rounded transition-colors"
                                    onClick={() => {
                                        setHeightConfig({
                                            taskLabelId: label.id,
                                            currentHeight: tableSettings?.rowHeights?.[label.id] ?? 60,
                                            label: '蟾ｦ繝ｩ繝吶Ν縺ｮ險ｭ螳・,
                                            currentName: label.leftLabel,
                                            editMode: 'left',
                                            currentRightLabel: label.rightLabel || ''
                                        });
                                    }}
                                >
                                    {label.leftLabel}
                                </div>
                            </div>

                            {/* 蜷・メ繝ｼ繝縺ｮ諡・ｽ楢・・ */}
                            {teams.length === 0 ? (
                                <div className="p-2 md:p-4 border-r border-gray-100 h-full bg-gray-50/30 flex items-center justify-center">
                                    <span className="text-xs md:text-sm text-gray-300">迴ｭ繧剃ｽ懈・縺励※縺上□縺輔＞</span>
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
                                                onClick={() => handleCellClick(team.id, label.id)}
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
                                                {member ? member.name : '譛ｪ蜑ｲ蠖・}
                                            </button>
                                        </div>
                                    );
                                })
                            )}

                            {/* 蜿ｳ繝ｩ繝吶Ν蛻・*/}
                            <div className="p-3 md:p-4 py-2 h-full flex items-center relative pr-8 md:pr-10">
                                <div 
                                    className="w-full p-1 cursor-pointer font-medium text-gray-800 text-sm md:text-base break-words whitespace-pre-wrap text-right hover:bg-gray-100 rounded transition-colors"
                                    onClick={() => {
                                        setHeightConfig({
                                            taskLabelId: label.id,
                                            currentHeight: tableSettings?.rowHeights?.[label.id] ?? 60,
                                            label: '蜿ｳ繝ｩ繝吶Ν縺ｮ險ｭ螳・,
                                            currentName: label.rightLabel || '',
                                            editMode: 'right',
                                            currentRightLabel: label.leftLabel // 蟾ｦ繝ｩ繝吶Ν縺ｯ蜿ら・逕ｨ縺ｫ菫晄戟
                                        });
                                    }}
                                >
                                    {label.rightLabel}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* 譁ｰ隕上Λ繝吶Ν霑ｽ蜉陦・*/}
                <div 
                    className="grid items-center bg-gray-50 p-2 py-2 border-t border-gray-200 min-h-[60px]"
                    style={{ gridTemplateColumns }}
                >
                    <div className="pr-2">
                        <input
                            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary text-sm text-gray-800 placeholder-gray-500"
                            placeholder="蟾ｦ繝ｩ繝吶Ν"
                            value={newLeftLabel}
                            onChange={e => setNewLeftLabel(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTaskLabel();
                            }}
                        />
                    </div>
                    
                    {/* 繝√・繝蛻励・遨ｺ逋ｽ・育ｵ仙粋・・*/}
                    <div className="col-span-full px-2 text-center text-gray-600 text-xs font-bold flex items-center justify-center" style={{ gridColumn: `2 / span ${Math.max(1, teams.length)}` }}>
                        <span className="hidden md:inline">蟾ｦ縺ｨ蜿ｳ繧貞・蜉帙＠縺ｦ霑ｽ蜉</span>
                    </div>

                    <div className="pl-2 flex gap-2 w-full h-full" style={{ gridColumn: '-2 / -1' }}>
                        <input
                            className="w-full min-w-0 p-2 border border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary text-right text-sm text-gray-800 placeholder-gray-500"
                            placeholder="蜿ｳ繝ｩ繝吶Ν(莉ｻ諢・"
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
                                            placeholder="蟾ｦ繝ｩ繝吶Ν"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 p-2 border rounded bg-white text-sm text-gray-600"
                                                value={editRightLabel}
                                                onChange={e => setEditRightLabel(e.target.value)}
                                                placeholder="蜿ｳ繝ｩ繝吶Ν"
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
                                    迴ｭ繧剃ｽ懈・縺励※縺上□縺輔＞
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {teams.map(team => {
                                        const assignment = assignments.find(a => a.teamId === team.id && a.taskLabelId === label.id);
                                        const member = members.find(m => m.id === assignment?.memberId);
                                        const isSelected = selectedCell?.teamId === team.id && selectedCell?.taskLabelId === label.id;

                                        return (
                                            <div key={team.id} className="flex flex-col gap-1">
                                                <div className="text-[10px] text-gray-400 font-bold px-1">{team.name}迴ｭ</div>
                                                <button
                                                    onMouseDown={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                    onMouseUp={handleCellTouchEnd}
                                                    onMouseMove={handleCellTouchMove}
                                                    onMouseLeave={handleCellTouchEnd}
                                                    onTouchStart={(e) => handleCellTouchStart(team.id, label.id, member?.id || null, e)}
                                                    onTouchEnd={handleCellTouchEnd}
                                                    onTouchMove={handleCellTouchMove}
                                                    onClick={(e) => handleCellClick(team.id, label.id)}
                                                    onClick={() => handleCellClick(team.id, label.id)}
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
                                                    {member ? member.name : '譛ｪ蜑ｲ蠖・}
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

            {/* 繧ｳ繝ｳ繝・く繧ｹ繝医Γ繝九Η繝ｼ繝｢繝ｼ繝繝ｫ */}
            <AnimatePresence>
                {contextMenu && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={closeContextMenu}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">
                                    {teams.find(t => t.id === contextMenu.teamId)?.name}迴ｭ - {taskLabels.find(l => l.id === contextMenu.taskLabelId)?.leftLabel}
                                </h3>
                                <button onClick={closeContextMenu} className="text-gray-400 hover:text-gray-600">
                                    <MdClose size={20} />
                                </button>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                {/* 繝｡繝ｳ繝舌・蜷榊､画峩繧ｨ繝ｪ繧｢ */}
                                {contextMenu.memberId ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500">繝｡繝ｳ繝舌・蜷・/label>
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
                                                        closeContextMenu();
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
                                        繝｡繝ｳ繝舌・縺悟牡繧雁ｽ薙※繧峨ｌ縺ｦ縺・∪縺帙ｓ
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-4 grid gap-2">
                                    
                                    {/* 繝｡繝ｳ繝舌・螟画峩 (譌｢蟄倥Γ繝九Η繝ｼ蜻ｼ縺ｳ蜃ｺ縺・ */}
                                    <button
                                        onClick={() => {
                                            setShowMemberMenu({ taskLabelId: contextMenu.taskLabelId, teamId: contextMenu.teamId });
                                            closeContextMenu();
                                        }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <MdPerson size={20} />
                                        <div className="text-sm font-bold">繝｡繝ｳ繝舌・繧貞､画峩繝ｻ霑ｽ蜉</div>
                                    </button>

                                    {/* 譛ｪ蜑ｲ繧雁ｽ薙※縺ｫ縺吶ｋ */}
                                    {contextMenu.memberId && (
                                        <button
                                            onClick={async () => {
                                                await onUpdateMember({ teamId: contextMenu.teamId, taskLabelId: contextMenu.taskLabelId, memberId: null, assignedDate: '' }, null);
                                                closeContextMenu();
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <MdPersonOff size={20} />
                                            <div className="text-sm font-bold">譛ｪ蜑ｲ繧雁ｽ薙※縺ｫ縺吶ｋ</div>
                                        </button>
                                    )}

                                    {/* 髯､螟悶Λ繝吶Ν險ｭ螳夲ｼ医い繧ｳ繝ｼ繝・ぅ繧ｪ繝ｳ蠖｢蠑擾ｼ・*/}
                                    {contextMenu.memberId && (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
                                            <button
                                                onClick={() => setIsExclusionSettingsOpen(!isExclusionSettingsOpen)}
                                                className="w-full flex items-center justify-between gap-3 p-3 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <MdBlock size={20} className="text-gray-500" />
                                                    <div className="text-sm font-bold">髯､螟悶Λ繝吶Ν險ｭ螳・/div>
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
                                                                繝√ぉ繝・け縺励◆菴懈･ｭ縺ｫ縺ｯ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｾ縺帙ｓ
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

                                    {/* 陦後・險ｭ螳壼､画峩 - 繝｡繝ｳ繝舌・邱ｨ髮・凾縺ｫ縺ｯ荳崎ｦ√↑縺ｮ縺ｧ蜑企勁 */}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 譌｢蟄倥・繝｡繝ｳ繝舌・驕ｸ謚槭Γ繝九Η繝ｼ */}
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
                                    {teams.find(t => t.id === showMemberMenu.teamId)?.name}迴ｭ - {taskLabels.find(l => l.id === showMemberMenu.taskLabelId)?.leftLabel}
                                </div>
                                <button onClick={() => setShowMemberMenu(null)}><MdClose /></button>
                            </div>
                            
                            {/* 譁ｰ隕剰ｿｽ蜉 */}
                            <div className="flex gap-2 mb-4 pb-4 border-b border-gray-100">
                                <input
                                    className="flex-1 border rounded px-3 py-2 text-sm text-gray-900"
                                    placeholder="譁ｰ隕上Γ繝ｳ繝舌・蜷・
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
                                    // 縺吶〒縺ｫ莉悶・繧ｿ繧ｹ繧ｯ縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ縺九←縺・°繧堤｢ｺ隱・                                    // 窶ｻ迴ｾ蝨ｨ縺ｮ繧ｻ繝ｫ縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ繝｡繝ｳ繝舌・繧ゅΜ繧ｹ繝医°繧蛾勁螟悶☆繧九↑繧峨％縺薙〒蛻､螳・                                    // 縺溘□縺励∫樟蝨ｨ縺ｮ繧ｻ繝ｫ縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ繝｡繝ｳ繝舌・繧定｡ｨ遉ｺ縺吶ｋ縺九←縺・°縺ｯ隕∽ｻｶ谺｡隨ｬ縺ｧ縺吶′
                                    // 縲瑚ｿｽ蜉貂医∩縲搾ｼ昴後←縺薙°縺ｮ繧ｻ繝ｫ縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ縲阪→縺・≧諢丞袖縺ｧ縺ゅｌ縺ｰ莉･荳九・繧医≧縺ｫ繝輔ぅ繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ
                                    
                                    // 繧ゅ＠縲後％縺ｮ繝√・繝縺ｮ縺薙・繧ｿ繧ｹ繧ｯ縺ｫ譌｢縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ莠ｺ縺ｯ陦ｨ遉ｺ縺励↑縺・阪→縺・≧諢丞袖縺ｧ縺ゅｌ縺ｰ
                                    // assignments.find(a => a.teamId === showMemberMenu.teamId && a.taskLabelId === showMemberMenu.taskLabelId)?.memberId === m.id
                                    // 縺ｧ蛻､螳壹〒縺阪∪縺吶′縲・壼ｸｸ繝｡繝ｳ繝舌・繝ｪ繧ｹ繝医↓縺ｯ蜈ｨ蜩｡陦ｨ遉ｺ縺励※驕ｸ謚樒憾諷九ｒ螟峨∴繧九％縺ｨ縺悟､壹＞縺ｧ縺吶・
                                    // 繝ｪ繧ｯ繧ｨ繧ｹ繝医後☆縺ｧ縺ｫ霑ｽ蜉縺壹∩縺ｮ繝｡繝ｳ繝舌・縺ｧ縺ゅｌ縺ｰ髱櫁｡ｨ遉ｺ縲阪・隗｣驥茨ｼ・                                    // 1. 蜈ｨ縺ｦ縺ｮ蜑ｲ繧雁ｽ薙※迥ｶ豕√ｒ隕九※縲√←縺薙°縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ繝｡繝ｳ繝舌・縺ｯ陦ｨ遉ｺ縺励↑縺・ｼ・                                    // 2. 縺ｾ縺溘・縲√％縺ｮ繧ｻ繝ｫ縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ繝｡繝ｳ繝舌・縺ｯ陦ｨ遉ｺ縺励↑縺・ｼ滂ｼ医％繧後・騾壼ｸｸ蜈･繧梧崛縺育畑騾斐〒菴ｿ縺・・縺ｧ驕輔≧縺九ｂ・・                                    // 3. 繝｡繝ｳ繝舌・繝ｪ繧ｹ繝茨ｼ・embers・芽・菴薙・蜈ｨ蜩｡蛻・≠繧九′縲∫判髱｢荳翫・繝ｪ繧ｹ繝医↓縺ｯ縲梧悴蜑ｲ繧雁ｽ薙※縺ｮ繝｡繝ｳ繝舌・縲阪□縺大・縺励◆縺・ｼ・
                                    // 譁・ц縺九ｉ縲後Γ繝ｳ繝舌・驕ｸ謚槭Γ繝九Η繝ｼ縲阪・縲悟牡繧雁ｽ薙※繧倶ｺｺ繧帝∈縺ｶ縲榊ｴ謇縺ｪ縺ｮ縺ｧ縲・                                    // 縲後☆縺ｧ縺ｫ莉悶・蝣ｴ謇縺ｫ蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ莠ｺ縲阪ｒ陦ｨ遉ｺ縺吶ｋ縺九←縺・°縺後・繧､繝ｳ繝医・                                    // RoastPlus縺ｮ莉墓ｧ倅ｸ翫∽ｸ莠ｺ縺ｮ繝｡繝ｳ繝舌・縺ｯ荳縺､縺ｮ繧ｿ繧ｹ繧ｯ縺励°諡・ｽ薙〒縺阪↑縺・ｼ磯㍾隍・ｸ榊庄・牙宛邏・′縺ゅｋ縺九←縺・°縺ｫ繧医ｊ縺ｾ縺吶′縲・                                    // 騾壼ｸｸ縺ｯ驥崎､・ｸ榊庄縺ｪ繧峨悟牡繧雁ｽ薙※貂医∩縲阪→縺励※繧ｰ繝ｬ繝ｼ繧｢繧ｦ繝医☆繧九°髱櫁｡ｨ遉ｺ縺ｫ縺励∪縺吶・                                    
                                    // 縺薙％縺ｧ縺ｯ縲後☆縺ｧ縺ｫ霑ｽ蜉縺壹∩縺ｮ繝｡繝ｳ繝舌・縲搾ｼ昴径ssignments 繝・・繝悶Ν縺ｫ memberId 縺悟ｭ伜惠縺吶ｋ繝｡繝ｳ繝舌・縲阪→隗｣驥医＠縲・                                    // 縺昴・繝｡繝ｳ繝舌・繧偵Μ繧ｹ繝医°繧蛾勁螟厄ｼ磯撼陦ｨ遉ｺ・峨↓縺吶ｋ螳溯｣・ｒ陦後＞縺ｾ縺吶・                                    
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
                                                    if (confirm(`${m.name}繧貞炎髯､縺励∪縺吶°・歃n蜑ｲ繧雁ｽ薙※縺九ｉ繧りｧ｣髯､縺輔ｌ縺ｾ縺吶Ａ)) {
                                                        await onDeleteMember(m.id);
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                title="繝｡繝ｳ繝舌・繧貞炎髯､"
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

            {/* 繝√・繝邱ｨ髮・蜑企勁繝｢繝ｼ繝繝ｫ */}
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
                            <h3 className="text-lg font-bold text-gray-800 mb-4">迴ｭ縺ｮ邱ｨ髮・/h3>
                            
                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">迴ｭ蜷・/label>
                                <input 
                                    className="w-full p-2 border border-gray-300 rounded text-lg text-gray-800"
                                    value={activeTeamName}
                                    onChange={e => setActiveTeamName(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">蟷・px)</label>
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
                                    譖ｴ譁ｰ縺吶ｋ
                                </button>
                                <button 
                                    onClick={handleDeleteTeamFromModal}
                                    className="w-full py-3 bg-gray-100 text-red-500 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                                >
                                    <MdDelete size={20} />
                                    縺薙・迴ｭ繧貞炎髯､
                                </button>
                                <button 
                                    onClick={() => setActiveTeamActionId(null)}
                                    className="w-full py-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                                >
                                    繧ｭ繝｣繝ｳ繧ｻ繝ｫ
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 蟷・ｨｭ螳壹Δ繝ｼ繝繝ｫ */}
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
                                <button onClick={() => setWidthConfig(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">繧ｭ繝｣繝ｳ繧ｻ繝ｫ</button>
                                <button onClick={() => handleSaveWidth(widthConfig.currentWidth)} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">菫晏ｭ・/button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 鬮倥＆險ｭ螳壹Δ繝ｼ繝繝ｫ */}
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
                                    {heightConfig.editMode === 'left' ? '蟾ｦ繝ｩ繝吶Ν蜷・ : '蜿ｳ繝ｩ繝吶Ν蜷・}
                                </label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded text-lg text-gray-900"
                                    value={heightConfig.currentName}
                                    onChange={e => setHeightConfig({ ...heightConfig, currentName: e.target.value })}
                                    placeholder={heightConfig.editMode === 'left' ? '蟾ｦ繝ｩ繝吶Ν繧貞・蜉・ : '蜿ｳ繝ｩ繝吶Ν繧貞・蜉幢ｼ井ｻｻ諢擾ｼ・}
                                />
                                {heightConfig.editMode === 'right' && (
                                    <p className="text-xs text-gray-500 mt-1">蜿ｳ繝ｩ繝吶Ν縺ｯ莉ｻ諢上〒縺吶らｩｺ谺・↓縺吶ｋ縺ｨ蜑企勁縺輔ｌ縺ｾ縺吶・/p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">鬮倥＆(px)</label>
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
                                        // 蜿ｳ繝ｩ繝吶Ν縺ｮ蜑企勁
                                        if (confirm('縺薙・菴懈･ｭ繝ｩ繝吶Ν繧貞炎髯､縺励∪縺吶°・歃n・亥・縺ｦ縺ｮ繝√・繝縺九ｉ蜑企勁縺輔ｌ縺ｾ縺呻ｼ・)) {
                                            onDeleteTaskLabel(heightConfig.taskLabelId);
                                            setHeightConfig(null);
                                        }
                                    }} className="flex-1 py-2 bg-gray-100 text-red-500 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2">
                                        <MdDelete size={20} />
                                        蜑企勁
                                    </button>
                                    <button onClick={() => setHeightConfig(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">繧ｭ繝｣繝ｳ繧ｻ繝ｫ</button>
                                    <button onClick={() => handleSaveRowConfig(heightConfig.currentHeight, heightConfig.currentName)} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">菫晏ｭ・/button>
                                </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


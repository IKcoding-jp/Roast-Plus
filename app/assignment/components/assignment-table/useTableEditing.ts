import { useState, useCallback } from 'react';
import { Team, TaskLabel, Member, TableSettings } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_TABLE_SETTINGS, WidthConfig, HeightConfig } from './types';

type UseTableEditingParams = {
    teams: Team[];
    taskLabels: TaskLabel[];
    tableSettings: TableSettings | null;
    onUpdateTableSettings: (settings: TableSettings) => Promise<void>;
    onUpdateTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onAddTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onDeleteTaskLabel: (taskLabelId: string) => Promise<void>;
    onAddTeam: (team: Team) => Promise<void>;
    onDeleteTeam: (teamId: string) => Promise<void>;
    onUpdateTeam: (team: Team) => Promise<void>;
    onAddMember: (member: Member) => Promise<void>;
    onUpdateMember: (assignment: { teamId: string; taskLabelId: string; memberId: null; assignedDate: string }, memberId: string) => Promise<void>;
};

export function useTableEditing({
    teams,
    taskLabels,
    tableSettings,
    onUpdateTableSettings,
    onUpdateTaskLabel,
    onAddTaskLabel,
    onDeleteTaskLabel,
    onAddTeam,
    onDeleteTeam,
    onUpdateTeam,
    onAddMember,
    onUpdateMember,
}: UseTableEditingParams) {
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

    // メンバー選択メニュー
    const [showMemberMenu, setShowMemberMenu] = useState<{ taskLabelId: string, teamId: string } | null>(null);
    const [newMemberName, setNewMemberName] = useState('');

    // 幅設定モーダル用
    const [widthConfig, setWidthConfig] = useState<WidthConfig | null>(null);

    // 高さ設定モーダル用
    const [heightConfig, setHeightConfig] = useState<HeightConfig | null>(null);

    // 幅変更保存 + ヘッダー名更新
    const handleSaveWidth = useCallback(async (width: number, headerName?: string) => {
        if (!widthConfig) return;

        const currentSettings: TableSettings = tableSettings || DEFAULT_TABLE_SETTINGS;

        const newSettings: TableSettings = {
            ...currentSettings,
            colWidths: {
                ...currentSettings.colWidths,
                teams: { ...currentSettings.colWidths.teams }
            },
            rowHeights: { ...currentSettings.rowHeights },
            headerLabels: { ...currentSettings.headerLabels }
        };

        if (widthConfig.type === 'taskLabel') {
            newSettings.colWidths.taskLabel = width;
            if (headerName !== undefined) {
                newSettings.headerLabels.left = headerName.trim() || DEFAULT_TABLE_SETTINGS.headerLabels.left;
            }
        } else if (widthConfig.type === 'note') {
            newSettings.colWidths.note = width;
            if (headerName !== undefined) {
                newSettings.headerLabels.right = headerName.trim() || DEFAULT_TABLE_SETTINGS.headerLabels.right;
            }
        } else if (widthConfig.type === 'team' && widthConfig.id) {
            newSettings.colWidths.teams[widthConfig.id] = width;
        }

        await onUpdateTableSettings(newSettings);
        setWidthConfig(null);
    }, [widthConfig, tableSettings, onUpdateTableSettings]);

    // 行設定（高さ・名前）保存
    const handleSaveRowConfig = useCallback(async (height: number, name: string) => {
        if (!heightConfig) return;

        const currentSettings: TableSettings = tableSettings || DEFAULT_TABLE_SETTINGS;

        const newSettings: TableSettings = {
            ...currentSettings,
            rowHeights: { ...currentSettings.rowHeights },
            headerLabels: { ...currentSettings.headerLabels }
        };

        newSettings.rowHeights[heightConfig.taskLabelId] = height;
        await onUpdateTableSettings(newSettings);

        const label = taskLabels.find(l => l.id === heightConfig.taskLabelId);
        if (label) {
            if (heightConfig.editMode === 'left') {
                if (name.trim() && name !== label.leftLabel) {
                    await onUpdateTaskLabel({
                        ...label,
                        leftLabel: name
                    });
                }
            } else {
                const newRightLabelValue = name.trim() || null;
                if (newRightLabelValue !== label.rightLabel) {
                    await onUpdateTaskLabel({
                        ...label,
                        rightLabel: newRightLabelValue
                    });
                }
            }
        }

        setHeightConfig(null);
    }, [heightConfig, tableSettings, taskLabels, onUpdateTableSettings, onUpdateTaskLabel]);

    // ラベル編集開始
    const startEditLabel = useCallback((label: TaskLabel) => {
        setEditingLabelId(label.id);
        setEditLeftLabel(label.leftLabel);
        setEditRightLabel(label.rightLabel || '');
    }, []);

    // ラベル保存
    const saveLabel = useCallback(async (labelId: string) => {
        const label = taskLabels.find(l => l.id === labelId);
        if (label) {
            await onUpdateTaskLabel({
                ...label,
                leftLabel: editLeftLabel,
                rightLabel: editRightLabel || null
            });
        }
        setEditingLabelId(null);
    }, [taskLabels, onUpdateTaskLabel, editLeftLabel, editRightLabel]);

    // 新規ラベル追加
    const handleAddTaskLabel = useCallback(async () => {
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
    }, [newLeftLabel, newRightLabel, taskLabels, onAddTaskLabel]);

    // 新規メンバー追加 & 割り当て
    const handleAddMember = useCallback(async (taskLabelId: string, teamId: string) => {
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
            assignedDate: ''
        }, newMember.id);

        setNewMemberName('');
        setShowMemberMenu(null);
    }, [newMemberName, onAddMember, onUpdateMember]);

    // チーム追加
    const handleAddTeam = useCallback(async () => {
        const maxOrder = teams.length > 0 ? Math.max(...teams.map(t => t.order || 0)) : 0;
        const newTeam: Team = {
            id: uuidv4(),
            name: newTeamName.trim(),
            order: maxOrder + 1
        };

        await onAddTeam(newTeam);
        setNewTeamName('');
        setIsAddingTeam(false);
    }, [teams, newTeamName, onAddTeam]);

    // チーム更新 (インライン)
    const handleUpdateTeam = useCallback(async (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (team) {
            await onUpdateTeam({ ...team, name: editTeamName.trim() });
        }
        setEditingTeamId(null);
    }, [teams, editTeamName, onUpdateTeam]);

    // チーム更新 (モーダル経由)
    const handleUpdateTeamFromModal = useCallback(async () => {
        if (!activeTeamActionId) return;

        const team = teams.find(t => t.id === activeTeamActionId);
        if (team) {
            await onUpdateTeam({ ...team, name: activeTeamName.trim() });
        }
        setActiveTeamActionId(null);
    }, [activeTeamActionId, teams, activeTeamName, onUpdateTeam]);

    // チーム削除 (モーダル経由)
    const handleDeleteTeamFromModal = useCallback(async () => {
        if (!activeTeamActionId) return;

        if (confirm('本当に削除しますか？\n所属するメンバーも削除されます。')) {
            await onDeleteTeam(activeTeamActionId);
            setActiveTeamActionId(null);
        }
    }, [activeTeamActionId, onDeleteTeam]);

    // 削除確認
    const handleDeleteTaskLabel = useCallback(async (id: string) => {
        if (confirm('この作業ラベルを削除しますか？\n（全てのチームから削除されます）')) {
            await onDeleteTaskLabel(id);
        }
    }, [onDeleteTaskLabel]);

    return {
        // ラベル関連
        newLeftLabel, setNewLeftLabel,
        newRightLabel, setNewRightLabel,
        editingLabelId, editLeftLabel, setEditLeftLabel,
        editRightLabel, setEditRightLabel,
        startEditLabel, saveLabel,
        handleAddTaskLabel, handleDeleteTaskLabel,

        // チーム関連
        newTeamName, setNewTeamName,
        isAddingTeam, setIsAddingTeam,
        editingTeamId, setEditingTeamId,
        editTeamName, setEditTeamName,
        activeTeamActionId, setActiveTeamActionId,
        activeTeamName, setActiveTeamName,
        handleAddTeam, handleUpdateTeam,
        handleUpdateTeamFromModal, handleDeleteTeamFromModal,

        // メンバーメニュー
        showMemberMenu, setShowMemberMenu,
        newMemberName, setNewMemberName,
        handleAddMember,

        // 幅・高さ設定
        widthConfig, setWidthConfig,
        heightConfig, setHeightConfig,
        handleSaveWidth, handleSaveRowConfig,
    };
}

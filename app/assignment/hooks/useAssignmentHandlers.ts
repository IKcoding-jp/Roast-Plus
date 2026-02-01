import { useCallback } from 'react';
import { Team, Member, TaskLabel, Assignment, TableSettings } from '@/types';
import {
    updateMemberExclusions,
    mutateAssignmentDay,
    addMember, deleteMember, updateMember, updateMemberTeam,
    addTaskLabel, deleteTaskLabel, updateTaskLabel,
    addTeam, deleteTeam, updateTeam, updateTableSettings,
} from '../lib/firebase';

type UseAssignmentHandlersParams = {
    userId: string | null;
    activeDate: string;
    todayDate: string;
    members: Member[];
    setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
    setTaskLabels: React.Dispatch<React.SetStateAction<TaskLabel[]>>;
};

export function useAssignmentHandlers({
    userId,
    activeDate,
    todayDate,
    members,
    setMembers,
    setTeams,
    setTaskLabels,
}: UseAssignmentHandlersParams) {
    // 割り当ての更新
    const handleUpdateMember = useCallback(async (targetAsg: Assignment, memberId: string | null) => {
        if (!userId || !activeDate) return;

        await mutateAssignmentDay(userId, activeDate, (current) => {
            const map = new Map<string, Assignment>();
            current.forEach(a => {
                map.set(`${a.teamId}__${a.taskLabelId}`, { ...a, assignedDate: activeDate });
            });

            map.set(`${targetAsg.teamId}__${targetAsg.taskLabelId}`, {
                teamId: targetAsg.teamId,
                taskLabelId: targetAsg.taskLabelId,
                memberId,
                assignedDate: activeDate,
            });

            return Array.from(map.values());
        });
    }, [userId, activeDate]);

    // メンバー名変更
    const handleUpdateMemberName = useCallback(async (memberId: string, name: string) => {
        if (!userId) return;

        const member = members.find(m => m.id === memberId);
        if (member) {
            const updated = { ...member, name };
            await updateMember(userId, updated);
            setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
        }
    }, [userId, members, setMembers]);

    // 除外設定変更
    const handleUpdateMemberExclusion = useCallback(async (memberId: string, taskLabelId: string, isExcluded: boolean) => {
        if (!userId) return;

        const member = members.find(m => m.id === memberId);
        if (member) {
            let newExclusions = [...member.excludedTaskLabelIds];
            if (isExcluded) {
                if (!newExclusions.includes(taskLabelId)) newExclusions.push(taskLabelId);
            } else {
                newExclusions = newExclusions.filter(id => id !== taskLabelId);
            }
            await updateMemberExclusions(userId, memberId, newExclusions);
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, excludedTaskLabelIds: newExclusions } : m));
        }
    }, [userId, members, setMembers]);

    // 割り当ての入れ替え
    const handleSwapAssignments = useCallback(async (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => {
        if (!userId || !activeDate) return;

        let mem1: string | null = null;
        let mem2: string | null = null;

        const { changed } = await mutateAssignmentDay(userId, activeDate, (current) => {
            const map = new Map<string, Assignment>();
            current.forEach(a => {
                map.set(`${a.teamId}__${a.taskLabelId}`, { ...a, assignedDate: activeDate });
            });

            mem1 = map.get(`${asg1.teamId}__${asg1.taskLabelId}`)?.memberId ?? null;
            mem2 = map.get(`${asg2.teamId}__${asg2.taskLabelId}`)?.memberId ?? null;

            map.set(`${asg1.teamId}__${asg1.taskLabelId}`, {
                teamId: asg1.teamId,
                taskLabelId: asg1.taskLabelId,
                memberId: mem2,
                assignedDate: activeDate,
            });

            map.set(`${asg2.teamId}__${asg2.taskLabelId}`, {
                teamId: asg2.teamId,
                taskLabelId: asg2.taskLabelId,
                memberId: mem1,
                assignedDate: activeDate,
            });

            return Array.from(map.values());
        });

        const isCrossTeamSwap = asg1.teamId !== asg2.teamId;
        if (!changed || !isCrossTeamSwap) return;

        const updates: Promise<void>[] = [];
        const memberUpdates: { id: string, teamId: string }[] = [];

        if (mem1) {
            const currentTeam = members.find(m => m.id === mem1)?.teamId;
            if (currentTeam !== asg2.teamId) {
                updates.push(updateMemberTeam(userId, mem1, asg2.teamId));
                memberUpdates.push({ id: mem1, teamId: asg2.teamId });
            }
        }

        if (mem2) {
            const currentTeam = members.find(m => m.id === mem2)?.teamId;
            if (currentTeam !== asg1.teamId) {
                updates.push(updateMemberTeam(userId, mem2, asg1.teamId));
                memberUpdates.push({ id: mem2, teamId: asg1.teamId });
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
            if (memberUpdates.length > 0) {
                setMembers(prev => prev.map(m => {
                    const update = memberUpdates.find(u => u.id === m.id);
                    return update ? { ...m, teamId: update.teamId } : m;
                }));
            }
        }
    }, [userId, activeDate, members, setMembers]);

    // CRUD コールバック
    const handleAddMember = useCallback(async (member: Member) => {
        if (!userId) return;
        await addMember(userId, member);
        setMembers(prev => [...prev, member]);
    }, [userId, setMembers]);

    const handleDeleteMember = useCallback(async (memberId: string) => {
        if (!userId) return;
        await deleteMember(userId, memberId, activeDate || todayDate);
        setMembers(prev => prev.filter(m => m.id !== memberId));
    }, [userId, activeDate, todayDate, setMembers]);

    const handleUpdateTaskLabel = useCallback(async (label: TaskLabel) => {
        if (!userId) return;
        await updateTaskLabel(userId, label);
        setTaskLabels(prev => prev.map(l => l.id === label.id ? label : l));
    }, [userId, setTaskLabels]);

    const handleAddTaskLabel = useCallback(async (label: TaskLabel) => {
        if (!userId) return;
        await addTaskLabel(userId, label);
        setTaskLabels(prev => [...prev, label]);
    }, [userId, setTaskLabels]);

    const handleDeleteTaskLabel = useCallback(async (labelId: string) => {
        if (!userId) return;
        await deleteTaskLabel(userId, labelId);
        setTaskLabels(prev => prev.filter(l => l.id !== labelId));
    }, [userId, setTaskLabels]);

    const handleAddTeam = useCallback(async (team: Team) => {
        if (!userId) return;
        await addTeam(userId, team);
        setTeams(prev => [...prev, team]);
    }, [userId, setTeams]);

    const handleDeleteTeam = useCallback(async (teamId: string) => {
        if (!userId) return;
        await deleteTeam(userId, teamId);
        setTeams(prev => prev.filter(t => t.id !== teamId));
    }, [userId, setTeams]);

    const handleUpdateTeam = useCallback(async (team: Team) => {
        if (!userId) return;
        await updateTeam(userId, team);
        setTeams(prev => prev.map(t => t.id === team.id ? team : t));
    }, [userId, setTeams]);

    const handleUpdateTableSettings = useCallback(async (settings: TableSettings) => {
        if (!userId) return;
        await updateTableSettings(userId, settings);
    }, [userId]);

    return {
        handleUpdateMember,
        handleUpdateMemberName,
        handleUpdateMemberExclusion,
        handleSwapAssignments,
        handleAddMember,
        handleDeleteMember,
        handleUpdateTaskLabel,
        handleAddTaskLabel,
        handleDeleteTaskLabel,
        handleAddTeam,
        handleDeleteTeam,
        handleUpdateTeam,
        handleUpdateTableSettings,
    };
}

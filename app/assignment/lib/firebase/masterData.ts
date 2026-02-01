import {
    doc,
    getDocs,
    query,
    orderBy,
    setDoc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import {
    Team,
    Member,
    TaskLabel,
    AssignmentDay,
} from '@/types';
import {
    getTeamsCollection,
    getMembersCollection,
    getTaskLabelsCollection,
    getAssignmentDaysCollection,
} from './helpers';

// マスタデータ取得
export const fetchTeams = async (userId: string): Promise<Team[]> => {
    try {
        const teamsCol = getTeamsCollection(userId);
        const q = query(teamsCol, orderBy('order'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
    } catch (error) {
        console.error('Failed to fetch teams:', error);
        throw error;
    }
};

export const fetchMembers = async (userId: string): Promise<Member[]> => {
    try {
        const membersCol = getMembersCollection(userId);
        const snapshot = await getDocs(membersCol);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member));
    } catch (error) {
        console.error('Failed to fetch members:', error);
        throw error;
    }
};

export const fetchTaskLabels = async (userId: string): Promise<TaskLabel[]> => {
    try {
        const taskLabelsCol = getTaskLabelsCollection(userId);
        const q = query(taskLabelsCol, orderBy('order'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskLabel));
    } catch (error) {
        console.error('Failed to fetch task labels:', error);
        throw error;
    }
};

// メンバー除外設定
export const updateMemberExclusions = async (userId: string, memberId: string, excludedTaskLabelIds: string[]) => {
    try {
        const membersCol = getMembersCollection(userId);
        const docRef = doc(membersCol, memberId);
        await updateDoc(docRef, { excludedTaskLabelIds });
    } catch (error) {
        console.error('Failed to update member exclusions:', error);
        throw error;
    }
};

// メンバーチーム変更
export const updateMemberTeam = async (userId: string, memberId: string, newTeamId: string) => {
    try {
        const membersCol = getMembersCollection(userId);
        const docRef = doc(membersCol, memberId);
        await updateDoc(docRef, { teamId: newTeamId });
    } catch (error) {
        console.error('Failed to update member team:', error);
        throw error;
    }
};

// チーム管理
export const addTeam = async (userId: string, team: Team) => {
    try {
        const teamsCol = getTeamsCollection(userId);
        const docRef = doc(teamsCol, team.id);
        await setDoc(docRef, team);
    } catch (error) {
        console.error('Failed to add team:', error);
        throw error;
    }
};

export const deleteTeam = async (userId: string, teamId: string) => {
    try {
        const teamsCol = getTeamsCollection(userId);
        const docRef = doc(teamsCol, teamId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Failed to delete team:', error);
        throw error;
    }
};

export const updateTeam = async (userId: string, team: Team) => {
    try {
        const teamsCol = getTeamsCollection(userId);
        const docRef = doc(teamsCol, team.id);
        await updateDoc(docRef, { ...team });
    } catch (error) {
        console.error('Failed to update team:', error);
        throw error;
    }
};

// メンバー管理
export const addMember = async (userId: string, member: Member) => {
    try {
        const membersCol = getMembersCollection(userId);
        const docRef = doc(membersCol, member.id);
        await setDoc(docRef, member);
    } catch (error) {
        console.error('Failed to add member:', error);
        throw error;
    }
};

export const deleteMember = async (userId: string, memberId: string, dateStr?: string) => {
    try {
        const membersCol = getMembersCollection(userId);
        const docRef = doc(membersCol, memberId);
        await deleteDoc(docRef);

        // 指定された日付（今日）の割り当てからも削除する
        if (dateStr) {
            const assignmentDaysCol = getAssignmentDaysCollection(userId);
            const assignmentDocRef = doc(assignmentDaysCol, dateStr);
            const snapshot = await import('firebase/firestore').then(m => m.getDoc(assignmentDocRef));

            if (snapshot.exists()) {
                const data = snapshot.data() as AssignmentDay;
                const assignments = data.assignments || [];

                // 該当メンバーの割り当てを探す
                const updatedAssignments = assignments.map(a => {
                    if (a.memberId === memberId) {
                        return { ...a, memberId: null };
                    }
                    return a;
                });

                // 変更があった場合のみ更新
                if (JSON.stringify(assignments) !== JSON.stringify(updatedAssignments)) {
                    await updateDoc(assignmentDocRef, { assignments: updatedAssignments });
                }
            }
        }
    } catch (error) {
        console.error('Failed to delete member:', error);
        throw error;
    }
};

export const updateMember = async (userId: string, member: Member) => {
    try {
        const membersCol = getMembersCollection(userId);
        const docRef = doc(membersCol, member.id);
        await updateDoc(docRef, { ...member });
    } catch (error) {
        console.error('Failed to update member:', error);
        throw error;
    }
};

// 作業ラベル管理
export const addTaskLabel = async (userId: string, taskLabel: TaskLabel) => {
    try {
        const taskLabelsCol = getTaskLabelsCollection(userId);
        const docRef = doc(taskLabelsCol, taskLabel.id);
        await setDoc(docRef, taskLabel);
    } catch (error) {
        console.error('Failed to add task label:', error);
        throw error;
    }
};

export const deleteTaskLabel = async (userId: string, taskLabelId: string) => {
    try {
        const taskLabelsCol = getTaskLabelsCollection(userId);
        const docRef = doc(taskLabelsCol, taskLabelId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Failed to delete task label:', error);
        throw error;
    }
};

export const updateTaskLabel = async (userId: string, taskLabel: TaskLabel) => {
    try {
        const taskLabelsCol = getTaskLabelsCollection(userId);
        const docRef = doc(taskLabelsCol, taskLabel.id);
        await updateDoc(docRef, { ...taskLabel });
    } catch (error) {
        console.error('Failed to update task label:', error);
        throw error;
    }
};

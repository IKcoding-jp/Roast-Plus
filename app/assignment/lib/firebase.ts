import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    where,
    limit,
    deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Team,
    Member,
    TaskLabel,
    AssignmentDay,
    ShuffleEvent,
    Assignment,
    TableSettings
} from '@/types';

// コレクション参照
const teamsCol = collection(db, 'teams');
const membersCol = collection(db, 'members');
const taskLabelsCol = collection(db, 'taskLabels');
const assignmentDaysCol = collection(db, 'assignmentDays');
const shuffleEventsCol = collection(db, 'shuffleEvents');

// マスタデータ取得
export const fetchTeams = async (): Promise<Team[]> => {
    const q = query(teamsCol, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
};

export const fetchMembers = async (): Promise<Member[]> => {
    const snapshot = await getDocs(membersCol);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member));
};

export const fetchTaskLabels = async (): Promise<TaskLabel[]> => {
    const q = query(taskLabelsCol, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskLabel));
};

// リアルタイム監視
export const subscribeAssignmentDay = (date: string, callback: (data: AssignmentDay | null) => void) => {
    const docRef = doc(assignmentDaysCol, date);
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            callback({ ...snap.data(), date: snap.id } as AssignmentDay);
        } else {
            callback(null);
        }
    });
};

export const subscribeShuffleEvent = (date: string, callback: (data: ShuffleEvent | null) => void) => {
    const docRef = doc(shuffleEventsCol, date);
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            callback({ ...snap.data(), date: snap.id } as ShuffleEvent);
        } else {
            callback(null);
        }
    });
};

// 更新系
export const updateAssignmentDay = async (date: string, assignments: Assignment[]) => {
    const docRef = doc(assignmentDaysCol, date);
    await setDoc(docRef, {
        assignments,
        updatedAt: serverTimestamp(),
        // createdAtは既存なら更新しない、新規なら設定したいが、setDoc(merge: true)だとcreatedAtが消えるリスクはないが
        // ここでは簡易的に updatedAt だけ更新し、createdAtがない場合は serverTimestamp() を入れるロジックにする
    }, { merge: true });

    // createdAt がない場合（新規作成時）の補完は別途考えるか、初期化時に行う
    // 今回は setDoc with merge なので、初回は createdAt が入らない可能性があるが、
    // 読み込み側で必須としていないので許容、あるいは初回作成ロジックを分ける
};

export const createShuffleEvent = async (event: ShuffleEvent) => {
    const docRef = doc(shuffleEventsCol, event.date);
    await setDoc(docRef, event);
};

export const updateShuffleEventState = async (date: string, state: 'running' | 'done') => {
    const docRef = doc(shuffleEventsCol, date);
    await updateDoc(docRef, { state });
};

export const updateMemberExclusions = async (memberId: string, excludedTaskLabelIds: string[]) => {
    const docRef = doc(membersCol, memberId);
    await updateDoc(docRef, { excludedTaskLabelIds });
};

// チーム管理
export const addTeam = async (team: Team) => {
    const docRef = doc(teamsCol, team.id);
    await setDoc(docRef, team);
};

export const deleteTeam = async (teamId: string) => {
    const docRef = doc(teamsCol, teamId);
    await deleteDoc(docRef);
};

export const updateTeam = async (team: Team) => {
    const docRef = doc(teamsCol, team.id);
    await updateDoc(docRef, { ...team });
};

// メンバー管理
export const addMember = async (member: Member) => {
    const docRef = doc(membersCol, member.id);
    await setDoc(docRef, member);
};

export const deleteMember = async (memberId: string, dateStr?: string) => {
    const docRef = doc(membersCol, memberId);
    await deleteDoc(docRef);

    // 指定された日付（今日）の割り当てからも削除する
    if (dateStr) {
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
};

export const updateMember = async (member: Member) => {
    const docRef = doc(membersCol, member.id);
    await updateDoc(docRef, { ...member });
};

// 作業ラベル管理
export const addTaskLabel = async (taskLabel: TaskLabel) => {
    const docRef = doc(taskLabelsCol, taskLabel.id);
    await setDoc(docRef, taskLabel);
};

export const deleteTaskLabel = async (taskLabelId: string) => {
    const docRef = doc(taskLabelsCol, taskLabelId);
    await deleteDoc(docRef);
};

export const updateTaskLabel = async (taskLabel: TaskLabel) => {
    const docRef = doc(taskLabelsCol, taskLabel.id);
    await updateDoc(docRef, { ...taskLabel });
};

// 過去の履歴を取得（公平性ロジック用）
export const fetchRecentAssignments = async (endDate: string, days: number): Promise<AssignmentDay[]> => {
    // endDate より前の直近 n 日分を取得
    // date 文字列比較で簡易的にフィルタリング
    // 実際は where('date', '<', endDate) 等を使うが、dateがドキュメントIDなので where(documentId(), ...) が必要
    // ここでは簡易的に、コレクション全体から日付でフィルタするか、
    // 日付文字列生成して個別にgetするか。
    // daysが少ない(7日)ので、個別にgetDocsする方が確実かつ低コストかも。

    const promises = [];
    const targetDate = new Date(endDate);

    for (let i = 1; i <= days; i++) {
        const d = new Date(targetDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        promises.push(getDocs(query(assignmentDaysCol, where('__name__', '==', dateStr))));
    }

    const snapshots = await Promise.all(promises);
    const results: AssignmentDay[] = [];

    snapshots.forEach(snap => {
        if (!snap.empty) {
            snap.forEach(d => results.push({ ...d.data(), date: d.id } as AssignmentDay));
        }
    });

    return results;
};

// テーブル設定管理
const settingsCol = collection(db, 'assignmentSettings');

export const subscribeTableSettings = (callback: (settings: TableSettings | null) => void) => {
    const docRef = doc(settingsCol, 'table');
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            callback(snap.data() as TableSettings);
        } else {
            // デフォルト値を返す
            callback({
                colWidths: {
                    taskLabel: 120,
                    note: 120,
                    teams: {}
                },
                rowHeights: {}
            });
        }
    });
};

export const updateTableSettings = async (settings: TableSettings) => {
    const docRef = doc(settingsCol, 'table');
    await setDoc(docRef, settings, { merge: true });
};

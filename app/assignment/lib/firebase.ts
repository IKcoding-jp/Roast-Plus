import {
    collection,
    doc,
    getDoc,
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
    deleteDoc,
    runTransaction,
    documentId
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Team,
    Member,
    TaskLabel,
    AssignmentDay,
    ShuffleEvent,
    ShuffleHistory,
    Assignment,
    TableSettings,
    Manager
} from '@/types';

// ===== ヘルパー関数: ユーザー配下のコレクション参照 =====
function getUserAssignmentRoot(userId: string) {
    return doc(db, 'users', userId);
}

function getTeamsCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'teams');
}

function getMembersCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'members');
}

function getTaskLabelsCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'taskLabels');
}

function getAssignmentDaysCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'assignmentDays');
}

function getShuffleEventsCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'shuffleEvents');
}

function getShuffleHistoryCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'shuffleHistory');
}

function getAssignmentSettingsCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'assignmentSettings');
}

function getManagersCollection(userId: string) {
    return collection(getUserAssignmentRoot(userId), 'managers');
}

const assignmentKey = (teamId: string, taskLabelId: string) => `${teamId}__${taskLabelId}`;

const normalizeAssignmentsForDate = (assignments: Assignment[], date: string): Assignment[] => {
    const map = new Map<string, Assignment>();
    assignments.forEach((a) => {
        map.set(
            assignmentKey(a.teamId, a.taskLabelId),
            { ...a, assignedDate: date, memberId: a.memberId ?? null }
        );
    });
    return Array.from(map.values());
};

const sortAssignmentsStable = (assignments: Assignment[]) =>
    [...assignments].sort((a, b) => {
        const teamDiff = a.teamId.localeCompare(b.teamId);
        if (teamDiff !== 0) return teamDiff;
        return a.taskLabelId.localeCompare(b.taskLabelId);
    });

const areAssignmentsEqual = (a: Assignment[], b: Assignment[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        const aItem = a[i];
        const bItem = b[i];
        if (
            aItem.teamId !== bItem.teamId ||
            aItem.taskLabelId !== bItem.taskLabelId ||
            aItem.memberId !== bItem.memberId
        ) {
            return false;
        }
    }
    return true;
};

export const getServerTodayDate = async (timeZone: string = "Asia/Tokyo"): Promise<string> => {
    // Use a dedicated meta document to fetch server-resolved timestamp
    const metaRef = doc(db, '_meta', 'serverTime');
    await setDoc(metaRef, { now: serverTimestamp() }, { merge: true });
    const snap = await getDoc(metaRef);
    const ts = snap.data()?.now as Timestamp | undefined;
    const date = ts?.toDate() ?? new Date();
    return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
};

export const mutateAssignmentDay = async (
    userId: string,
    date: string,
    updater: (current: Assignment[]) => Assignment[]
): Promise<{ assignments: Assignment[]; changed: boolean }> => {
    const assignmentDaysCol = getAssignmentDaysCollection(userId);
    const docRef = doc(assignmentDaysCol, date);

    return runTransaction(db, async (tx) => {
        const snap = await tx.get(docRef);
        const existingData = snap.exists() ? (snap.data() as AssignmentDay) : undefined;
        const currentRaw = existingData?.assignments ?? [];
        const normalizedCurrent = sortAssignmentsStable(normalizeAssignmentsForDate(currentRaw, date));

        const proposed = sortAssignmentsStable(
            normalizeAssignmentsForDate(updater(currentRaw), date)
        );

        const shouldCreateDoc = !snap.exists();
        const hasDifference = shouldCreateDoc || !areAssignmentsEqual(normalizedCurrent, proposed);

        if (!hasDifference) {
            return { assignments: normalizedCurrent, changed: false };
        }

        tx.set(docRef, {
            date,
            assignments: proposed,
            updatedAt: serverTimestamp(),
            createdAt: existingData?.createdAt ?? serverTimestamp(),
        });

        return { assignments: proposed, changed: true };
    });
};

// マスタデータ取得
export const fetchTeams = async (userId: string): Promise<Team[]> => {
    const teamsCol = getTeamsCollection(userId);
    const q = query(teamsCol, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
};

export const fetchMembers = async (userId: string): Promise<Member[]> => {
    const membersCol = getMembersCollection(userId);
    const snapshot = await getDocs(membersCol);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member));
};

export const fetchTaskLabels = async (userId: string): Promise<TaskLabel[]> => {
    const taskLabelsCol = getTaskLabelsCollection(userId);
    const q = query(taskLabelsCol, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskLabel));
};

// リアルタイム監視
export const subscribeAssignmentDay = (userId: string, date: string, callback: (data: AssignmentDay | null) => void) => {
    const assignmentDaysCol = getAssignmentDaysCollection(userId);
    const docRef = doc(assignmentDaysCol, date);
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            callback({ ...snap.data(), date: snap.id } as AssignmentDay);
        } else {
            callback(null);
        }
    });
};

export const subscribeLatestAssignmentDay = (
    userId: string,
    callback: (data: AssignmentDay | null) => void,
    options?: { onEmpty?: () => Promise<void> }
) => {
    const assignmentDaysCol = getAssignmentDaysCollection(userId);
    const latestQuery = query(assignmentDaysCol, orderBy('updatedAt', 'desc'), limit(1));
    let initializing = false;

    return onSnapshot(latestQuery, async (snap) => {
        if (!snap.empty) {
            const docSnap = snap.docs[0];
            callback({ ...docSnap.data(), date: docSnap.id } as AssignmentDay);
            return;
        }

        callback(null);

        if (options?.onEmpty && !initializing) {
            initializing = true;
            try {
                await options.onEmpty();
            } catch (error) {
                console.error('Failed to initialize first assignment day:', error);
            } finally {
                initializing = false;
            }
        }
    });
};

export const subscribeShuffleEvent = (userId: string, date: string, callback: (data: ShuffleEvent | null) => void) => {
    const shuffleEventsCol = getShuffleEventsCollection(userId);
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
export const updateAssignmentDay = async (userId: string, date: string, assignments: Assignment[]) => {
    await mutateAssignmentDay(userId, date, () => assignments);
};

export const createShuffleEvent = async (userId: string, event: ShuffleEvent) => {
    const shuffleEventsCol = getShuffleEventsCollection(userId);
    const docRef = doc(shuffleEventsCol, event.date);
    await setDoc(docRef, event);
};

export const updateShuffleEventState = async (userId: string, date: string, state: 'running' | 'done') => {
    const shuffleEventsCol = getShuffleEventsCollection(userId);
    const docRef = doc(shuffleEventsCol, date);
    await updateDoc(docRef, { state });
};

export const updateMemberExclusions = async (userId: string, memberId: string, excludedTaskLabelIds: string[]) => {
    const membersCol = getMembersCollection(userId);
    const docRef = doc(membersCol, memberId);
    await updateDoc(docRef, { excludedTaskLabelIds });
};

export const updateMemberTeam = async (userId: string, memberId: string, newTeamId: string) => {
    const membersCol = getMembersCollection(userId);
    const docRef = doc(membersCol, memberId);
    await updateDoc(docRef, { teamId: newTeamId });
};

// チーム管理
export const addTeam = async (userId: string, team: Team) => {
    const teamsCol = getTeamsCollection(userId);
    const docRef = doc(teamsCol, team.id);
    await setDoc(docRef, team);
};

export const deleteTeam = async (userId: string, teamId: string) => {
    const teamsCol = getTeamsCollection(userId);
    const docRef = doc(teamsCol, teamId);
    await deleteDoc(docRef);
};

export const updateTeam = async (userId: string, team: Team) => {
    const teamsCol = getTeamsCollection(userId);
    const docRef = doc(teamsCol, team.id);
    await updateDoc(docRef, { ...team });
};

// メンバー管理
export const addMember = async (userId: string, member: Member) => {
    const membersCol = getMembersCollection(userId);
    const docRef = doc(membersCol, member.id);
    await setDoc(docRef, member);
};

export const deleteMember = async (userId: string, memberId: string, dateStr?: string) => {
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
};

export const updateMember = async (userId: string, member: Member) => {
    const membersCol = getMembersCollection(userId);
    const docRef = doc(membersCol, member.id);
    await updateDoc(docRef, { ...member });
};

// 作業ラベル管理
export const addTaskLabel = async (userId: string, taskLabel: TaskLabel) => {
    const taskLabelsCol = getTaskLabelsCollection(userId);
    const docRef = doc(taskLabelsCol, taskLabel.id);
    await setDoc(docRef, taskLabel);
};

export const deleteTaskLabel = async (userId: string, taskLabelId: string) => {
    const taskLabelsCol = getTaskLabelsCollection(userId);
    const docRef = doc(taskLabelsCol, taskLabelId);
    await deleteDoc(docRef);
};

export const updateTaskLabel = async (userId: string, taskLabel: TaskLabel) => {
    const taskLabelsCol = getTaskLabelsCollection(userId);
    const docRef = doc(taskLabelsCol, taskLabel.id);
    await updateDoc(docRef, { ...taskLabel });
};

// 過去の履歴を取得（公平性ロジック用）
export const fetchRecentAssignments = async (userId: string, endDate: string, days: number): Promise<AssignmentDay[]> => {
    // endDate より前の直近 n 日分を取得
    // date 文字列比較で簡易的にフィルタリング
    // 実際は where('date', '<', endDate) 等を使うが、dateがドキュメントIDなので where(documentId(), ...) が必要
    // ここでは簡易的に、コレクション全体から日付でフィルタするか、
    // 日付文字列生成して個別にgetするか。
    // daysが少ない(7日)ので、個別にgetDocsする方が確実かつ低コストかも。

    const assignmentDaysCol = getAssignmentDaysCollection(userId);
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
export const subscribeTableSettings = (userId: string, callback: (settings: TableSettings | null) => void) => {
    const settingsCol = getAssignmentSettingsCollection(userId);
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

export const updateTableSettings = async (userId: string, settings: TableSettings) => {
    const settingsCol = getAssignmentSettingsCollection(userId);
    const docRef = doc(settingsCol, 'table');
    await setDoc(docRef, settings, { merge: true });
};

// シャッフル履歴管理
export const createShuffleHistory = async (userId: string, history: Omit<ShuffleHistory, 'createdAt'>) => {
    const shuffleHistoryCol = getShuffleHistoryCollection(userId);
    const docRef = doc(shuffleHistoryCol, history.id);
    await setDoc(docRef, {
        ...history,
        createdAt: serverTimestamp(),
    });
};

export const fetchRecentShuffleHistory = async (userId: string, limitCount: number = 2): Promise<ShuffleHistory[]> => {
    const shuffleHistoryCol = getShuffleHistoryCollection(userId);
    try {
        const q = query(shuffleHistoryCol, orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ShuffleHistory));
    } catch (error) {
        // インデックスが作成されていない場合や、createdAtフィールドが存在しない場合のフォールバック
        // 全件取得してソート（データ量が少ない場合のみ有効）
        console.warn('Failed to fetch shuffle history with orderBy, falling back to full fetch:', error);
        const snapshot = await getDocs(shuffleHistoryCol);
        const allHistory = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ShuffleHistory));
        // createdAtでソート（存在しない場合は最後に）
        allHistory.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime; // 降順
        });
        return allHistory.slice(0, limitCount);
    }
};

// ===== 管理者管理 =====
const MANAGER_DOC_ID = 'default'; // 1人のみなので固定ID

/**
 * 管理者をリアルタイム購読
 */
export const subscribeManager = (userId: string, callback: (manager: Manager | null) => void) => {
    const managersCol = getManagersCollection(userId);
    const docRef = doc(managersCol, MANAGER_DOC_ID);
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() } as Manager);
        } else {
            callback(null);
        }
    });
};

/**
 * 管理者を設定（追加/更新）
 */
export const setManager = async (userId: string, name: string): Promise<void> => {
    const managersCol = getManagersCollection(userId);
    const docRef = doc(managersCol, MANAGER_DOC_ID);
    await setDoc(docRef, {
        id: MANAGER_DOC_ID,
        name,
        updatedAt: serverTimestamp(),
    });
};

/**
 * 管理者を削除
 */
export const deleteManager = async (userId: string): Promise<void> => {
    const managersCol = getManagersCollection(userId);
    const docRef = doc(managersCol, MANAGER_DOC_ID);
    await deleteDoc(docRef);
};

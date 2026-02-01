import {
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    deleteDoc,
    serverTimestamp,
    where,
} from 'firebase/firestore';
import {
    TableSettings,
    Manager,
    PairExclusion,
    normalizePairIds,
} from '@/types';
import {
    getAssignmentSettingsCollection,
    getManagersCollection,
    getPairExclusionsCollection,
    toMillisSafe,
    DEFAULT_TABLE_SETTINGS,
} from './helpers';

// テーブル設定管理
export const subscribeTableSettings = (userId: string, callback: (settings: TableSettings | null) => void) => {
    const settingsCol = getAssignmentSettingsCollection(userId);
    const docRef = doc(settingsCol, 'table');
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data() as Partial<TableSettings>;
            callback({
                colWidths: {
                    ...DEFAULT_TABLE_SETTINGS.colWidths,
                    ...data.colWidths,
                    teams: {
                        ...DEFAULT_TABLE_SETTINGS.colWidths.teams,
                        ...(data.colWidths?.teams ?? {})
                    }
                },
                rowHeights: data.rowHeights ?? DEFAULT_TABLE_SETTINGS.rowHeights,
                headerLabels: data.headerLabels ?? DEFAULT_TABLE_SETTINGS.headerLabels,
            });
        } else {
            // デフォルト値を返す
            callback(DEFAULT_TABLE_SETTINGS);
        }
    });
};

export const updateTableSettings = async (userId: string, settings: TableSettings) => {
    try {
        const settingsCol = getAssignmentSettingsCollection(userId);
        const docRef = doc(settingsCol, 'table');
        await setDoc(docRef, settings, { merge: true });
    } catch (error) {
        console.error('Failed to update table settings:', error);
        throw error;
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
    try {
        const managersCol = getManagersCollection(userId);
        const docRef = doc(managersCol, MANAGER_DOC_ID);
        await setDoc(docRef, {
            id: MANAGER_DOC_ID,
            name,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to set manager:', error);
        throw error;
    }
};

/**
 * 管理者を削除
 */
export const deleteManager = async (userId: string): Promise<void> => {
    try {
        const managersCol = getManagersCollection(userId);
        const docRef = doc(managersCol, MANAGER_DOC_ID);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Failed to delete manager:', error);
        throw error;
    }
};

// ===== ペア除外設定管理 =====

/**
 * ペア除外設定を取得
 */
export const fetchPairExclusions = async (userId: string): Promise<PairExclusion[]> => {
    try {
        const pairExclusionsCol = getPairExclusionsCollection(userId);
        const q = query(pairExclusionsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PairExclusion));
    } catch (error) {
        console.error('Failed to fetch pair exclusions:', error);
        throw error;
    }
};

/**
 * ペア除外設定をリアルタイム購読
 */
export const subscribePairExclusions = (
    userId: string,
    callback: (exclusions: PairExclusion[]) => void
) => {
    const pairExclusionsCol = getPairExclusionsCollection(userId);
    // インデックスが存在しない場合を考慮し、orderByなしでクエリ
    return onSnapshot(
        pairExclusionsCol,
        (snapshot) => {
            const exclusions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PairExclusion));
            // クライアント側でソート
            exclusions.sort((a, b) => toMillisSafe(b.createdAt) - toMillisSafe(a.createdAt)); // 降順
            callback(exclusions);
        },
        (error) => {
            console.error('Failed to subscribe to pair exclusions:', error);
            // エラー時は空配列を返す
            callback([]);
        }
    );
};

/**
 * ペア除外設定を追加（重複チェック付き）
 */
export const addPairExclusion = async (
    userId: string,
    memberId1: string,
    memberId2: string
): Promise<void> => {
    try {
        // IDを正規化（小さいIDを先に）
        const [normalizedId1, normalizedId2] = normalizePairIds(memberId1, memberId2);

        // 重複チェック
        const pairExclusionsCol = getPairExclusionsCollection(userId);
        const existingQuery = query(
            pairExclusionsCol,
            where('memberId1', '==', normalizedId1),
            where('memberId2', '==', normalizedId2)
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            throw new Error('この組み合わせは既に登録されています');
        }

        // 新規追加
        const id = crypto.randomUUID();
        const docRef = doc(pairExclusionsCol, id);
        await setDoc(docRef, {
            id,
            memberId1: normalizedId1,
            memberId2: normalizedId2,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'この組み合わせは既に登録されています') {
            throw error;
        }
        console.error('Failed to add pair exclusion:', error);
        throw error;
    }
};

/**
 * ペア除外設定を削除
 */
export const deletePairExclusion = async (userId: string, exclusionId: string): Promise<void> => {
    try {
        const pairExclusionsCol = getPairExclusionsCollection(userId);
        const docRef = doc(pairExclusionsCol, exclusionId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Failed to delete pair exclusion:', error);
        throw error;
    }
};

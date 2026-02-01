import {
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    updateDoc,
    serverTimestamp,
    limit,
} from 'firebase/firestore';
import {
    ShuffleEvent,
    ShuffleHistory,
} from '@/types';
import {
    getShuffleEventsCollection,
    getShuffleHistoryCollection,
    toMillisSafe,
} from './helpers';

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

export const createShuffleEvent = async (userId: string, event: ShuffleEvent) => {
    try {
        const shuffleEventsCol = getShuffleEventsCollection(userId);
        const docRef = doc(shuffleEventsCol, event.date);
        await setDoc(docRef, event);
    } catch (error) {
        console.error('Failed to create shuffle event:', error);
        throw error;
    }
};

export const updateShuffleEventState = async (userId: string, date: string, state: 'running' | 'done') => {
    try {
        const shuffleEventsCol = getShuffleEventsCollection(userId);
        const docRef = doc(shuffleEventsCol, date);
        await updateDoc(docRef, { state });
    } catch (error) {
        console.error('Failed to update shuffle event state:', error);
        throw error;
    }
};

export const createShuffleHistory = async (userId: string, history: Omit<ShuffleHistory, 'createdAt'>) => {
    try {
        const shuffleHistoryCol = getShuffleHistoryCollection(userId);
        const docRef = doc(shuffleHistoryCol, history.id);
        await setDoc(docRef, {
            ...history,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to create shuffle history:', error);
        throw error;
    }
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
        allHistory.sort((a, b) => toMillisSafe(b.createdAt) - toMillisSafe(a.createdAt)); // 降順
        return allHistory.slice(0, limitCount);
    }
};

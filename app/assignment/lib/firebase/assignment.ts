import {
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    serverTimestamp,
    Timestamp,
    where,
    limit,
    runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    AssignmentDay,
    Assignment,
} from '@/types';
import {
    getAssignmentDaysCollection,
    normalizeAssignmentsForDate,
    sortAssignmentsStable,
    areAssignmentsEqual
} from './helpers';

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

export const updateAssignmentDay = async (userId: string, date: string, assignments: Assignment[]) => {
    try {
        await mutateAssignmentDay(userId, date, () => assignments);
    } catch (error) {
        console.error('Failed to update assignment day:', error);
        throw error;
    }
};

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

export const fetchRecentAssignments = async (userId: string, endDate: string, days: number): Promise<AssignmentDay[]> => {
    try {
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
    } catch (error) {
        console.error('Failed to fetch recent assignments:', error);
        throw error;
    }
};

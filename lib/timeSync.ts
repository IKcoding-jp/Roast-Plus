import { getFirestore, doc, setDoc, getDocFromServer, serverTimestamp, Timestamp } from 'firebase/firestore';
import app from './firebase';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // refresh offset every 5 minutes
const META_FIELD = '__meta';
const META_TIMESTAMP_KEY = 'pingedAt';
const MAX_READ_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 120;

let currentUserId: string | null = null;
let timeOffsetMs = 0;
let hasSyncedOnce = false;
let lastSyncedAt = 0;
let syncPromise: Promise<void> | null = null;

function getDb() {
  return getFirestore(app);
}

const META_FIELD_PATH = `${META_FIELD}.${META_TIMESTAMP_KEY}`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setTimeSyncUser(userId: string | null) {
  if (currentUserId === userId) {
    return;
  }
  currentUserId = userId;
  timeOffsetMs = 0;
  hasSyncedOnce = false;
  lastSyncedAt = 0;
}

async function syncServerTime(force = false): Promise<void> {
  if (!currentUserId) {
    // Fallback to local clock when user session is not ready yet.
    hasSyncedOnce = false;
    timeOffsetMs = 0;
    lastSyncedAt = Date.now();
    return;
  }

  if (!force && hasSyncedOnce && Date.now() - lastSyncedAt < SYNC_INTERVAL_MS) {
    return;
  }

  if (syncPromise) {
    return syncPromise;
  }

  const userId = currentUserId;
  const docRef = doc(getDb(), 'users', userId);
  syncPromise = (async () => {
    const clientSendAt = Date.now();
    await setDoc(
      docRef,
      {
        [META_FIELD]: {
          [META_TIMESTAMP_KEY]: serverTimestamp(),
        },
      },
      { merge: true }
    );

    let serverTimestampValue: Timestamp | undefined;
    for (let attempt = 0; attempt <= MAX_READ_RETRIES; attempt += 1) {
      const snapshot = await getDocFromServer(docRef);
      serverTimestampValue = snapshot.get(META_FIELD_PATH) as Timestamp | undefined;
      if (serverTimestampValue) {
        break;
      }
      if (attempt < MAX_READ_RETRIES) {
        await sleep(RETRY_DELAY_BASE_MS * (attempt + 1));
      }
    }

    if (!serverTimestampValue) {
      console.warn('Server timestamp was not returned while syncing time. Falling back to client clock.');
      hasSyncedOnce = false;
      timeOffsetMs = 0;
      lastSyncedAt = Date.now();
      return;
    }

    const clientReceiveAt = Date.now();
    const estimatedClientMidpoint = clientSendAt + (clientReceiveAt - clientSendAt) / 2;
    timeOffsetMs = serverTimestampValue.toMillis() - estimatedClientMidpoint;
    hasSyncedOnce = true;
    lastSyncedAt = Date.now();
  })();

  try {
    await syncPromise;
  } finally {
    syncPromise = null;
  }
}

export async function ensureServerTimeSync(force = false): Promise<void> {
  try {
    await syncServerTime(force);
  } catch (error) {
    console.error('Failed to synchronize with server time:', error);
    if (!hasSyncedOnce) {
      timeOffsetMs = 0;
    }
  }
}

export async function getSyncedTimestamp(): Promise<number> {
  if (!hasSyncedOnce) {
    await ensureServerTimeSync();
  }
  return Date.now() + timeOffsetMs;
}

export function getSyncedTimestampSync(): number {
  if (!hasSyncedOnce) {
    return Date.now();
  }
  return Date.now() + timeOffsetMs;
}

export function getSyncedIsoString(): string {
  return new Date(getSyncedTimestampSync()).toISOString();
}

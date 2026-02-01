// ユーザーデータ書き込みキュー・リトライ管理
// Write stream exhausted対策として同時書き込み数を制限する

import {
  setDoc,
  deleteField,
  type FieldValue,
} from 'firebase/firestore';
import { getUserDocRef, removeUndefinedFields } from '../common';
import type { AppData } from '@/types';

// デバウンス待機時間（ミリ秒）
export const SAVE_USER_DATA_DEBOUNCE_MS = 300;

// ユーザーごとの書き込みキューとリトライ管理
export const writeQueues = new Map<string, {
  pendingData: AppData | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isWriting: boolean;
  retryCount: number;
  pendingPromise: { resolve: () => void; reject: (error: unknown) => void } | null;
}>();

// 最大リトライ回数
const MAX_RETRY_COUNT = 3;
// リトライ待機時間（ミリ秒）
const RETRY_DELAY = 1000;

// ===== Write stream exhausted対策 =====
const MAX_CONCURRENT_WRITES = 1;
let activeWriteCount = 0;
const writeWaitQueue: Array<() => void> = [];

// 書き込みキューの最大サイズ制限
const MAX_QUEUE_SIZE = 20;

// 書き込み間隔の最小時間（ミリ秒）
const MIN_WRITE_INTERVAL = 200;
let lastWriteTime = 0;

/**
 * 書き込みスロットを取得する。利用可能なスロットがない場合は待機キューに追加する。
 */
async function acquireWriteSlot(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (activeWriteCount < MAX_CONCURRENT_WRITES) {
      activeWriteCount++;
      resolve();
    } else {
      writeWaitQueue.push(() => {
        activeWriteCount++;
        resolve();
      });
    }
  });
}

/**
 * 書き込み完了後にスロットを解放する
 */
function releaseWriteSlot(): void {
  activeWriteCount--;
  if (writeWaitQueue.length > 0 && activeWriteCount < MAX_CONCURRENT_WRITES) {
    const next = writeWaitQueue.shift();
    if (next) {
      next();
    }
  }
}

// 実際の書き込み処理を行う関数
async function performWrite(userId: string, data: AppData): Promise<void> {
  await acquireWriteSlot();

  try {
    const now = Date.now();
    const timeSinceLastWrite = now - lastWriteTime;
    if (timeSinceLastWrite < MIN_WRITE_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_WRITE_INTERVAL - timeSinceLastWrite));
    }
    lastWriteTime = Date.now();

    const userDocRef = getUserDocRef(userId);
    const cleanedData: Record<string, unknown> = removeUndefinedFields<AppData>(data) as unknown as Record<string, unknown>;

    const setOrDelete = <T>(value: T | undefined): T | FieldValue => {
      return value !== undefined ? value : deleteField();
    };

    if (data.userSettings) {
      const userSettingsUpdate: Record<string, unknown> = {
        selectedMemberId: setOrDelete(data.userSettings.selectedMemberId),
        selectedManagerId: setOrDelete(data.userSettings.selectedManagerId),
        taskLabelHeaderTextLeft: setOrDelete(data.userSettings.taskLabelHeaderTextLeft),
        taskLabelHeaderTextRight: setOrDelete(data.userSettings.taskLabelHeaderTextRight),
      };

      if (data.userSettings.roastTimerSettings !== undefined) {
        userSettingsUpdate.roastTimerSettings = data.userSettings.roastTimerSettings;
      }

      const hasAnyValue = Object.values(userSettingsUpdate).some(
        (value) => value !== deleteField()
      );

      if (!hasAnyValue) {
        cleanedData.userSettings = deleteField();
      } else {
        cleanedData.userSettings = userSettingsUpdate;
      }
    } else if (data.userSettings === undefined) {
      cleanedData.userSettings = deleteField();
    }

    if (data.shuffleEvent === undefined) {
      cleanedData.shuffleEvent = deleteField();
    }

    if (data.roastTimerState === undefined) {
      cleanedData.roastTimerState = deleteField();
    }

    await setDoc(userDocRef, cleanedData, { merge: true });
  } finally {
    releaseWriteSlot();
  }
}

// 書き込みキューを実行し、リトライ処理を行う
export async function executeWrite(userId: string, data: AppData, hasWaitedForQueue = false): Promise<void> {
  const queue = writeQueues.get(userId);
  if (!queue) {
    throw new Error('Write queue not found');
  }

  const totalQueuedWrites = writeWaitQueue.length + activeWriteCount;
  if (totalQueuedWrites >= MAX_QUEUE_SIZE) {
    console.warn(`Firestore write queue size (${totalQueuedWrites}) exceeds limit (${MAX_QUEUE_SIZE}), waiting...`);
    if (!hasWaitedForQueue) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * 2));
      const refreshedQueuedWrites = writeWaitQueue.length + activeWriteCount;
      if (refreshedQueuedWrites >= MAX_QUEUE_SIZE) {
        console.warn(`Firestore write queue still saturated (${refreshedQueuedWrites}/${MAX_QUEUE_SIZE}) after extended wait, retrying once...`);
        await executeWrite(userId, data, true);
        return;
      }
    } else {
      console.warn(`Firestore write queue remains saturated (${writeWaitQueue.length + activeWriteCount}/${MAX_QUEUE_SIZE}) after extended wait; proceeding to avoid infinite recursion.`);
    }
  }

  queue.isWriting = true;
  queue.retryCount = 0;
  const currentPromise = queue.pendingPromise;

  while (queue.retryCount <= MAX_RETRY_COUNT) {
    try {
      await performWrite(userId, data);
      queue.isWriting = false;
      queue.retryCount = 0;

      if (currentPromise) {
        currentPromise.resolve();
      }

      if (queue.pendingData) {
        const nextData = queue.pendingData;
        queue.pendingData = null;
        await executeWrite(userId, nextData);
      } else {
        queue.pendingData = null;
        queue.pendingPromise = null;
      }

      return;
    } catch (error: unknown) {
      queue.retryCount++;

      const errorInfo = error as { code?: string; message?: string };
      const isWriteStreamExhausted =
        errorInfo?.code === 'resource-exhausted' ||
        (errorInfo?.message && typeof errorInfo.message === 'string' &&
          errorInfo.message.toLowerCase().includes('write stream exhausted'));

      if (isWriteStreamExhausted && queue.retryCount <= MAX_RETRY_COUNT) {
        const baseDelay = RETRY_DELAY * Math.pow(2, queue.retryCount - 1);
        const additionalDelay = writeWaitQueue.length * 300;
        const delay = Math.min(baseDelay + additionalDelay, 10000);

        console.warn(
          `Firestore write stream exhausted, retrying in ${delay}ms ` +
          `(attempt ${queue.retryCount}/${MAX_RETRY_COUNT}, ` +
          `queued: ${writeWaitQueue.length}, active: ${activeWriteCount})`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      queue.isWriting = false;
      console.error('Failed to save data to Firestore:', error);

      if (currentPromise) {
        currentPromise.reject(error);
      }
      queue.pendingPromise = null;
      throw error;
    }
  }
}

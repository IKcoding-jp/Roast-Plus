// ユーザーデータのCRUD操作

import {
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getUserDocRef, removeUndefinedFields, normalizeAppData, defaultData } from '../common';
import type { AppData } from '@/types';
import { writeQueues, SAVE_USER_DATA_DEBOUNCE_MS, executeWrite } from './write-queue';

export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const normalizedData = normalizeAppData(data);
      return normalizedData;
    }

    // ドキュメントが存在しない場合はデフォルトデータを作成
    const cleanedDefaultData = removeUndefinedFields(defaultData);
    await setDoc(userDocRef, cleanedDefaultData);
    return defaultData;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    return defaultData;
  }
}

export async function saveUserData(userId: string, data: AppData): Promise<void> {
  // キューが存在しない場合は初期化
  if (!writeQueues.has(userId)) {
    writeQueues.set(userId, {
      pendingData: null,
      timeoutId: null,
      isWriting: false,
      retryCount: 0,
      pendingPromise: null,
    });
  }

  const queue = writeQueues.get(userId)!;

  // 新しいPromiseを作成
  const promise = new Promise<void>((resolve, reject) => {
    if (queue.pendingPromise) {
      queue.pendingPromise.resolve();
    }
    queue.pendingPromise = { resolve, reject };
  });

  // 最新のデータをキューに保存
  queue.pendingData = data;

  // 書き込み中の場合は待機してから書き込み
  if (queue.isWriting) {
    return promise;
  }

  // 既存のタイマーをキャンセル
  if (queue.timeoutId) {
    clearTimeout(queue.timeoutId);
    queue.timeoutId = null;
  }

  // デバウンスタイマーを設定
  queue.timeoutId = setTimeout(async () => {
    if (queue.pendingData) {
      const dataToWrite = queue.pendingData;
      queue.pendingData = null;
      queue.timeoutId = null;
      await executeWrite(userId, dataToWrite);
    }
  }, SAVE_USER_DATA_DEBOUNCE_MS);

  return promise;
}

export function subscribeUserData(
  userId: string,
  callback: (data: AppData) => void
): () => void {
  const userDocRef = getUserDocRef(userId);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const normalizedData = normalizeAppData(data);
        callback(normalizedData);
      } else {
        callback(defaultData);
      }
    },
    (error) => {
      console.error('Error in Firestore subscription:', error);
      callback(defaultData);
    }
  );
}

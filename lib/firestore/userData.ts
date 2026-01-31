import {
  setDoc,
  getDoc,
  onSnapshot,
  deleteField,
  type FieldValue,
} from 'firebase/firestore';
import { getUserDocRef, removeUndefinedFields, normalizeAppData, defaultData } from './common';
import type { AppData } from '@/types';

// ユーザーごとの書き込みキューとリトライ管理
const writeQueues = new Map<string, {
  pendingData: AppData | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isWriting: boolean;
  retryCount: number;
  pendingPromise: { resolve: () => void; reject: (error: unknown) => void } | null;
}>();

// デバウンス待機時間（ミリ秒）
export const SAVE_USER_DATA_DEBOUNCE_MS = 300;
// 最大リトライ回数
const MAX_RETRY_COUNT = 3;
// リトライ待機時間（ミリ秒）
const RETRY_DELAY = 1000;

// ===== Write stream exhausted対策 =====
// SDKの同時書き込み数を制限する仕組み
// 9台のデバイスで同時書き込みが発生した際の競合を防ぐため、同時書き込み数を制限
// 同時書き込み数は1つのスロットのみに制限し、順次処理する
const MAX_CONCURRENT_WRITES = 1;
// Limit concurrent writes to a single slot so the 9-device shared account drains the SDK queue sequentially.
let activeWriteCount = 0;
const writeWaitQueue: Array<() => void> = [];

// 書き込みキューの最大サイズ制限
// 9台のデバイスでの同時書き込みによるキューサイズを制限
const MAX_QUEUE_SIZE = 20;

// 書き込み間隔の最小時間（ミリ秒）。UIの応答性を保ちつつ、デバイス間でのSDKキュー飽和を防ぐため200msに設定
// 200ms spacing keeps the UI responsive while avoiding SDK queue saturation across devices.
const MIN_WRITE_INTERVAL = 200;
let lastWriteTime = 0;

// ===== Write stream exhausted対策 ヘルパー関数 =====
/**
 * 書き込みスロットを取得する。利用可能なスロットがない場合は待機キューに追加する。
 * スロットが利用可能になったら自動的に解決される。
 */
async function acquireWriteSlot(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (activeWriteCount < MAX_CONCURRENT_WRITES) {
      activeWriteCount++;
      resolve();
    } else {
      // スロットが利用可能になるまで待機キューに追加
      writeWaitQueue.push(() => {
        activeWriteCount++;
        resolve();
      });
    }
  });
}

/**
 * 書き込み完了後にスロットを解放する
 * 待機中の書き込みがあれば次の書き込みを開始する。
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
// Write stream exhausted対策として同時書き込み数を制限する
async function performWrite(userId: string, data: AppData): Promise<void> {
  // 書き込みスロットを取得する（利用可能になるまで待機）
  await acquireWriteSlot();

  try {
    // 書き込み間隔の最小時間を確保する
    const now = Date.now();
    const timeSinceLastWrite = now - lastWriteTime;
    if (timeSinceLastWrite < MIN_WRITE_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_WRITE_INTERVAL - timeSinceLastWrite));
    }
    lastWriteTime = Date.now();

    const userDocRef = getUserDocRef(userId);
    // undefinedのフィールドを削除してから保存
    const cleanedData: Record<string, unknown> = removeUndefinedFields<AppData>(data) as unknown as Record<string, unknown>;

    /**
     * フィールド値がundefinedの場合はFirestoreのdeleteField()を返し、
     * それ以外の場合は値をそのまま返すヘルパー関数
     */
    const setOrDelete = <T>(value: T | undefined): T | FieldValue => {
      return value !== undefined ? value : deleteField();
    };

    // userSettingsの各フィールドを個別に削除処理
    // merge: trueを使ってもundefinedは保存できないため、明示的に削除する必要がある。
    // FieldValue.delete()を使って個別に削除する方法が確実
    if (data.userSettings) {
      // 元のdataオブジェクトからuserSettingsの各フィールドを抽出
      const userSettingsUpdate: Record<string, unknown> = {
        selectedMemberId: setOrDelete(data.userSettings.selectedMemberId),
        selectedManagerId: setOrDelete(data.userSettings.selectedManagerId),
        taskLabelHeaderTextLeft: setOrDelete(data.userSettings.taskLabelHeaderTextLeft),
        taskLabelHeaderTextRight: setOrDelete(data.userSettings.taskLabelHeaderTextRight),
      };

      // roastTimerSettingsが存在する場合は設定
      if (data.userSettings.roastTimerSettings !== undefined) {
        userSettingsUpdate.roastTimerSettings = data.userSettings.roastTimerSettings;
      }

      // すべてのフィールドがdeleteField()の場合、userSettings全体を削除
      const hasAnyValue = Object.values(userSettingsUpdate).some(
        (value) => value !== deleteField()
      );

      if (!hasAnyValue) {
        cleanedData.userSettings = deleteField();
      } else {
        cleanedData.userSettings = userSettingsUpdate;
      }
    } else if (data.userSettings === undefined) {
      // userSettingsがundefinedの場合は明示的にフィールドを削除
      cleanedData.userSettings = deleteField();
    }

    // shuffleEventの削除処理
    if (data.shuffleEvent === undefined) {
      // shuffleEventがundefinedの場合は明示的にフィールドを削除
      cleanedData.shuffleEvent = deleteField();
    }

    // roastTimerStateの削除処理
    if (data.roastTimerState === undefined) {
      // roastTimerStateがundefinedの場合は明示的にフィールドを削除
      cleanedData.roastTimerState = deleteField();
    }

    await setDoc(userDocRef, cleanedData, { merge: true });
  } finally {
    // 書き込み完了後にスロットを解放。エラーが発生しても必ず解放する。
    releaseWriteSlot();
  }
}

// 書き込みキューを実行し、リトライ処理を行う
// Write stream exhausted対策としてエラーハンドリングとリトライロジックを実装
async function executeWrite(userId: string, data: AppData, hasWaitedForQueue = false): Promise<void> {
  const queue = writeQueues.get(userId);
  if (!queue) {
    throw new Error('Write queue not found');
  }

  // 書き込みキューのサイズをチェックし、上限を超えている場合は待機
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
      // 書き込み成功時の処理
      queue.isWriting = false;
      queue.retryCount = 0;

      // 待機中のPromiseを解決。この書き込みが完了したことを通知する。
      if (currentPromise) {
        currentPromise.resolve();
      }

      // 書き込み中に新しいデータが来ていた場合は次の書き込みを実行
      if (queue.pendingData) {
        const nextData = queue.pendingData;
        queue.pendingData = null;
        // 次の書き込みを再帰的に実行。タイムアウトは設定しない。
        await executeWrite(userId, nextData);
      } else {
        queue.pendingData = null;
        queue.pendingPromise = null;
      }

      return;
    } catch (error: unknown) {
      queue.retryCount++;

      // Write stream exhaustedエラーを検出。エラーメッセージから判定する。
      const errorInfo = error as { code?: string; message?: string };
      const isWriteStreamExhausted =
        errorInfo?.code === 'resource-exhausted' ||
        (errorInfo?.message && typeof errorInfo.message === 'string' &&
          errorInfo.message.toLowerCase().includes('write stream exhausted'));

      if (isWriteStreamExhausted && queue.retryCount <= MAX_RETRY_COUNT) {
        // Write stream exhaustedエラーの場合、指数バックオフで待機時間を設定
        // 指数バックオフ + 待機キューの待機時間を考慮した遅延時間を計算する。
        const baseDelay = RETRY_DELAY * Math.pow(2, queue.retryCount - 1);
        const additionalDelay = writeWaitQueue.length * 300; // 待機中の書き込み数に応じて待機時間を追加
        const delay = Math.min(baseDelay + additionalDelay, 10000); // 最大10秒

        console.warn(
          `Firestore write stream exhausted, retrying in ${delay}ms ` +
          `(attempt ${queue.retryCount}/${MAX_RETRY_COUNT}, ` +
          `queued: ${writeWaitQueue.length}, active: ${activeWriteCount})`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // その他のエラーまたは最大リトライ回数に達した場合
      queue.isWriting = false;
      console.error('Failed to save data to Firestore:', error);

      // 待機中のPromiseを拒否
      if (currentPromise) {
        currentPromise.reject(error);
      }
      queue.pendingPromise = null;
      throw error;
    }
  }
}

export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const normalizedData = normalizeAppData(data);
      // 正規化されたデータを返す（undefinedフィールドは削除済み）
      return normalizedData;
    }

    // ドキュメントが存在しない場合はデフォルトデータを作成。初回書き込み時にundefinedフィールドを削除して保存する。
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
    // 既存のPromiseがあれば解決してから新しいPromiseに置き換える
    // デバウンス期間中に複数回呼ばれた場合、最後の呼び出しのみが有効になる
    if (queue.pendingPromise) {
      // 既存のPromiseを解決。エラーは発生していないため成功として扱う。
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

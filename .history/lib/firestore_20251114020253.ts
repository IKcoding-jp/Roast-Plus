import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  deleteField,
  Firestore,
} from 'firebase/firestore';
import app from './firebase';
import type { AppData } from '@/types';

// Firestoreインスタンスを遅延初期化
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

// 書き込み操作のデバウンスとキューイング
const writeQueues = new Map<string, {
  pendingData: AppData | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isWriting: boolean;
  retryCount: number;
  pendingPromise: { resolve: () => void; reject: (error: any) => void } | null;
}>();

// デバウンス時間（ミリ秒）
const DEBOUNCE_DELAY = 300;
// 最大リトライ回数
const MAX_RETRY_COUNT = 3;
// リトライ間隔（ミリ秒）
const RETRY_DELAY = 1000;

// ===== Write stream exhausted対策 =====
// 同時実行数を制限するセマフォ（Firestore SDKの書き込みキュー飽和を防ぐ）
// 9台のデバイスから同時アクセス時でも、SDKキューへの負荷を軽減
const MAX_CONCURRENT_WRITES = 3;
let activeWriteCount = 0;
const writeWaitQueue: Array<() => void> = [];

// 書き込みキューサイズの監視（一定数を超えた場合は待機）
const MAX_QUEUE_SIZE = 10;

// 連続書き込み時の最小間隔（ミリ秒）
const MIN_WRITE_INTERVAL = 100;
let lastWriteTime = 0;

const defaultData: AppData = {
  teams: [],
  members: [],
  taskLabels: [],
  assignments: [],
  assignmentHistory: [],
  todaySchedules: [],
  roastSchedules: [],
  tastingSessions: [],
  tastingRecords: [],
  notifications: [],
  encouragementCount: 0,
};

function getUserDocRef(userId: string) {
  return doc(getDb(), 'users', userId);
}

// ===== Write stream exhausted対策: セマフォ制御関数 =====
/**
 * 書き込みスロットを取得（同時実行数制限）
 * スロットが利用可能になるまで待機する
 */
async function acquireWriteSlot(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (activeWriteCount < MAX_CONCURRENT_WRITES) {
      activeWriteCount++;
      resolve();
    } else {
      // スロットが利用可能になるまでキューに追加
      writeWaitQueue.push(() => {
        activeWriteCount++;
        resolve();
      });
    }
  });
}

/**
 * 書き込み完了後にスロットを解放
 * 待機中の書き込みがあれば次の書き込みを開始
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

// undefinedのフィールドを削除する関数（Firestoreはundefinedをサポートしていないため）
function removeUndefinedFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = removeUndefinedFields(value);
        // 空のオブジェクトは削除
        if (cleanedValue !== null && typeof cleanedValue === 'object' && !Array.isArray(cleanedValue)) {
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  
  return obj;
}

// データを正規化する関数（不足しているフィールドをデフォルト値で補完）
function normalizeAppData(data: any): AppData {
  const normalized: AppData = {
    teams: Array.isArray(data?.teams) ? data.teams : [],
    members: Array.isArray(data?.members) ? data.members : [],
    manager: data?.manager && typeof data.manager === 'object' ? data.manager : undefined,
    taskLabels: Array.isArray(data?.taskLabels) ? data.taskLabels : [],
    assignments: Array.isArray(data?.assignments) ? data.assignments : [],
    assignmentHistory: Array.isArray(data?.assignmentHistory) ? data.assignmentHistory : [],
    todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
    roastSchedules: Array.isArray(data?.roastSchedules) ? data.roastSchedules : [],
    tastingSessions: Array.isArray(data?.tastingSessions) ? data.tastingSessions : [],
    tastingRecords: Array.isArray(data?.tastingRecords) ? data.tastingRecords : [],
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
    encouragementCount: typeof data?.encouragementCount === 'number' ? data.encouragementCount : 0,
  };
  
  // userSettingsは存在する場合のみ追加（selectedMemberId/selectedManagerIdがundefinedの場合はフィールドを削除）
  if (data?.userSettings) {
    const cleanedUserSettings: any = {};
    if (data.userSettings.selectedMemberId !== undefined) {
      cleanedUserSettings.selectedMemberId = data.userSettings.selectedMemberId;
    }
    if (data.userSettings.selectedManagerId !== undefined) {
      cleanedUserSettings.selectedManagerId = data.userSettings.selectedManagerId;
    }
    if (Object.keys(cleanedUserSettings).length > 0) {
      normalized.userSettings = cleanedUserSettings;
    }
  }
  
  // shuffleEventは存在する場合のみ追加
  if (data?.shuffleEvent && typeof data.shuffleEvent === 'object') {
    if (
      typeof data.shuffleEvent.startTime === 'string' &&
      Array.isArray(data.shuffleEvent.shuffledAssignments)
    ) {
      normalized.shuffleEvent = {
        startTime: data.shuffleEvent.startTime,
        shuffledAssignments: data.shuffleEvent.shuffledAssignments,
      };
    }
  }
  
  return normalized;
}

export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const normalizedData = normalizeAppData(data);
      // 読み込み時には書き込まない（不要な書き込みを避ける）
      return normalizedData;
    }
    
    // ドキュメントが存在しない場合のみ、デフォルトデータを作成
    // ただし、複数デバイスからの同時アクセスを考慮して、書き込みは最小限に
    const cleanedDefaultData = removeUndefinedFields(defaultData);
    await setDoc(userDocRef, cleanedDefaultData);
    return defaultData;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    return defaultData;
  }
}

// 実際の書き込み処理（内部関数）
// Write stream exhausted対策: セマフォ制御により同時実行数を制限
async function performWrite(userId: string, data: AppData): Promise<void> {
  // 書き込みスロットを取得（同時実行数制限）
  await acquireWriteSlot();
  
  try {
    // 連続書き込み時の最小間隔を確保
    const now = Date.now();
    const timeSinceLastWrite = now - lastWriteTime;
    if (timeSinceLastWrite < MIN_WRITE_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_WRITE_INTERVAL - timeSinceLastWrite));
    }
    lastWriteTime = Date.now();
    
    const userDocRef = getUserDocRef(userId);
    // undefinedのフィールドを削除してから保存
    const cleanedData = removeUndefinedFields(data);
    
    // userSettingsの不要なフィールドを明示的に削除
    // merge: trueを使う場合、undefinedを設定しても既存のフィールドは削除されないため、
    // FieldValue.delete()を使って明示的に削除する必要がある
    if (data.userSettings) {
      // 元のdataオブジェクトからuserSettingsの状態を確認
      const userSettingsUpdate: any = {};
      
      // selectedMemberIdが存在する場合は設定、undefinedの場合は削除
      if (data.userSettings.selectedMemberId !== undefined) {
        userSettingsUpdate.selectedMemberId = data.userSettings.selectedMemberId;
      } else {
        userSettingsUpdate.selectedMemberId = deleteField();
      }
      
      // selectedManagerIdが存在する場合は設定、undefinedの場合は削除
      if (data.userSettings.selectedManagerId !== undefined) {
        userSettingsUpdate.selectedManagerId = data.userSettings.selectedManagerId;
      } else {
        userSettingsUpdate.selectedManagerId = deleteField();
      }
      
      // 両方とも削除される場合はuserSettings全体を削除
      const deleteFieldValue = deleteField();
      const hasMemberId = data.userSettings.selectedMemberId !== undefined;
      const hasManagerId = data.userSettings.selectedManagerId !== undefined;
      
      if (!hasMemberId && !hasManagerId) {
        cleanedData.userSettings = deleteFieldValue as any;
      } else {
        cleanedData.userSettings = userSettingsUpdate;
      }
    } else if (data.userSettings === undefined) {
      // userSettingsがundefinedの場合、既存のフィールドを削除
      cleanedData.userSettings = deleteField() as any;
    }
    
    // shuffleEventの削除処理
    if (data.shuffleEvent === undefined) {
      // shuffleEventがundefinedの場合、既存のフィールドを削除
      cleanedData.shuffleEvent = deleteField() as any;
    }
    
    await setDoc(userDocRef, cleanedData, { merge: true });
  } finally {
    // 書き込み完了後にスロットを解放（エラーが発生しても必ず解放）
    releaseWriteSlot();
  }
}

// 書き込み操作を実行（リトライロジック付き）
async function executeWrite(userId: string, data: AppData): Promise<void> {
  const queue = writeQueues.get(userId);
  if (!queue) {
    throw new Error('Write queue not found');
  }

  queue.isWriting = true;
  queue.retryCount = 0;
  const currentPromise = queue.pendingPromise;

  while (queue.retryCount <= MAX_RETRY_COUNT) {
    try {
      await performWrite(userId, data);
      // 成功したらキューをクリア
      queue.isWriting = false;
      queue.retryCount = 0;
      
      // 現在のPromiseを解決（この書き込みに対応するPromise）
      if (currentPromise) {
        currentPromise.resolve();
      }
      
      // キューに新しいデータがある場合は、次の書き込みを実行
      if (queue.pendingData) {
        const nextData = queue.pendingData;
        queue.pendingData = null;
        // 次の書き込みを即座に実行（デバウンスは既に経過している）
        await executeWrite(userId, nextData);
      } else {
        queue.pendingData = null;
        queue.pendingPromise = null;
      }
      
      return;
    } catch (error: any) {
      queue.retryCount++;
      
      // resource-exhaustedエラーの場合、リトライ
      if (error?.code === 'resource-exhausted' && queue.retryCount <= MAX_RETRY_COUNT) {
        const delay = RETRY_DELAY * Math.pow(2, queue.retryCount - 1); // 指数バックオフ
        console.warn(`Firestore write exhausted, retrying in ${delay}ms (attempt ${queue.retryCount}/${MAX_RETRY_COUNT})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // その他のエラーまたは最大リトライ回数に達した場合
      queue.isWriting = false;
      console.error('Failed to save data to Firestore:', error);
      
      // 現在のPromiseを拒否
      if (currentPromise) {
        currentPromise.reject(error);
      }
      queue.pendingPromise = null;
      throw error;
    }
  }
}

export async function saveUserData(userId: string, data: AppData): Promise<void> {
  // キューを初期化（存在しない場合）
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
    // 既存のPromiseがある場合は、それを解決して新しいPromiseに置き換え
    // デバウンス機能による正常な動作なので、エラーを投げずに解決する
    if (queue.pendingPromise) {
      // 前のPromiseを解決（エラーを投げない）
      queue.pendingPromise.resolve();
    }
    queue.pendingPromise = { resolve, reject };
  });
  
  // 最新のデータをキューに保存
  queue.pendingData = data;

  // 既に書き込み中の場合は、デバウンスを待つ
  if (queue.isWriting) {
    return promise;
  }

  // 既存のタイマーをクリア
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
  }, DEBOUNCE_DELAY);

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

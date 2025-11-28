import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  onSnapshot,
  deleteField,
  collection,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import app from './firebase';
import type { AppData, DefectBean, DefectBeanSettings, WorkProgress, ProgressEntry } from '@/types';

// Firestoreインスタンスのシングルトン管理
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

// ユーザーごとの書き込みキューとリトライ管理
const writeQueues = new Map<string, {
  pendingData: AppData | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isWriting: boolean;
  retryCount: number;
  pendingPromise: { resolve: () => void; reject: (error: any) => void } | null;
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

const defaultData: AppData = {
  // 注意: teams, members, manager, taskLabels, assignments は
  // 別コレクションとして管理されているため、/teams, /members, /taskLabels, /assignmentDays として保存される
  todaySchedules: [],
  roastSchedules: [],
  tastingSessions: [],
  tastingRecords: [],
  notifications: [],
  encouragementCount: 0,
  roastTimerRecords: [],
  workProgresses: [],
  counterRecords: [],
};

function getUserDocRef(userId: string) {
  return doc(getDb(), 'users', userId);
}

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

// undefinedのフィールドを削除する関数。Firestoreはundefinedを保存できないため。
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
        // 空のオブジェクトを削除
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

// データを正規化する関数。存在しないフィールドをデフォルト値で補完する。
function normalizeAppData(data: any): AppData {
  const normalized: AppData = {
    // 注意: teams, members, manager, taskLabels, assignments は
    // 別コレクションとして管理されているため、/teams, /members, /taskLabels, /assignmentDays として保存される
    todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
    roastSchedules: Array.isArray(data?.roastSchedules)
      ? data.roastSchedules.map((schedule: any) => ({
          ...schedule,
          // dateが存在しない場合は現在日時から日付部分を取得して補完する。
          date: schedule.date || new Date().toISOString().split('T')[0],
        }))
      : [],
    tastingSessions: Array.isArray(data?.tastingSessions) ? data.tastingSessions : [],
    tastingRecords: Array.isArray(data?.tastingRecords) ? data.tastingRecords : [],
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
    encouragementCount: typeof data?.encouragementCount === 'number' ? data.encouragementCount : 0,
    roastTimerRecords: Array.isArray(data?.roastTimerRecords)
      ? data.roastTimerRecords.map((record: any) => ({
          ...record,
          // roastDateが存在しない場合はcreatedAtから日付部分を取得、それもなければ現在日時の日付部分を使用
          roastDate:
            record.roastDate ||
            (record.createdAt ? record.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
        }))
      : [],
    workProgresses: Array.isArray(data?.workProgresses)
      ? data.workProgresses.map((wp: any) => ({
          ...wp,
          completedCount: typeof wp.completedCount === 'number' ? wp.completedCount : undefined,
        }))
      : [],
    counterRecords: Array.isArray(data?.counterRecords) ? data.counterRecords : [],
  };
  
  // userSettingsは存在する場合のみ処理。selectedMemberId/selectedManagerIdがundefinedの場合はフィールドを削除する。
  if (data?.userSettings) {
    const cleanedUserSettings: any = {};
    if (data.userSettings.selectedMemberId !== undefined) {
      cleanedUserSettings.selectedMemberId = data.userSettings.selectedMemberId;
    }
    if (data.userSettings.selectedManagerId !== undefined) {
      cleanedUserSettings.selectedManagerId = data.userSettings.selectedManagerId;
    }
    if (typeof data.userSettings.taskLabelHeaderTextLeft === 'string') {
      const trimmedLeft = data.userSettings.taskLabelHeaderTextLeft.trim();
      if (trimmedLeft.length > 0) {
        cleanedUserSettings.taskLabelHeaderTextLeft = trimmedLeft;
      }
    }
    if (typeof data.userSettings.taskLabelHeaderTextRight === 'string') {
      const trimmedRight = data.userSettings.taskLabelHeaderTextRight.trim();
      if (trimmedRight.length > 0) {
        cleanedUserSettings.taskLabelHeaderTextRight = trimmedRight;
      }
    }
    // roastTimerSettingsを正規化
    if (data.userSettings.roastTimerSettings && typeof data.userSettings.roastTimerSettings === 'object') {
      const settings = data.userSettings.roastTimerSettings;
      cleanedUserSettings.roastTimerSettings = {
        goToRoastRoomTimeSeconds: typeof settings.goToRoastRoomTimeSeconds === 'number' ? settings.goToRoastRoomTimeSeconds : 60,
        timerSoundEnabled: typeof settings.timerSoundEnabled === 'boolean' ? settings.timerSoundEnabled : true,
        timerSoundFile: typeof settings.timerSoundFile === 'string' ? settings.timerSoundFile : '/sounds/alarm/alarm01.mp3',
        timerSoundVolume: typeof settings.timerSoundVolume === 'number' ? Math.max(0, Math.min(1, settings.timerSoundVolume)) : 0.5,
        notificationSoundEnabled: typeof settings.notificationSoundEnabled === 'boolean' ? settings.notificationSoundEnabled : true,
        notificationSoundFile: typeof settings.notificationSoundFile === 'string' ? settings.notificationSoundFile : '/sounds/alarm/alarm01.mp3',
        notificationSoundVolume: typeof settings.notificationSoundVolume === 'number' ? Math.max(0, Math.min(1, settings.notificationSoundVolume)) : 0.5,
      };
    }
    if (Object.keys(cleanedUserSettings).length > 0) {
      normalized.userSettings = cleanedUserSettings;
    }
  }
  
  // shuffleEventは存在する場合のみ処理
  if (data?.shuffleEvent && typeof data.shuffleEvent === 'object') {
    if (
      typeof data.shuffleEvent.startTime === 'string' &&
      Array.isArray(data.shuffleEvent.shuffledAssignments)
    ) {
      normalized.shuffleEvent = {
        startTime: data.shuffleEvent.startTime,
        targetDate: typeof data.shuffleEvent.targetDate === 'string' ? data.shuffleEvent.targetDate : undefined,
        shuffledAssignments: data.shuffleEvent.shuffledAssignments,
      };
    }
  }
  
  // roastTimerStateは存在する場合のみ処理
  if (data?.roastTimerState && typeof data.roastTimerState === 'object') {
    normalized.roastTimerState = data.roastTimerState;
  }
  
  // defectBeansは存在する場合のみ処理
  if (Array.isArray(data?.defectBeans)) {
    normalized.defectBeans = data.defectBeans;
  }
  
  // defectBeanSettingsは存在する場合のみ処理
  if (data?.defectBeanSettings && typeof data.defectBeanSettings === 'object') {
    normalized.defectBeanSettings = data.defectBeanSettings;
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
    const cleanedData = removeUndefinedFields(data);
    
    // userSettingsの各フィールドを個別に削除処理
    // merge: trueを使ってもundefinedは保存できないため、明示的に削除する必要がある。
    // FieldValue.delete()を使って個別に削除する方法が確実
    if (data.userSettings) {
      // 元のdataオブジェクトからuserSettingsの各フィールドを抽出
      const userSettingsUpdate: any = {};
      let hasAnyField = false;
      
      // selectedMemberIdが存在する場合は設定、undefinedの場合は削除
      if (data.userSettings.selectedMemberId !== undefined) {
        userSettingsUpdate.selectedMemberId = data.userSettings.selectedMemberId;
        hasAnyField = true;
      } else {
        userSettingsUpdate.selectedMemberId = deleteField();
      }
      
      // selectedManagerIdが存在する場合は設定、undefinedの場合は削除
      if (data.userSettings.selectedManagerId !== undefined) {
        userSettingsUpdate.selectedManagerId = data.userSettings.selectedManagerId;
        hasAnyField = true;
      } else {
        userSettingsUpdate.selectedManagerId = deleteField();
      }
      
      // taskLabelHeaderTextLeftが存在する場合は設定、undefinedの場合は削除
      if (data.userSettings.taskLabelHeaderTextLeft !== undefined) {
        userSettingsUpdate.taskLabelHeaderTextLeft = data.userSettings.taskLabelHeaderTextLeft;
        hasAnyField = true;
      } else {
        userSettingsUpdate.taskLabelHeaderTextLeft = deleteField();
      }
      
      // taskLabelHeaderTextRightが存在する場合は設定、undefinedの場合は削除
      if (data.userSettings.taskLabelHeaderTextRight !== undefined) {
        userSettingsUpdate.taskLabelHeaderTextRight = data.userSettings.taskLabelHeaderTextRight;
        hasAnyField = true;
      } else {
        userSettingsUpdate.taskLabelHeaderTextRight = deleteField();
      }
      
      // roastTimerSettingsが存在する場合は設定
      if (data.userSettings.roastTimerSettings !== undefined) {
        userSettingsUpdate.roastTimerSettings = data.userSettings.roastTimerSettings;
        hasAnyField = true;
      }
      
      // どのフィールドも削除されていない場合はuserSettings全体を削除
      if (!hasAnyField) {
        cleanedData.userSettings = deleteField() as any;
      } else {
        cleanedData.userSettings = userSettingsUpdate;
      }
    } else if (data.userSettings === undefined) {
      // userSettingsがundefinedの場合は明示的にフィールドを削除
      cleanedData.userSettings = deleteField() as any;
    }
    
    // shuffleEventの削除処理
    if (data.shuffleEvent === undefined) {
      // shuffleEventがundefinedの場合は明示的にフィールドを削除
      cleanedData.shuffleEvent = deleteField() as any;
    }
    
    // roastTimerStateの削除処理
    if (data.roastTimerState === undefined) {
      // roastTimerStateがundefinedの場合は明示的にフィールドを削除
      cleanedData.roastTimerState = deleteField() as any;
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
    } catch (error: any) {
      queue.retryCount++;
      
      // Write stream exhaustedエラーを検出。エラーメッセージから判定する。
      const isWriteStreamExhausted = 
        error?.code === 'resource-exhausted' ||
        (error?.message && typeof error.message === 'string' && 
         error.message.toLowerCase().includes('write stream exhausted'));
      
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

// ===== 欠陥豆マスタの関数 =====

/**
 * 欠陥豆マスターデータを取得する
 * @returns 欠陥豆マスターデータの配列
 */
export async function getDefectBeanMasterData(): Promise<DefectBean[]> {
  try {
    const db = getDb();
    const defectBeansRef = collection(db, 'defectBeans');
    // orderフィールドがない場合もあるため、すべて取得してからソートする
    const querySnapshot = await getDocs(defectBeansRef);
    
    const defectBeans: DefectBean[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      defectBeans.push({
        id: doc.id,
        name: data.name || '',
        imageUrl: data.imageUrl || '',
        characteristics: data.characteristics || '',
        tasteImpact: data.tasteImpact || '',
        removalReason: data.removalReason || '',
        isMaster: true,
        order: typeof data.order === 'number' ? data.order : undefined,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });
    
    // ソートを実行。orderフィールドがあるものは優先、ないものは名前順でソートする。
    defectBeans.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return a.name.localeCompare(b.name, 'ja');
    });
    
    return defectBeans;
  } catch (error) {
    console.error('Failed to get defect bean master data:', error);
    return [];
  }
}

/**
 * 欠陥豆マスターデータを更新
 * @param defectBeanId 欠陥豆ID
 * @param defectBean 更新する欠陥豆データ
 */
export async function updateDefectBeanMaster(
  defectBeanId: string,
  defectBean: Partial<DefectBean>
): Promise<void> {
  try {
    const db = getDb();
    const defectBeanRef = doc(db, 'defectBeans', defectBeanId);
    
    const updateData: any = {
      ...defectBean,
      updatedAt: new Date().toISOString(),
    };
    
    // id, isMaster, createdAtは更新しない
    delete updateData.id;
    delete updateData.isMaster;
    delete updateData.createdAt;
    
    await updateDoc(defectBeanRef, updateData);
  } catch (error) {
    console.error('Failed to update defect bean master:', error);
    throw error;
  }
}

/**
 * 欠陥豆マスターデータを削除
 * @param defectBeanId 削除する欠陥豆ID
 */
export async function deleteDefectBeanMaster(defectBeanId: string): Promise<void> {
  try {
    const db = getDb();
    const defectBeanRef = doc(db, 'defectBeans', defectBeanId);
    await deleteDoc(defectBeanRef);
  } catch (error) {
    console.error('Failed to delete defect bean master:', error);
    throw error;
  }
}

/**
 * ユーザー固有の欠陥豆を保存
 * @param userId ユーザーID
 * @param defectBean 欠陥豆データ
 * @param appData 現在のAppData
 */
export async function saveDefectBean(
  userId: string,
  defectBean: DefectBean,
  appData: AppData
): Promise<void> {
  const updatedDefectBeans = [...(appData.defectBeans || [])];
  const existingIndex = updatedDefectBeans.findIndex((db) => db.id === defectBean.id);
  
  if (existingIndex >= 0) {
    updatedDefectBeans[existingIndex] = defectBean;
  } else {
    updatedDefectBeans.push(defectBean);
  }
  
  const updatedData: AppData = {
    ...appData,
    defectBeans: updatedDefectBeans,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * ユーザー固有の欠陥豆を削除
 * @param userId ユーザーID
 * @param defectBeanId 削除する欠陥豆ID
 * @param appData 現在のAppData
 */
export async function deleteDefectBean(
  userId: string,
  defectBeanId: string,
  appData: AppData
): Promise<void> {
  const updatedDefectBeans = (appData.defectBeans || []).filter(
    (db) => db.id !== defectBeanId
  );
  
  const updatedData: AppData = {
    ...appData,
    defectBeans: updatedDefectBeans.length > 0 ? updatedDefectBeans : undefined,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 欠陥豆の設定（除去するかどうか）を更新
 * @param userId ユーザーID
 * @param defectBeanId 欠陥豆ID
 * @param shouldRemove 除去するかどうか
 * @param appData 現在のAppData
 */
export async function updateDefectBeanSetting(
  userId: string,
  defectBeanId: string,
  shouldRemove: boolean,
  appData: AppData
): Promise<void> {
  const updatedSettings: DefectBeanSettings = {
    ...(appData.defectBeanSettings || {}),
    [defectBeanId]: {
      shouldRemove,
    },
  };
  
  const updatedData: AppData = {
    ...appData,
    defectBeanSettings: updatedSettings,
  };
  
  await saveUserData(userId, updatedData);
}

// ===== 作業進捗関連の関数 =====

/**
 * weightフィールド（文字列、例：「10kg」「5個」「3枚」）から目標量（数値）を抽出
 * @param weight 数量文字列（例：「10kg」「5個」「3枚」「10.5kg」）
 * @returns 目標量（数値）。抽出できない場合はundefined
 */
export function extractTargetAmount(weight?: string): number | undefined {
  if (!weight) return undefined;
  
  // 正規表現で数値を抽出（小数点を含む、単位はkg、g、個、枚などに対応）
  const match = weight.match(/^(\d+(?:\.\d+)?)\s*(kg|g|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
  if (match && match[1]) {
    const amount = parseFloat(match[1]);
    return isNaN(amount) ? undefined : amount;
  }
  
  return undefined;
}

/**
 * weightフィールドから単位を抽出
 * @param weight 数量文字列（例：「10kg」「5個」「3枚」）
 * @returns 単位（例：「kg」「個」「枚」）。単位がない場合は空文字列
 */
export function extractUnitFromWeight(weight?: string): string {
  if (!weight) return '';
  
  // 正規表現で単位を抽出
  const match = weight.match(/^\d+(?:\.\d+)?\s*(kg|g|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
  return match && match[1] ? match[1] : '';
}

/**
 * 作業進捗を追加
 * @param userId ユーザーID
 * @param workProgress 作業進捗データ（id, createdAt, updatedAtは自動設定）
 * @param appData 現在のAppData
 */
export async function addWorkProgress(
  userId: string,
  workProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>,
  appData: AppData
): Promise<void> {
  const now = new Date().toISOString();
  
  // targetAmountが明示的にundefinedとして渡されている場合（完成数で管理する場合など）、
  // extractTargetAmountの結果を無視してundefinedを使用
  let targetAmount: number | undefined;
  if ('targetAmount' in workProgress && workProgress.targetAmount === undefined) {
    targetAmount = undefined;
  } else {
    // weightフィールドから目標量を抽出
    targetAmount = extractTargetAmount(workProgress.weight);
  }
  
  const newWorkProgress: WorkProgress = {
    ...workProgress,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    // 進捗状態に応じて日時を設定
    startedAt: workProgress.status === 'in_progress' || workProgress.status === 'completed' 
      ? now 
      : undefined,
    completedAt: workProgress.status === 'completed' 
      ? now 
      : undefined,
    // 目標量と現在の進捗量を設定
    targetAmount,
    currentAmount: targetAmount !== undefined ? 0 : undefined,
    // 完成数で管理する場合（targetAmount === undefined）、progressHistoryもundefinedにする
    progressHistory: targetAmount !== undefined ? [] : undefined,
    // 完成数の初期化（指定されていない場合は0で初期化、またはundefinedのまま）
    completedCount: workProgress.completedCount !== undefined ? workProgress.completedCount : undefined,
  };
  
  const updatedWorkProgresses = [...(appData.workProgresses || []), newWorkProgress];
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗を更新
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param updates 更新するフィールド
 * @param appData 現在のAppData
 */
export async function updateWorkProgress(
  userId: string,
  workProgressId: string,
  updates: Partial<Omit<WorkProgress, 'id' | 'createdAt'>>,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();
  
  // weightフィールドが変更された場合、目標量を再計算
  let targetAmount = existing.targetAmount;
  if (updates.weight !== undefined && updates.weight !== existing.weight) {
    targetAmount = extractTargetAmount(updates.weight);
    // 目標量が変更された場合、現在の進捗量を調整（目標量が削除された場合はundefined）
    if (targetAmount === undefined) {
      updates.currentAmount = undefined;
      updates.progressHistory = undefined;
    } else if (existing.currentAmount === undefined) {
      updates.currentAmount = 0;
    }
  }
  
  // targetAmountが明示的にundefinedとして渡された場合（進捗管理方式の変更など）
  if ('targetAmount' in updates && updates.targetAmount === undefined) {
    targetAmount = undefined;
    // 目標量が削除される場合、関連するデータもクリア
    updates.currentAmount = undefined;
    updates.progressHistory = undefined;
  }
  
  // 進捗状態の変更を検出して日時を適切に設定
  let startedAt = existing.startedAt;
  let completedAt = existing.completedAt;
  
  if (updates.status !== undefined && updates.status !== existing.status) {
    const oldStatus = existing.status;
    const newStatus = updates.status;
    
    if (oldStatus === 'pending' && newStatus === 'in_progress') {
      // pending → in_progress: startedAtを設定
      startedAt = now;
    } else if (oldStatus === 'pending' && newStatus === 'completed') {
      // pending → completed: startedAtとcompletedAtを設定
      startedAt = now;
      completedAt = now;
    } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
      // in_progress → completed: completedAtを設定（startedAtがない場合は設定）
      if (!startedAt) {
        startedAt = now;
      }
      completedAt = now;
    } else if (oldStatus === 'completed' && newStatus === 'in_progress') {
      // completed → in_progress: completedAtを削除
      completedAt = undefined;
    } else if (oldStatus === 'completed' && newStatus === 'pending') {
      // completed → pending: startedAtとcompletedAtを削除
      startedAt = undefined;
      completedAt = undefined;
    } else if (oldStatus === 'in_progress' && newStatus === 'pending') {
      // in_progress → pending: startedAtを削除
      startedAt = undefined;
    }
  }
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    ...updates,
    updatedAt: now,
    startedAt,
    completedAt,
    targetAmount: 'targetAmount' in updates ? updates.targetAmount : targetAmount,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 複数の作業進捗を一度に更新（グループ名の一括更新などに使用）
 * @param userId ユーザーID
 * @param updates 更新対象の作業進捗IDと更新内容のマップ
 * @param appData 現在のAppData
 */
export async function updateWorkProgresses(
  userId: string,
  updates: Map<string, Partial<Omit<WorkProgress, 'id' | 'createdAt'>>>,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const now = new Date().toISOString();
  const updatedWorkProgresses = [...workProgresses];
  let hasChanges = false;

  for (const [workProgressId, updateData] of updates.entries()) {
    const existingIndex = updatedWorkProgresses.findIndex((wp) => wp.id === workProgressId);
    
    if (existingIndex < 0) {
      console.warn(`WorkProgress with id ${workProgressId} not found`);
      continue;
    }

    const existing = updatedWorkProgresses[existingIndex];
    
    // weightフィールドが変更された場合、目標量を再計算
    let targetAmount = existing.targetAmount;
    if (updateData.weight !== undefined && updateData.weight !== existing.weight) {
      targetAmount = extractTargetAmount(updateData.weight);
      // 目標量が変更された場合、現在の進捗量を調整（目標量が削除された場合はundefined）
      if (targetAmount === undefined) {
        updateData.currentAmount = undefined;
        updateData.progressHistory = undefined;
      } else if (existing.currentAmount === undefined) {
        updateData.currentAmount = 0;
      }
    }

    // 進捗状態の変更を検出して日時を適切に設定
    let startedAt = existing.startedAt;
    let completedAt = existing.completedAt;

    if (updateData.status !== undefined && updateData.status !== existing.status) {
      const oldStatus = existing.status;
      const newStatus = updateData.status;

      if (oldStatus === 'pending' && newStatus === 'in_progress') {
        startedAt = now;
      } else if (oldStatus === 'pending' && newStatus === 'completed') {
        startedAt = now;
        completedAt = now;
      } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
        if (!startedAt) {
          startedAt = now;
        }
        completedAt = now;
      } else if (oldStatus === 'completed' && newStatus === 'in_progress') {
        completedAt = undefined;
      } else if (oldStatus === 'completed' && newStatus === 'pending') {
        startedAt = undefined;
        completedAt = undefined;
      } else if (oldStatus === 'in_progress' && newStatus === 'pending') {
        startedAt = undefined;
      }
    }

    const updatedWorkProgress: WorkProgress = {
      ...existing,
      ...updateData,
      updatedAt: now,
      startedAt,
      completedAt,
      targetAmount: targetAmount !== undefined ? targetAmount : updateData.targetAmount,
    };

    updatedWorkProgresses[existingIndex] = updatedWorkProgress;
    hasChanges = true;
  }

  if (hasChanges) {
    const updatedData: AppData = {
      ...appData,
      workProgresses: updatedWorkProgresses,
    };

    await saveUserData(userId, updatedData);
  }
}

/**
 * 作業進捗を削除
 * @param userId ユーザーID
 * @param workProgressId 削除する作業進捗ID
 * @param appData 現在のAppData
 */
export async function deleteWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const updatedWorkProgresses = (appData.workProgresses || []).filter(
    (wp) => wp.id !== workProgressId
  );
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗に完成数を追加
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param count 追加する完成数（数値）
 * @param memo メモ（任意）
 * @param appData 現在のAppData
 */
export async function addCompletedCountToWorkProgress(
  userId: string,
  workProgressId: string,
  count: number,
  appData: AppData,
  memo?: string
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();
  
  // 完成数を累積（マイナスの値も受け付ける）
  const completedCount = Math.max(0, (existing.completedCount || 0) + count);

  // 進捗履歴に新しいエントリを追加（完成数の追加も履歴として記録）
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount: count, // 完成数もamountとして記録（単位は異なるが、履歴として統一）
    memo: memo?.trim() || undefined,
  };

  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];

  // 進捗状態の自動変更
  let status = existing.status;
  let startedAt = existing.startedAt;

  // 完成数が0から増えた場合、pending → in_progress に自動変更
  const previousCount = existing.completedCount || 0;
  if (previousCount === 0 && completedCount > 0 && status === 'pending') {
    status = 'in_progress';
    // startedAtがない場合は設定
    if (!startedAt) {
      startedAt = now;
    }
  }

  const updatedWorkProgress: WorkProgress = {
    ...existing,
    completedCount,
    progressHistory,
    status,
    startedAt,
    updatedAt: now,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗に進捗量を追加
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param amount 追加する進捗量（kg単位、数値）
 * @param memo メモ（任意）
 * @param appData 現在のAppData
 */
export async function addProgressToWorkProgress(
  userId: string,
  workProgressId: string,
  amount: number,
  appData: AppData,
  memo?: string
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  
  // 目標量が設定されていない場合はエラー
  if (existing.targetAmount === undefined) {
    throw new Error('Target amount is not set');
  }
  
  const now = new Date().toISOString();
  
  // 進捗量を累積（負の値にならないように保護）
  const currentAmount = Math.max(0, (existing.currentAmount || 0) + amount);
  
  // 進捗履歴に新しいエントリを追加
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount,
    memo: memo?.trim() || undefined,
  };

  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];

  // 進捗状態の自動変更
  let status = existing.status;
  let completedAt = existing.completedAt;
  let startedAt = existing.startedAt;

  // 進捗量が0から増えた場合、pending → in_progress に自動変更
  const previousAmount = existing.currentAmount || 0;
  if (previousAmount === 0 && currentAmount > 0 && status === 'pending') {
    status = 'in_progress';
    // startedAtがない場合は設定
    if (!startedAt) {
      startedAt = now;
    }
  }

  // 目標量に達した場合は進捗状態をcompletedに自動変更
  if (currentAmount >= existing.targetAmount && status !== 'completed') {
    status = 'completed';
    completedAt = now;
    // startedAtがない場合は設定
    if (!startedAt) {
      startedAt = now;
    }
  }
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    progressHistory,
    status,
    startedAt,
    completedAt,
    updatedAt: now,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗をアーカイブ
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param appData 現在のAppData
 */
export async function archiveWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    archivedAt: now,
    updatedAt: now,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 作業進捗のアーカイブを解除
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param appData 現在のAppData
 */
export async function unarchiveWorkProgress(
  userId: string,
  workProgressId: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    archivedAt: undefined,
    updatedAt: now,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 進捗履歴エントリを更新
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param historyEntryId 更新する履歴エントリID
 * @param updates 更新するフィールド（amount, memo）
 * @param appData 現在のAppData
 */
export async function updateProgressHistoryEntry(
  userId: string,
  workProgressId: string,
  historyEntryId: string,
  updates: { amount?: number; memo?: string },
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const progressHistory = existing.progressHistory || [];
  const historyEntryIndex = progressHistory.findIndex((entry) => entry.id === historyEntryId);
  
  if (historyEntryIndex < 0) {
    throw new Error(`Progress history entry with id ${historyEntryId} not found`);
  }
  
  const now = new Date().toISOString();
  
  // 履歴エントリを更新
  const updatedHistory = [...progressHistory];
  updatedHistory[historyEntryIndex] = {
    ...updatedHistory[historyEntryIndex],
    ...(updates.amount !== undefined && { amount: updates.amount }),
    ...(updates.memo !== undefined && { memo: updates.memo?.trim() || undefined }),
  };
  
  // progressHistory全体からcurrentAmountまたはcompletedCountを再計算
  let currentAmount: number | undefined;
  let completedCount: number | undefined;
  
  if (existing.targetAmount !== undefined) {
    // 進捗量モード：progressHistoryのamountの合計を計算
    currentAmount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    currentAmount = Math.max(0, currentAmount);
  } else {
    // 完成数モード：progressHistoryのamountの合計を計算（完成数として扱う）
    completedCount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    completedCount = Math.max(0, completedCount);
  }
  
  // 進捗状態の自動変更
  let status = existing.status;
  let completedAt = existing.completedAt;
  let startedAt = existing.startedAt;
  
  if (existing.targetAmount !== undefined) {
    // 進捗量モード
    if (currentAmount === 0 && status !== 'pending') {
      status = 'pending';
      startedAt = undefined;
      completedAt = undefined;
    } else if (currentAmount > 0 && status === 'pending') {
      status = 'in_progress';
      if (!startedAt) {
        startedAt = now;
      }
    }
    
    if (currentAmount >= existing.targetAmount && status !== 'completed') {
      status = 'completed';
      completedAt = now;
      if (!startedAt) {
        startedAt = now;
      }
    } else if (currentAmount < existing.targetAmount && status === 'completed') {
      status = 'in_progress';
      completedAt = undefined;
    }
  } else {
    // 完成数モード
    if (completedCount === 0 && status !== 'pending') {
      status = 'pending';
      startedAt = undefined;
    } else if (completedCount > 0 && status === 'pending') {
      status = 'in_progress';
      if (!startedAt) {
        startedAt = now;
      }
    }
  }
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    completedCount,
    progressHistory: updatedHistory,
    status,
    startedAt,
    completedAt,
    updatedAt: now,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

/**
 * 進捗履歴エントリを削除
 * @param userId ユーザーID
 * @param workProgressId 作業進捗ID
 * @param historyEntryId 削除する履歴エントリID
 * @param appData 現在のAppData
 */
export async function deleteProgressHistoryEntry(
  userId: string,
  workProgressId: string,
  historyEntryId: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const progressHistory = existing.progressHistory || [];
  const historyEntryIndex = progressHistory.findIndex((entry) => entry.id === historyEntryId);
  
  if (historyEntryIndex < 0) {
    throw new Error(`Progress history entry with id ${historyEntryId} not found`);
  }
  
  const now = new Date().toISOString();
  
  // 履歴エントリを削除
  const updatedHistory = progressHistory.filter((entry) => entry.id !== historyEntryId);
  
  // progressHistory全体からcurrentAmountまたはcompletedCountを再計算
  let currentAmount: number | undefined;
  let completedCount: number | undefined;
  
  if (existing.targetAmount !== undefined) {
    // 進捗量モード：progressHistoryのamountの合計を計算
    currentAmount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    currentAmount = Math.max(0, currentAmount);
  } else {
    // 完成数モード：progressHistoryのamountの合計を計算（完成数として扱う）
    completedCount = updatedHistory.reduce((sum, entry) => sum + entry.amount, 0);
    // 負の値にならないように保護
    completedCount = Math.max(0, completedCount);
  }
  
  // 進捗状態の自動変更
  let status = existing.status;
  let completedAt = existing.completedAt;
  let startedAt = existing.startedAt;
  
  if (existing.targetAmount !== undefined) {
    // 進捗量モード
    if (currentAmount === 0 && status !== 'pending') {
      status = 'pending';
      startedAt = undefined;
      completedAt = undefined;
    } else if (currentAmount > 0 && status === 'pending') {
      status = 'in_progress';
      if (!startedAt) {
        startedAt = now;
      }
    }
    
    if (currentAmount >= existing.targetAmount && status !== 'completed') {
      status = 'completed';
      completedAt = now;
      if (!startedAt) {
        startedAt = now;
      }
    } else if (currentAmount < existing.targetAmount && status === 'completed') {
      status = 'in_progress';
      completedAt = undefined;
    }
  } else {
    // 完成数モード
    if (completedCount === 0 && status !== 'pending') {
      status = 'pending';
      startedAt = undefined;
    } else if (completedCount > 0 && status === 'pending') {
      status = 'in_progress';
      if (!startedAt) {
        startedAt = now;
      }
    }
  }
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    completedCount,
    progressHistory: updatedHistory.length > 0 ? updatedHistory : undefined,
    status,
    startedAt,
    completedAt,
    updatedAt: now,
  };
  
  const updatedWorkProgresses = [...workProgresses];
  updatedWorkProgresses[existingIndex] = updatedWorkProgress;
  
  const updatedData: AppData = {
    ...appData,
    workProgresses: updatedWorkProgresses,
  };
  
  await saveUserData(userId, updatedData);
}

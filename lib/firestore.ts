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
import type { AppData, DefectBean, DefectBeanSettings } from '@/types';
import { normalizeWorkProgress } from './workProgress';

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
      ? data.workProgresses.map(normalizeWorkProgress)
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

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
  roastTimerRecords: [],
  workProgresses: [],
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
    roastTimerRecords: Array.isArray(data?.roastTimerRecords)
      ? data.roastTimerRecords.map((record: any) => ({
          ...record,
          // roastDateがない場合はcreatedAtから日付を抽出、それもない場合は今日の日付
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
  
  // roastTimerStateは存在する場合のみ追加
  if (data?.roastTimerState && typeof data.roastTimerState === 'object') {
    normalized.roastTimerState = data.roastTimerState;
  }
  
  // defectBeansは存在する場合のみ追加
  if (Array.isArray(data?.defectBeans)) {
    normalized.defectBeans = data.defectBeans;
  }
  
  // defectBeanSettingsは存在する場合のみ追加
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
    
    // roastTimerStateの削除処理
    if (data.roastTimerState === undefined) {
      // roastTimerStateがundefinedの場合、既存のフィールドを削除
      cleanedData.roastTimerState = deleteField() as any;
    }
    
    await setDoc(userDocRef, cleanedData, { merge: true });
  } finally {
    // 書き込み完了後にスロットを解放（エラーが発生しても必ず解放）
    releaseWriteSlot();
  }
}

// 書き込み操作を実行（リトライロジック付き）
// Write stream exhausted対策: エラーハンドリング強化とキューサイズ監視
async function executeWrite(userId: string, data: AppData): Promise<void> {
  const queue = writeQueues.get(userId);
  if (!queue) {
    throw new Error('Write queue not found');
  }

  // 書き込みキューサイズを監視（グローバルキューとセマフォ待機キューを考慮）
  const totalQueuedWrites = writeWaitQueue.length + activeWriteCount;
  if (totalQueuedWrites >= MAX_QUEUE_SIZE) {
    // キューが飽和している場合は待機
    console.warn(`Firestore write queue size (${totalQueuedWrites}) exceeds limit (${MAX_QUEUE_SIZE}), waiting...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
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
      
      // Write stream exhaustedエラーを検出（エラーコードまたはメッセージで判定）
      const isWriteStreamExhausted = 
        error?.code === 'resource-exhausted' ||
        (error?.message && typeof error.message === 'string' && 
         error.message.toLowerCase().includes('write stream exhausted'));
      
      if (isWriteStreamExhausted && queue.retryCount <= MAX_RETRY_COUNT) {
        // Write stream exhaustedエラーの場合は、より長い待機時間を設定
        // 指数バックオフ + 追加の待機時間（キューが飽和している可能性が高いため）
        const baseDelay = RETRY_DELAY * Math.pow(2, queue.retryCount - 1);
        const additionalDelay = writeWaitQueue.length * 200; // 待機中の書き込み数に応じて追加待機
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

// ===== 欠点豆関連の関数 =====

/**
 * 欠点豆マスターデータを取得
 * @returns 欠点豆マスターデータの配列
 */
export async function getDefectBeanMasterData(): Promise<DefectBean[]> {
  try {
    const db = getDb();
    const defectBeansRef = collection(db, 'defectBeans');
    // orderフィールドがない場合も考慮して、まず全て取得してからソート
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
    
    // クライアント側でソート（orderフィールドがあるもの優先、その後名前順）
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
 * 欠点豆マスターデータを更新
 * @param defectBeanId 欠点豆ID
 * @param defectBean 更新する欠点豆データ
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
 * 欠点豆マスターデータを削除
 * @param defectBeanId 削除する欠点豆ID
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
 * ユーザー追加欠点豆を保存
 * @param userId ユーザーID
 * @param defectBean 欠点豆データ
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
 * ユーザー追加欠点豆を削除
 * @param userId ユーザーID
 * @param defectBeanId 削除する欠点豆ID
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
 * 欠点豆設定（省く/省かない）を更新
 * @param userId ユーザーID
 * @param defectBeanId 欠点豆ID
 * @param shouldRemove 省くかどうか
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
function extractTargetAmount(weight?: string): number | undefined {
  if (!weight) return undefined;
  
  // 正規表現で数値を抽出（小数点を含む、単位はkg、個、枚などに対応）
  const match = weight.match(/^(\d+(?:\.\d+)?)\s*(kg|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
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
function extractUnit(weight?: string): string {
  if (!weight) return '';
  
  // 正規表現で単位を抽出
  const match = weight.match(/^\d+(?:\.\d+)?\s*(kg|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
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
  
  // weightフィールドから目標量を抽出
  const targetAmount = extractTargetAmount(workProgress.weight);
  
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
    progressHistory: [],
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
    targetAmount: targetAmount !== undefined ? targetAmount : updates.targetAmount,
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
  memo?: string,
  appData: AppData
): Promise<void> {
  const workProgresses = appData.workProgresses || [];
  const existingIndex = workProgresses.findIndex((wp) => wp.id === workProgressId);
  
  if (existingIndex < 0) {
    throw new Error(`WorkProgress with id ${workProgressId} not found`);
  }
  
  const existing = workProgresses[existingIndex];
  const now = new Date().toISOString();
  
  // 完成数を累積
  const completedCount = (existing.completedCount || 0) + count;
  
  // 進捗履歴に新しいエントリを追加（完成数の追加も履歴として記録）
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount: count, // 完成数もamountとして記録（単位は異なるが、履歴として統一）
    memo: memo?.trim() || undefined,
  };
  
  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    completedCount,
    progressHistory,
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
  memo?: string,
  appData: AppData
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
  
  // 進捗量を累積
  const currentAmount = (existing.currentAmount || 0) + amount;
  
  // 進捗履歴に新しいエントリを追加
  const newProgressEntry: ProgressEntry = {
    id: crypto.randomUUID(),
    date: now,
    amount,
    memo: memo?.trim() || undefined,
  };
  
  const progressHistory = [...(existing.progressHistory || []), newProgressEntry];
  
  // 目標量に達した場合は進捗状態をcompletedに自動変更
  let status = existing.status;
  let completedAt = existing.completedAt;
  if (currentAmount >= existing.targetAmount && status !== 'completed') {
    status = 'completed';
    completedAt = now;
    // startedAtがない場合は設定
    if (!existing.startedAt) {
      existing.startedAt = now;
    }
  }
  
  const updatedWorkProgress: WorkProgress = {
    ...existing,
    currentAmount,
    progressHistory,
    status,
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

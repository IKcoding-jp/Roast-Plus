import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  deleteField,
} from 'firebase/firestore';
import app from './firebase';
import type { AppData } from '@/types';

const db = getFirestore(app);

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
};

function getUserDocRef(userId: string) {
  return doc(db, 'users', userId);
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
      // undefinedのフィールドを削除してから保存
      const cleanedData = removeUndefinedFields(normalizedData);
      await setDoc(userDocRef, cleanedData, { merge: true });
      return normalizedData;
    }
    
    // undefinedのフィールドを削除してから保存
    const cleanedDefaultData = removeUndefinedFields(defaultData);
    await setDoc(userDocRef, cleanedDefaultData);
    return defaultData;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    return defaultData;
  }
}

export async function saveUserData(userId: string, data: AppData): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Failed to save data to Firestore:', error);
    throw error;
  }
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

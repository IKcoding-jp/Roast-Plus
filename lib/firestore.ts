import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
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
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

// データを正規化する関数（不足しているフィールドをデフォルト値で補完）
function normalizeAppData(data: any): AppData {
  return {
    teams: Array.isArray(data?.teams) ? data.teams : [],
    members: Array.isArray(data?.members) ? data.members : [],
    taskLabels: Array.isArray(data?.taskLabels) ? data.taskLabels : [],
    assignments: Array.isArray(data?.assignments) ? data.assignments : [],
    assignmentHistory: Array.isArray(data?.assignmentHistory) ? data.assignmentHistory : [],
    todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
    roastSchedules: Array.isArray(data?.roastSchedules) ? data.roastSchedules : [],
    tastingRecords: Array.isArray(data?.tastingRecords) ? data.tastingRecords : [],
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
  };
}

export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const normalizedData = normalizeAppData(data);
      // 正規化したデータを保存（既存データに不足しているフィールドを追加）
      await setDoc(userDocRef, normalizedData, { merge: true });
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
    await setDoc(userDocRef, cleanedData);
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

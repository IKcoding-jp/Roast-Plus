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

export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as AppData;
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
        callback(snapshot.data() as AppData);
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

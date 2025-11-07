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

export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as AppData;
    }
    
    await setDoc(userDocRef, defaultData);
    return defaultData;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    return defaultData;
  }
}

export async function saveUserData(userId: string, data: AppData): Promise<void> {
  try {
    const userDocRef = getUserDocRef(userId);
    await setDoc(userDocRef, data);
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

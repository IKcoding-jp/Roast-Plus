import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { getDb } from './common';
import { saveUserData } from './userData';
import type { AppData, DefectBean, DefectBeanSettings } from '@/types';

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

    const updateData: Partial<DefectBean> & { updatedAt: string } = {
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

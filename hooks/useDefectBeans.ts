'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getDefectBeanMasterData, updateDefectBeanMaster, deleteDefectBeanMaster } from '@/lib/firestore';
import { uploadDefectBeanImage, deleteDefectBeanImage } from '@/lib/storage';
import { useAppData } from './useAppData';
import type { DefectBean } from '@/types';

export function useDefectBeans() {
  const { user, loading: authLoading } = useAuth();
  const { data: appData, updateData } = useAppData();
  const [masterDefectBeans, setMasterDefectBeans] = useState<DefectBean[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // マスターデータを取得
  useEffect(() => {
    // 認証チェックが完了するまで待つ
    if (authLoading) {
      return;
    }

    // 認証済みユーザーのみマスターデータを取得
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadMasterData = async () => {
      try {
        const masterData = await getDefectBeanMasterData();
        setMasterDefectBeans(masterData);
      } catch (error) {
        console.error('Failed to load master defect beans:', error);
        // エラー時も空配列を設定してローディングを終了
        setMasterDefectBeans([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMasterData();
  }, [user, authLoading]);

  // 全欠点豆（マスター + ユーザー追加）を取得
  const getAllDefectBeans = useCallback((): DefectBean[] => {
    const userDefectBeans = appData.defectBeans || [];
    return [...masterDefectBeans, ...userDefectBeans];
  }, [masterDefectBeans, appData.defectBeans]);

  // ユーザー追加欠点豆を保存
  const addDefectBean = useCallback(
    async (
      defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
      imageFile: File
    ): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // IDを生成
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        // 画像をアップロード
        const imageUrl = await uploadDefectBeanImage(user.uid, id, imageFile);

        // 欠点豆データを作成
        const newDefectBean: DefectBean = {
          ...defectBean,
          id,
          imageUrl,
          isMaster: false,
          userId: user.uid,
          createdAt: now,
          updatedAt: now,
        };

        // ローカル状態を更新（Firestoreへの保存はupdateData内で行われる）
        await updateData((currentData) => ({
          ...currentData,
          defectBeans: [...(currentData.defectBeans || []), newDefectBean],
        }));
      } catch (error) {
        console.error('Failed to add defect bean:', error);
        throw error;
      }
    },
    [user, updateData]
  );

  // 欠点豆を更新
  const updateDefectBean = useCallback(
    async (
      defectBeanId: string,
      defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
      imageFile: File | null,
      oldImageUrl?: string
    ): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // 既存の欠点豆を取得
        const allBeans = getAllDefectBeans();
        const existingBean = allBeans.find((db) => db.id === defectBeanId);
        
        if (!existingBean) {
          throw new Error('Defect bean not found');
        }

        let newImageUrl = existingBean.imageUrl;

        // 画像が変更された場合
        if (imageFile) {
          // 新しい画像をアップロード
          if (existingBean.isMaster) {
            // マスターデータの場合は、userIdとして空文字列を使用（パスを統一するため）
            newImageUrl = await uploadDefectBeanImage('', defectBeanId, imageFile);
          } else {
            newImageUrl = await uploadDefectBeanImage(user.uid, defectBeanId, imageFile);
          }

          // アップロード成功後、既存画像を削除
          if (oldImageUrl && oldImageUrl !== newImageUrl) {
            try {
              await deleteDefectBeanImage(oldImageUrl);
            } catch (deleteError) {
              console.error('Failed to delete old image:', deleteError);
              // エラー時も続行（既存画像は保持される）
            }
          }
        }

        const now = new Date().toISOString();
        const updatedDefectBean: DefectBean = {
          ...existingBean,
          ...defectBean,
          imageUrl: newImageUrl,
          updatedAt: now,
        };

        if (existingBean.isMaster) {
          // マスターデータの更新
          await updateDefectBeanMaster(defectBeanId, updatedDefectBean);
          // ローカル状態も更新
          setMasterDefectBeans((prev) =>
            prev.map((db) => (db.id === defectBeanId ? updatedDefectBean : db))
          );
        } else {
          // ユーザーデータの更新
          await updateData((currentData) => ({
            ...currentData,
            defectBeans: (currentData.defectBeans || []).map((db) =>
              db.id === defectBeanId ? updatedDefectBean : db
            ),
          }));
        }
      } catch (error) {
        console.error('Failed to update defect bean:', error);
        throw error;
      }
    },
    [user, updateData, getAllDefectBeans]
  );

  // 欠点豆を削除
  const removeDefectBean = useCallback(
    async (defectBeanId: string, imageUrl: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // 既存の欠点豆を取得
        const allBeans = getAllDefectBeans();
        const existingBean = allBeans.find((db) => db.id === defectBeanId);
        
        if (!existingBean) {
          throw new Error('Defect bean not found');
        }

        // 画像を削除
        await deleteDefectBeanImage(imageUrl);

        if (existingBean.isMaster) {
          // マスターデータの削除
          await deleteDefectBeanMaster(defectBeanId);
          // ローカル状態も更新
          setMasterDefectBeans((prev) => prev.filter((db) => db.id !== defectBeanId));
        } else {
          // ユーザーデータの削除
          await updateData((currentData) => ({
            ...currentData,
            defectBeans: (currentData.defectBeans || []).filter((db) => db.id !== defectBeanId),
          }));
        }
      } catch (error) {
        console.error('Failed to remove defect bean:', error);
        throw error;
      }
    },
    [user, updateData, getAllDefectBeans]
  );

  return {
    masterDefectBeans,
    userDefectBeans: appData.defectBeans || [],
    allDefectBeans: getAllDefectBeans(),
    isLoading,
    addDefectBean,
    updateDefectBean,
    removeDefectBean,
  };
}


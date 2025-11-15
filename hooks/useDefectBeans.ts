'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getDefectBeanMasterData } from '@/lib/firestore';
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
      defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster'>,
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

  // ユーザー追加欠点豆を削除
  const removeDefectBean = useCallback(
    async (defectBeanId: string, imageUrl: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // 画像を削除
        await deleteDefectBeanImage(imageUrl);

        // ローカル状態を更新（Firestoreへの保存はupdateData内で行われる）
        await updateData((currentData) => ({
          ...currentData,
          defectBeans: (currentData.defectBeans || []).filter((db) => db.id !== defectBeanId),
        }));
      } catch (error) {
        console.error('Failed to remove defect bean:', error);
        throw error;
      }
    },
    [user, updateData]
  );

  return {
    masterDefectBeans,
    userDefectBeans: appData.defectBeans || [],
    allDefectBeans: getAllDefectBeans(),
    isLoading,
    addDefectBean,
    removeDefectBean,
  };
}


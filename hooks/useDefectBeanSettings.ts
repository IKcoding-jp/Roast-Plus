'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useAppData } from './useAppData';
import type { DefectBeanSettings } from '@/types';

export function useDefectBeanSettings() {
  const { user } = useAuth();
  const { data: appData, updateData } = useAppData();

  // 設定を取得
  const getSetting = useCallback(
    (defectBeanId: string): boolean | undefined => {
      return appData.defectBeanSettings?.[defectBeanId]?.shouldRemove;
    },
    [appData.defectBeanSettings]
  );

  // 設定を更新
  const updateSetting = useCallback(
    async (defectBeanId: string, shouldRemove: boolean): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // ローカル状態を更新（Firestoreへの保存はupdateData内で行われる）
        await updateData((currentData) => {
          const updatedSettings: DefectBeanSettings = {
            ...(currentData.defectBeanSettings || {}),
            [defectBeanId]: {
              shouldRemove,
            },
          };
          return {
            ...currentData,
            defectBeanSettings: updatedSettings,
          };
        });
      } catch (error) {
        console.error('Failed to update defect bean setting:', error);
        throw error;
      }
    },
    [user, updateData]
  );

  // 設定を削除（未設定状態に戻す）
  const removeSetting = useCallback(
    async (defectBeanId: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const updatedSettings = { ...(appData.defectBeanSettings || {}) };
        delete updatedSettings[defectBeanId];

        const updatedData = {
          ...appData,
          defectBeanSettings: Object.keys(updatedSettings).length > 0 ? updatedSettings : undefined,
        };

        // ローカル状態を更新（Firestoreへの保存はupdateData内で行われる）
        await updateData(() => updatedData);
      } catch (error) {
        console.error('Failed to remove defect bean setting:', error);
        throw error;
      }
    },
    [user, appData, updateData]
  );

  return {
    settings: appData.defectBeanSettings || {},
    getSetting,
    updateSetting,
    removeSetting,
  };
}


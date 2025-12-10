'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppData } from './useAppData';
import type { Notification } from '@/types';

const READ_IDS_STORAGE_KEY = 'roastplus_notification_read_ids';

export function useNotifications() {
  const { data, updateData, isLoading: appDataLoading } = useAppData();
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(READ_IDS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load readIds from localStorage:', error);
      return [];
    }
  });
  const [migrationDone, setMigrationDone] = useState(false);
  const hasMigratedRef = useRef(false);

  // Firestoreから通知データを取得し、既存のlocalStorageデータを移行
  useEffect(() => {
    if (appDataLoading) {
      return;
    }

    if (hasMigratedRef.current) {
      return;
    }

    // 移行処理を実行
    hasMigratedRef.current = true;
    
    const migrateLocalStorageData = () => {
      try {
        const oldStorageKey = 'roastplus_notifications';
        const stored = localStorage.getItem(oldStorageKey);
        
        const currentData = data;
        const firestoreNotifications = currentData.notifications || [];
        const existingIds = new Set(firestoreNotifications.map(n => n.id));
        
        if (stored) {
          const oldData: { notifications: Notification[]; readIds: string[] } = JSON.parse(stored);
          
          if (oldData.readIds && oldData.readIds.length > 0) {
            localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(oldData.readIds));
            setReadIds(oldData.readIds);
          }
          
          const oldNotifications = oldData.notifications || [];
          const newNotifications = [
            ...firestoreNotifications,
            ...oldNotifications.filter(n => !existingIds.has(n.id)),
          ];
          
          if (newNotifications.length !== firestoreNotifications.length) {
            void updateData({
              ...currentData,
              notifications: newNotifications,
            });
          }
          
          localStorage.removeItem(oldStorageKey);
        }
        
        hasMigratedRef.current = true;
        setMigrationDone(true);
      } catch (error) {
        console.error('Failed to migrate localStorage data:', error);
        hasMigratedRef.current = true;
        setMigrationDone(true);
      }
    };

    migrateLocalStorageData();
  }, [appDataLoading, data, updateData]);

  // 通知データを取得
  const notifications = useMemo(() => data.notifications || [], [data.notifications]);

  // 未確認通知数を計算
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  // 全て既読にする
  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(allIds));
    } catch (error) {
      console.error('Failed to save read status to localStorage:', error);
    }
  }, [notifications]);

  // 通知を追加
  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
      };
      const updatedNotifications = [...notifications, newNotification];
      await updateData({
        ...data,
        notifications: updatedNotifications,
      });
    },
    [notifications, data, updateData]
  );

  // 通知を更新
  const updateNotification = useCallback(
    async (id: string, updates: Partial<Notification>) => {
      const updatedNotifications = notifications.map(n =>
        n.id === id ? { ...n, ...updates } : n
      );
      await updateData({
        ...data,
        notifications: updatedNotifications,
      });
    },
    [notifications, data, updateData]
  );

  // 通知を削除
  const deleteNotification = useCallback(
    async (id: string) => {
      const updatedNotifications = notifications.filter(n => n.id !== id);
      // 削除された通知の既読状態も削除
      const updatedReadIds = readIds.filter(readId => readId !== id);
      setReadIds(updatedReadIds);
      try {
        localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(updatedReadIds));
      } catch (error) {
        console.error('Failed to update readIds in localStorage:', error);
      }
      await updateData({
        ...data,
        notifications: updatedNotifications,
      });
    },
    [notifications, readIds, data, updateData]
  );

  return {
    notifications,
    readIds,
    unreadCount,
    markAllAsRead,
    addNotification,
    updateNotification,
    deleteNotification,
    isLoading: appDataLoading || !migrationDone,
  };
}

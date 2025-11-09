'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppData } from './useAppData';
import type { Notification } from '@/types';

const READ_IDS_STORAGE_KEY = 'roastplus_notification_read_ids';

// デフォルトの通知データ（初期表示用）
const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'ローストプラスへようこそ',
    content: 'ローストプラスをご利用いただきありがとうございます。BYSNでの仕事をサポートするための機能をご利用いただけます。',
    date: new Date().toISOString().split('T')[0],
    type: 'announcement',
  },
];

export function useNotifications() {
  const { data, updateData, isLoading: appDataLoading } = useAppData();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);

  // 既読状態をlocalStorageから読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_IDS_STORAGE_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load readIds from localStorage:', error);
    }
  }, []);

  // Firestoreから通知データを取得し、既存のlocalStorageデータを移行
  useEffect(() => {
    if (appDataLoading || hasMigrated) {
      return;
    }

    const migrateLocalStorageData = async () => {
      try {
        const oldStorageKey = 'roastplus_notifications';
        const stored = localStorage.getItem(oldStorageKey);
        
        if (stored) {
          const oldData: { notifications: Notification[]; readIds: string[] } = JSON.parse(stored);
          
          // 既読状態を新しいストレージキーに移行
          if (oldData.readIds && oldData.readIds.length > 0) {
            localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(oldData.readIds));
            setReadIds(oldData.readIds);
          }
          
          // 通知データをFirestoreに移行（デフォルト通知とマージ）
          const firestoreNotifications = data.notifications || [];
          const existingIds = new Set(firestoreNotifications.map(n => n.id));
          const oldNotifications = oldData.notifications || [];
          
          // デフォルト通知を追加（まだ存在しない場合）
          const defaultIds = new Set(firestoreNotifications.map(n => n.id));
          const missingDefaults = defaultNotifications.filter(n => !defaultIds.has(n.id));
          
          // 古い通知データを追加（重複を避ける）
          const newNotifications = [
            ...firestoreNotifications,
            ...missingDefaults,
            ...oldNotifications.filter(n => !existingIds.has(n.id) && !defaultIds.has(n.id)),
          ];
          
          if (newNotifications.length !== firestoreNotifications.length) {
            await updateData({
              ...data,
              notifications: newNotifications,
            });
          }
          
          // 古いストレージキーを削除
          localStorage.removeItem(oldStorageKey);
        } else {
          // localStorageにデータがない場合、デフォルト通知を追加
          const firestoreNotifications = data.notifications || [];
          const existingIds = new Set(firestoreNotifications.map(n => n.id));
          const missingDefaults = defaultNotifications.filter(n => !existingIds.has(n.id));
          
          if (missingDefaults.length > 0) {
            await updateData({
              ...data,
              notifications: [...firestoreNotifications, ...missingDefaults],
            });
          }
        }
        
        setHasMigrated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to migrate localStorage data:', error);
        setHasMigrated(true);
        setIsLoading(false);
      }
    };

    migrateLocalStorageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appDataLoading]);

  // 通知データを取得（デフォルト通知とマージ）
  const notifications = (() => {
    const firestoreNotifications = data.notifications || [];
    const existingIds = new Set(firestoreNotifications.map(n => n.id));
    const missingDefaults = defaultNotifications.filter(n => !existingIds.has(n.id));
    return [...firestoreNotifications, ...missingDefaults];
  })();

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
    isLoading: isLoading || appDataLoading,
  };
}

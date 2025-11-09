'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types';

const STORAGE_KEY = 'roastplus_notifications';

interface NotificationStorage {
  notifications: Notification[];
  readIds: string[];
}

const defaultStorage: NotificationStorage = {
  notifications: [],
  readIds: [],
};

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
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: NotificationStorage = JSON.parse(stored);
        // デフォルト通知と既存通知をマージ（重複を避ける）
        const existingIds = new Set(data.notifications.map(n => n.id));
        const mergedNotifications = [
          ...data.notifications,
          ...defaultNotifications.filter(n => !existingIds.has(n.id)),
        ];
        setNotifications(mergedNotifications);
        setReadIds(data.readIds || []);
      } else {
        // 初回起動時はデフォルト通知を保存
        const initialData: NotificationStorage = {
          notifications: defaultNotifications,
          readIds: [],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        setNotifications(defaultNotifications);
        setReadIds([]);
      }
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error);
      setNotifications(defaultNotifications);
      setReadIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 未確認通知数を計算
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  // 全て既読にする
  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data: NotificationStorage = stored
        ? JSON.parse(stored)
        : defaultStorage;
      const updatedData: NotificationStorage = {
        ...data,
        readIds: allIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save read status to localStorage:', error);
    }
  }, [notifications]);

  return {
    notifications,
    readIds,
    unreadCount,
    markAllAsRead,
    isLoading,
  };
}


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserData, saveUserData, subscribeUserData } from '@/lib/firestore';
import type { AppData } from '@/types';

export function useAppData() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>({
    teams: [],
    members: [],
    taskLabels: [],
    assignments: [],
    assignmentHistory: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // 初期データ読み込み
    getUserData(user.uid)
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load initial data:', error);
        setIsLoading(false);
      });

    // リアルタイム監視
    const unsubscribe = subscribeUserData(user.uid, (data) => {
      setData(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const updateData = useCallback(
    async (newData: AppData) => {
      if (!user) return;

      setData(newData);
      try {
        await saveUserData(user.uid, newData);
      } catch (error) {
        console.error('Failed to save data:', error);
        // エラー時は最新データを再取得
        getUserData(user.uid)
          .then((data) => {
            setData(data);
          })
          .catch((err) => {
            console.error('Failed to recover data:', err);
          });
      }
    },
    [user]
  );

  return { data, updateData, isLoading };
}

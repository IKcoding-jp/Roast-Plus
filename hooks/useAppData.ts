'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    todaySchedules: [],
    roastSchedules: [],
    tastingRecords: [],
    notifications: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const isUpdatingRef = useRef(false);

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
      // 更新中でない場合のみ、Firestoreからの更新を受け入れる
      if (!isUpdatingRef.current) {
        setData(data);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const updateData = useCallback(
    async (newData: AppData) => {
      if (!user) return;

      isUpdatingRef.current = true;
      setData(newData);
      try {
        await saveUserData(user.uid, newData);
        // 保存後にフラグをリセット（少し遅延させて、Firestoreからの更新が来る前に）
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      } catch (error) {
        console.error('Failed to save data:', error);
        isUpdatingRef.current = false;
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

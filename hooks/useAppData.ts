'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserData, saveUserData, subscribeUserData } from '@/lib/firestore';
import type { AppData } from '@/types';

export function useAppData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AppData>({
    teams: [],
    members: [],
    taskLabels: [],
    assignments: [],
    assignmentHistory: [],
    todaySchedules: [],
    roastSchedules: [],
    tastingSessions: [],
    tastingRecords: [],
    notifications: [],
    encouragementCount: 0,
    roastTimerRecords: [],
    workProgresses: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // 認証チェックが完了するまで待つ
    if (authLoading) {
      return;
    }

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
  }, [user, authLoading]);

  const updateData = useCallback(
    async (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => {
      if (!user) return;

      // 関数の場合は現在のデータを渡して新しいデータを取得
      const newData = typeof newDataOrUpdater === 'function' 
        ? newDataOrUpdater(data)
        : newDataOrUpdater;

      // データの完全性を検証
      const normalizedData = {
        teams: Array.isArray(newData.teams) ? newData.teams : data.teams,
        members: Array.isArray(newData.members) ? newData.members : data.members,
        taskLabels: Array.isArray(newData.taskLabels) ? newData.taskLabels : data.taskLabels,
        assignments: Array.isArray(newData.assignments) ? newData.assignments : data.assignments,
        assignmentHistory: Array.isArray(newData.assignmentHistory) ? newData.assignmentHistory : data.assignmentHistory,
        todaySchedules: Array.isArray(newData.todaySchedules) ? newData.todaySchedules : data.todaySchedules,
        roastSchedules: Array.isArray(newData.roastSchedules) ? newData.roastSchedules : data.roastSchedules,
        tastingSessions: Array.isArray(newData.tastingSessions) ? newData.tastingSessions : data.tastingSessions,
        tastingRecords: Array.isArray(newData.tastingRecords) ? newData.tastingRecords : data.tastingRecords,
        notifications: Array.isArray(newData.notifications) ? newData.notifications : data.notifications,
        manager: newData.manager !== undefined ? newData.manager : data.manager,
        userSettings: newData.userSettings || data.userSettings,
        shuffleEvent: newData.shuffleEvent !== undefined ? newData.shuffleEvent : data.shuffleEvent,
        encouragementCount: typeof newData.encouragementCount === 'number' ? newData.encouragementCount : (data.encouragementCount ?? 0),
        roastTimerRecords: Array.isArray(newData.roastTimerRecords) ? newData.roastTimerRecords : data.roastTimerRecords,
        roastTimerState: newData.roastTimerState !== undefined ? newData.roastTimerState : data.roastTimerState,
        defectBeans: newData.defectBeans !== undefined ? newData.defectBeans : data.defectBeans,
        defectBeanSettings: newData.defectBeanSettings !== undefined ? newData.defectBeanSettings : data.defectBeanSettings,
        workProgresses: Array.isArray(newData.workProgresses) ? newData.workProgresses : data.workProgresses,
      };

      isUpdatingRef.current = true;
      setData(normalizedData);
      try {
        await saveUserData(user.uid, normalizedData);
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
    [user, data]
  );

  return { data, updateData, isLoading };
}

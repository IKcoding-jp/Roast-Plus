'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserData, saveUserData, subscribeUserData, SAVE_USER_DATA_DEBOUNCE_MS } from '@/lib/firestore';
import type { AppData } from '@/types';

function hasOwn<T extends object>(obj: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function areDeeplyEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i += 1) {
      if (!areDeeplyEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    keysA.sort();
    keysB.sort();

    for (let i = 0; i < keysA.length; i += 1) {
      if (keysA[i] !== keysB[i]) {
        return false;
      }
      if (!areDeeplyEqual((a as Record<string, unknown>)[keysA[i]], (b as Record<string, unknown>)[keysB[i]])) {
        return false;
      }
    }
    return true;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b);
  }

  if (typeof a === 'undefined' || typeof b === 'undefined') {
    return typeof a === 'undefined' && typeof b === 'undefined';
  }

  return false;
}

const INITIAL_APP_DATA: AppData = {
  teams: [],
  members: [],
  taskLabels: [],
  taskLabelHistory: [],
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
  counterRecords: [],
};

const FIRESTORE_ACK_TIMEOUT_MS = SAVE_USER_DATA_DEBOUNCE_MS + 800;

export function useAppData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AppData>(INITIAL_APP_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const isUpdatingRef = useRef(false);
  const latestLocalDataRef = useRef<AppData>(INITIAL_APP_DATA);
  const lockedKeysRef = useRef<Set<keyof AppData>>(new Set());
  const pendingSaveCountRef = useRef(0);
  const lastMutationTimestampRef = useRef(0);

  const commitData = useCallback((nextData: AppData) => {
    setData(nextData);
    latestLocalDataRef.current = nextData;
  }, []);

  const applyIncomingSnapshot = useCallback(
    (incomingData: AppData) => {
      const lockedKeys = lockedKeysRef.current;

      if (!isUpdatingRef.current || lockedKeys.size === 0) {
        commitData(incomingData);
        setIsLoading(false);
        return;
      }

      const serverHasAllLockedFields = Array.from(lockedKeys).every((key) =>
        areDeeplyEqual(incomingData[key], latestLocalDataRef.current[key])
      );

      if (serverHasAllLockedFields) {
        lockedKeys.clear();
        if (pendingSaveCountRef.current === 0) {
          isUpdatingRef.current = false;
        }
        commitData(incomingData);
        setIsLoading(false);
        return;
      }

      const now = Date.now();
      const ackTimedOut =
        pendingSaveCountRef.current === 0 &&
        now - lastMutationTimestampRef.current >= FIRESTORE_ACK_TIMEOUT_MS;

      if (ackTimedOut) {
        lockedKeys.clear();
        isUpdatingRef.current = false;
        commitData(incomingData);
        setIsLoading(false);
        return;
      }

      const mergedData: AppData = { ...incomingData };
      lockedKeys.forEach((key) => {
        // lockedKeysに含まれるキーは常にlatestLocalDataRef.currentに存在する
        const value = latestLocalDataRef.current[key];
        if (value !== undefined) {
          // TypeScriptの型推論を補助するための型アサーション
          (mergedData as Record<keyof AppData, AppData[keyof AppData]>)[key] = value;
        }
      });

      commitData(mergedData);
      setIsLoading(false);
    },
    [commitData]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      lockedKeysRef.current.clear();
      pendingSaveCountRef.current = 0;
      isUpdatingRef.current = false;
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    getUserData(user.uid)
      .then((userData) => {
        if (!isMounted) return;
        commitData(userData);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error('Failed to load initial data:', error);
        setIsLoading(false);
      });

    const unsubscribe = subscribeUserData(user.uid, (incomingData) => {
      if (!isMounted) return;
      applyIncomingSnapshot(incomingData);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user, authLoading, applyIncomingSnapshot, commitData]);

  // isLoadingの参照を保持（コールバック内で最新の値を使用するため）
  const isLoadingRef = useRef(true);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const updateData = useCallback(
    async (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => {
      if (!user) return;

      // データ読み込み中は更新を許可しない（データ消失防止）
      if (isLoadingRef.current) {
        console.warn('Cannot update data while loading. This prevents overwriting data with initial empty state.');
        return;
      }

      const currentData = latestLocalDataRef.current;
      const newData =
        typeof newDataOrUpdater === 'function'
          ? (newDataOrUpdater as (currentData: AppData) => AppData)(currentData)
          : newDataOrUpdater;

      const hasRoastTimerStateOverride = hasOwn(newData, 'roastTimerState');

      const normalizedData: AppData = {
        teams: Array.isArray(newData.teams) ? newData.teams : currentData.teams,
        members: Array.isArray(newData.members) ? newData.members : currentData.members,
        taskLabels: Array.isArray(newData.taskLabels) ? newData.taskLabels : currentData.taskLabels,
        taskLabelHistory: Array.isArray(newData.taskLabelHistory) ? newData.taskLabelHistory : currentData.taskLabelHistory,
        assignments: Array.isArray(newData.assignments) ? newData.assignments : currentData.assignments,
        assignmentHistory: Array.isArray(newData.assignmentHistory) ? newData.assignmentHistory : currentData.assignmentHistory,
        todaySchedules: Array.isArray(newData.todaySchedules) ? newData.todaySchedules : currentData.todaySchedules,
        roastSchedules: Array.isArray(newData.roastSchedules) ? newData.roastSchedules : currentData.roastSchedules,
        tastingSessions: Array.isArray(newData.tastingSessions) ? newData.tastingSessions : currentData.tastingSessions,
        tastingRecords: Array.isArray(newData.tastingRecords) ? newData.tastingRecords : currentData.tastingRecords,
        notifications: Array.isArray(newData.notifications) ? newData.notifications : currentData.notifications,
        manager: hasOwn(newData, 'manager') ? newData.manager : currentData.manager,
        userSettings: hasOwn(newData, 'userSettings') ? newData.userSettings : currentData.userSettings,
        shuffleEvent: hasOwn(newData, 'shuffleEvent') ? newData.shuffleEvent : currentData.shuffleEvent,
        encouragementCount: hasOwn(newData, 'encouragementCount')
          ? typeof newData.encouragementCount === 'number'
            ? newData.encouragementCount
            : currentData.encouragementCount ?? 0
          : currentData.encouragementCount ?? 0,
        roastTimerRecords: Array.isArray(newData.roastTimerRecords) ? newData.roastTimerRecords : currentData.roastTimerRecords,
        roastTimerState: hasRoastTimerStateOverride ? newData.roastTimerState : currentData.roastTimerState,
        defectBeans: hasOwn(newData, 'defectBeans') ? newData.defectBeans : currentData.defectBeans,
        defectBeanSettings: hasOwn(newData, 'defectBeanSettings')
          ? newData.defectBeanSettings
          : currentData.defectBeanSettings,
        workProgresses: Array.isArray(newData.workProgresses) ? newData.workProgresses : currentData.workProgresses,
        counterRecords: Array.isArray(newData.counterRecords) ? newData.counterRecords : currentData.counterRecords,
      };

      const mutatedKeys: (keyof AppData)[] = [];
      (Object.keys(normalizedData) as (keyof AppData)[]).forEach((key) => {
        if (!areDeeplyEqual(normalizedData[key], currentData[key])) {
          mutatedKeys.push(key);
        }
      });

      if (mutatedKeys.length > 0) {
        mutatedKeys.forEach((key) => lockedKeysRef.current.add(key));
        pendingSaveCountRef.current += 1;
        lastMutationTimestampRef.current = Date.now();
        isUpdatingRef.current = true;
      }

      commitData(normalizedData);

      let saveError: unknown = null;

      try {
        await saveUserData(user.uid, normalizedData);
      } catch (error) {
        saveError = error;
        console.error('Failed to save data:', error);
        lockedKeysRef.current.clear();
        pendingSaveCountRef.current = 0;
        isUpdatingRef.current = false;

        getUserData(user.uid)
          .then((freshData) => {
            commitData(freshData);
          })
          .catch((err) => {
            console.error('Failed to recover data:', err);
          });
      } finally {
        if (mutatedKeys.length > 0) {
          pendingSaveCountRef.current = Math.max(0, pendingSaveCountRef.current - 1);
          if (saveError && pendingSaveCountRef.current === 0) {
            isUpdatingRef.current = false;
            lockedKeysRef.current.clear();
          }
        }
      }
    },
    [user, commitData]
  );

  return { data, updateData, isLoading };
}

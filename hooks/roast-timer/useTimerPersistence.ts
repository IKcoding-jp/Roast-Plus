'use client';

import { useEffect } from 'react';
import type { AppData, RoastTimerState } from '@/types';
import { setRoastTimerState as saveLocalState, getRoastTimerState as loadLocalState } from '@/lib/localStorage';
import { getSyncedIsoString } from '@/lib/timeSync';
import { calculateElapsedTime } from './useTimerState';
import type { UseTimerStateReturn } from './useTimerState';

type UpdateAppDataFn = (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void>;

export interface UseTimerPersistenceArgs {
  user: { uid: string } | null;
  data: AppData | null;
  updateData: UpdateAppDataFn;
  isLoading: boolean;
  stateManager: UseTimerStateReturn;
  currentDeviceId: string;
}

/**
 * データ永続化フック
 * - Firestore⇔ローカルストレージの同期
 * - 初回マウント時の状態復元
 * - デバイス間の状態同期
 */
export function useTimerPersistence({
  user,
  data,
  updateData,
  isLoading,
  stateManager,
  currentDeviceId,
}: UseTimerPersistenceArgs) {
  const {
    localState,
    setLocalState,
    pausedElapsedRef,
    hasResetRef,
    isInitialMountRef,
    isUpdatingFromFirestoreRef,
  } = stateManager;

  // Firestoreの状態をローカル状態に反映
  useEffect(() => {
    if (!user || !data) return;

    const firestoreState = data.roastTimerState;

    // リセットが実行された場合は、Firestoreの状態が消えるまで無視する
    if (hasResetRef.current) {
      if (firestoreState) {
        return;
      }
      hasResetRef.current = false;
      isInitialMountRef.current = false;
    }

    // Firestoreに状態がある場合
    if (firestoreState) {
      // 完了状態の処理
      if (firestoreState.status === 'completed') {
        // 初回マウント時は完了状態を読み込まない(ページを開いた時に完了画面が表示されるのを防ぐ)
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
          saveLocalState(null);
          pausedElapsedRef.current = 0;
          if (user && !isLoading) {
            updateData((currentData) => ({
              ...currentData,
              roastTimerState: undefined,
            })).catch((error) => {
              console.error('Failed to clear completed state on mount:', error);
            });
          }
          return;
        }
        // 既に初期化済みで、他のデバイスが完了を検出した場合は反映する
        // ただし、リセット直後は反映しない
        if (localState?.status !== 'completed' && !hasResetRef.current) {
          const completedState: RoastTimerState = {
            ...firestoreState,
            pausedElapsed: typeof firestoreState.pausedElapsed === 'number' ? firestoreState.pausedElapsed : 0,
          };
          pausedElapsedRef.current = completedState.pausedElapsed ?? 0;
          isUpdatingFromFirestoreRef.current = true;
          saveLocalState(completedState);
          setTimeout(() => {
            setLocalState(completedState);
            isUpdatingFromFirestoreRef.current = false;
          }, 0);
        }
        return;
      }

      // 開始時刻から経過時間を再計算
      if (firestoreState.startedAt) {
        const firestorePausedElapsed =
          typeof firestoreState.pausedElapsed === 'number' ? firestoreState.pausedElapsed : 0;
        pausedElapsedRef.current = firestorePausedElapsed;
        const elapsed = calculateElapsedTime(
          firestoreState.startedAt,
          firestoreState.pausedAt,
          firestorePausedElapsed,
          firestoreState.status
        );
        const remaining = Math.max(0, firestoreState.duration - elapsed);

        const restoredState: RoastTimerState = {
          ...firestoreState,
          pausedElapsed: firestorePausedElapsed,
          elapsed,
          remaining,
          lastUpdatedAt: getSyncedIsoString(),
        };

        // ローカル状態と異なる場合のみ更新(lastUpdatedAtとtriggeredByDeviceIdで比較)
        const shouldUpdate = !localState ||
          localState.status !== restoredState.status ||
          localState.lastUpdatedAt !== firestoreState.lastUpdatedAt ||
          localState.triggeredByDeviceId !== firestoreState.triggeredByDeviceId;

        if (shouldUpdate) {
          isUpdatingFromFirestoreRef.current = true;
          saveLocalState(restoredState);
          setTimeout(() => {
            setLocalState(restoredState);
            isUpdatingFromFirestoreRef.current = false;
          }, 0);
        }
      } else {
        // 開始時刻がない場合はそのまま反映(lastUpdatedAtとtriggeredByDeviceIdで比較)
        const normalizedState: RoastTimerState = {
          ...firestoreState,
          pausedElapsed: typeof firestoreState.pausedElapsed === 'number' ? firestoreState.pausedElapsed : 0,
        };
        const shouldUpdate = !localState ||
          localState.status !== firestoreState.status ||
          localState.lastUpdatedAt !== firestoreState.lastUpdatedAt ||
          localState.triggeredByDeviceId !== firestoreState.triggeredByDeviceId;

        if (shouldUpdate) {
          isUpdatingFromFirestoreRef.current = true;
          pausedElapsedRef.current = normalizedState.pausedElapsed ?? 0;
          saveLocalState(normalizedState);
          setTimeout(() => {
            setLocalState(normalizedState);
            isUpdatingFromFirestoreRef.current = false;
          }, 0);
        }
      }
      isInitialMountRef.current = false;
    } else {
      // Firestoreに状態がない場合、ローカルストレージから読み込む(後方互換性)
      if (isInitialMountRef.current) {
        const storedState = loadLocalState();
        if (storedState) {
          const storedPausedElapsed =
            typeof storedState.pausedElapsed === 'number' ? storedState.pausedElapsed : 0;
          const normalizedStoredState: RoastTimerState = {
            ...storedState,
            pausedElapsed: storedPausedElapsed,
          };
          // 完了状態の場合は読み込まない
          if (storedState.status === 'completed') {
            saveLocalState(null);
            pausedElapsedRef.current = 0;
            isInitialMountRef.current = false;
            return;
          }

          let stateToPersist: RoastTimerState = normalizedStoredState;
          // ローカルストレージから読み込んだ場合、開始時刻から経過時間を再計算
          if (storedState.status === 'running' && storedState.startedAt) {
            const elapsed = calculateElapsedTime(
              storedState.startedAt,
              storedState.pausedAt,
              storedPausedElapsed,
              storedState.status
            );
            const remaining = Math.max(0, storedState.duration - elapsed);

            stateToPersist = {
              ...normalizedStoredState,
              elapsed,
              remaining,
              lastUpdatedAt: getSyncedIsoString(),
            };
          }

          setTimeout(() => setLocalState(stateToPersist), 0);
          pausedElapsedRef.current = stateToPersist.pausedElapsed ?? 0;

          // Firestoreにも保存(マイグレーション)。ただしAppDataの読み込み完了までは書き込みを遅延
          if (isLoading) {
            return;
          }

          updateData((currentData) => ({
            ...currentData,
            roastTimerState: stateToPersist,
          })).catch((error) => {
            console.error('Failed to migrate roast timer state from local storage:', error);
          });

          isInitialMountRef.current = false;
          return;
        }
        isInitialMountRef.current = false;
      } else {
        // 既に初期化済みで、Firestoreに状態がない場合はnullに設定
        // リセット後は、Firestoreの状態がundefinedになるまで待つ
        if (localState !== null && !hasResetRef.current) {
          pausedElapsedRef.current = 0;
          setTimeout(() => setLocalState(null), 0);
        }
        // リセットフラグが設定されている場合、Firestoreの状態がundefinedになったらリセットフラグをクリア
        if (hasResetRef.current && !firestoreState) {
          hasResetRef.current = false;
        }
      }
    }
  }, [user, data, updateData, currentDeviceId, isLoading, localState, setLocalState, pausedElapsedRef, hasResetRef, isInitialMountRef, isUpdatingFromFirestoreRef]);
}

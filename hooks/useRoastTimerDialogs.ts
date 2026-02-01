'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AppData, RoastTimerState } from '@/types';

type UpdateAppDataFn = (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void>;

interface UseRoastTimerDialogsArgs {
  state: RoastTimerState | null;
  resetTimer: () => Promise<void>;
  stopSound: () => void;
  updateData: UpdateAppDataFn;
}

export interface UseRoastTimerDialogsReturn {
  showCompletionDialog: boolean;
  showContinuousRoastDialog: boolean;
  showAfterPurgeDialog: boolean;
  handleCompletionClose: () => Promise<void>;
  handleCompletionOk: () => Promise<void>;
  handleContinuousRoastClose: () => Promise<void>;
  handleContinuousRoastYes: () => Promise<void>;
  handleContinuousRoastNo: () => Promise<void>;
  handleAfterPurgeRecord: () => Promise<void>;
  handleAfterPurgeClose: () => Promise<void>;
}

/**
 * ローストタイマーのダイアログ管理フック
 * - 完了ダイアログ、連続焙煎ダイアログ、アフターパージダイアログの状態管理
 * - Firestoreの dialogState との同期
 * - 各ダイアログのハンドラー
 */
export function useRoastTimerDialogs({
  state,
  resetTimer,
  stopSound,
  updateData,
}: UseRoastTimerDialogsArgs): UseRoastTimerDialogsReturn {
  const router = useRouter();

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showContinuousRoastDialog, setShowContinuousRoastDialog] = useState(false);
  const [showAfterPurgeDialog, setShowAfterPurgeDialog] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);
  const hasInitializedRef = useRef(false);
  const dialogSyncLockRef = useRef(false);

  // ページを開いた時の初期化（完了状態の場合は自動リセット）
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      if (state?.status === 'completed') {
        resetTimer();
        setShowCompletionDialog(false);
        setShowContinuousRoastDialog(false);
        setShowAfterPurgeDialog(false);
      }
    }
  }, [state?.status, resetTimer]);

  // 完了状態を検出してダイアログを表示（runningからcompletedに変化した時のみ）
  useEffect(() => {
    const currentStatus = state?.status;
    const prevStatus = prevStatusRef.current;

    const shouldOpenCompletionDialog =
      !dialogSyncLockRef.current &&
      prevStatus === 'running' &&
      currentStatus === 'completed' &&
      !showCompletionDialog &&
      !showContinuousRoastDialog &&
      !showAfterPurgeDialog;

    if (shouldOpenCompletionDialog) {
      setShowCompletionDialog(true);
    }

    prevStatusRef.current = currentStatus;
  }, [state?.status, showCompletionDialog, showContinuousRoastDialog, showAfterPurgeDialog]);

  // FirestoreのdialogStateを監視してダイアログを同期表示
  useEffect(() => {
    if (!state) {
      if (showCompletionDialog || showContinuousRoastDialog || showAfterPurgeDialog) {
        setShowCompletionDialog(false);
        setShowContinuousRoastDialog(false);
        setShowAfterPurgeDialog(false);
      }
      return;
    }

    if (dialogSyncLockRef.current) {
      return;
    }

    const dialogState = state.dialogState;

    if (dialogState === 'completion' && state.status === 'completed') {
      if (!showCompletionDialog && !showContinuousRoastDialog && !showAfterPurgeDialog) {
        setShowCompletionDialog(true);
      }
    } else if (dialogState === 'continuousRoast' && state.status === 'completed') {
      if (!showContinuousRoastDialog && !showAfterPurgeDialog) {
        setShowCompletionDialog(false);
        setShowContinuousRoastDialog(true);
      }
    } else if (dialogState === 'afterPurge' && state.status === 'completed') {
      if (!showAfterPurgeDialog) {
        setShowCompletionDialog(false);
        setShowContinuousRoastDialog(false);
        setShowAfterPurgeDialog(true);
      }
    } else if (dialogState === null) {
      setShowCompletionDialog(false);
      setShowContinuousRoastDialog(false);
      setShowAfterPurgeDialog(false);
    }
  }, [state, showCompletionDialog, showContinuousRoastDialog, showAfterPurgeDialog]);

  // dialogStateをFirestoreに更新するヘルパー
  const updateDialogState = useCallback(async (dialogState: RoastTimerState['dialogState']) => {
    if (state) {
      try {
        await updateData((currentData) => ({
          ...currentData,
          roastTimerState: {
            ...state,
            dialogState,
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
      } catch (error) {
        console.error('Failed to update dialog state:', error);
      }
    }
  }, [state, updateData]);

  // 完了ダイアログの閉じるボタン
  const handleCompletionClose = useCallback(async () => {
    stopSound();
    setShowCompletionDialog(false);
    await updateDialogState(null);
  }, [stopSound, updateDialogState]);

  // 完了ダイアログのOKボタン
  const handleCompletionOk = useCallback(async () => {
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(true);
    await updateDialogState('continuousRoast');
  }, [stopSound, updateDialogState]);

  // 連続焙煎ダイアログの閉じるボタン
  const handleContinuousRoastClose = useCallback(async () => {
    setShowContinuousRoastDialog(false);
    await updateDialogState(null);
  }, [updateDialogState]);

  // 連続焙煎ダイアログの「はい」
  const handleContinuousRoastYes = useCallback(async () => {
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);
    await resetTimer();
    router.push('/roast-timer');
  }, [stopSound, resetTimer, router]);

  // 連続焙煎ダイアログの「いいえ」
  const handleContinuousRoastNo = useCallback(async () => {
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(true);
    await updateDialogState('afterPurge');
  }, [updateDialogState]);

  // アフターパージダイアログの「記録に進む」
  const handleAfterPurgeRecord = useCallback(async () => {
    dialogSyncLockRef.current = true;
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);
    prevStatusRef.current = undefined;

    const stateSnapshot = state;
    let clearDialogStatePromise: Promise<void> | null = null;

    if (stateSnapshot) {
      try {
        clearDialogStatePromise = updateData((currentData) => ({
          ...currentData,
          roastTimerState: {
            ...stateSnapshot,
            dialogState: null,
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
      } catch (error) {
        console.error('Failed to update dialog state:', error);
      }
    }

    let targetUrl = '/roast-record';
    if (
      stateSnapshot &&
      stateSnapshot.beanName &&
      stateSnapshot.weight &&
      stateSnapshot.roastLevel &&
      stateSnapshot.elapsed > 0
    ) {
      const params = new URLSearchParams({
        beanName: stateSnapshot.beanName,
        weight: stateSnapshot.weight.toString(),
        roastLevel: stateSnapshot.roastLevel,
        duration: Math.round(stateSnapshot.elapsed).toString(),
      });
      targetUrl = `/roast-record?${params.toString()}`;
    }

    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);

    router.push(targetUrl);

    if (clearDialogStatePromise) {
      try {
        await clearDialogStatePromise;
      } catch (error) {
        console.error('Failed to update dialog state:', error);
      }
    }

    try {
      await resetTimer();
    } finally {
      setShowCompletionDialog(false);
      setShowContinuousRoastDialog(false);
      setShowAfterPurgeDialog(false);
      dialogSyncLockRef.current = false;
    }
  }, [state, stopSound, resetTimer, updateData, router]);

  // アフターパージダイアログの「閉じる」
  const handleAfterPurgeClose = useCallback(async () => {
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);
    await resetTimer();
  }, [stopSound, resetTimer]);

  return {
    showCompletionDialog,
    showContinuousRoastDialog,
    showAfterPurgeDialog,
    handleCompletionClose,
    handleCompletionOk,
    handleContinuousRoastClose,
    handleContinuousRoastYes,
    handleContinuousRoastNo,
    handleAfterPurgeRecord,
    handleAfterPurgeClose,
  };
}

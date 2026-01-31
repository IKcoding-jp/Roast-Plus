'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { useRoastTimer } from '@/hooks/useRoastTimer';
import { CompletionDialog, ContinuousRoastDialog, AfterPurgeDialog } from './RoastTimerDialogs';
import { RoastTimerSettings } from './RoastTimerSettings';
import { TimerDisplay, TimerControls, TimerHeader, SetupPanel } from './roast-timer';
import type { BeanName } from '@/lib/beanConfig';
import type { RoastLevel, Weight } from '@/lib/constants';

export function RoastTimer() {
  const { user } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    stopSound,
  } = useRoastTimer({ data, updateData, isLoading });

  // ダイアログの状態
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showContinuousRoastDialog, setShowContinuousRoastDialog] = useState(false);
  const [showAfterPurgeDialog, setShowAfterPurgeDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // コンポーネントがアンマウントされる時やページを離れる時に音を停止
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopSound();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopSound();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopSound]);

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

  // ハンドラー関数
  const handleStart = async (
    duration: number,
    beanName?: BeanName,
    weight?: Weight,
    roastLevel?: RoastLevel
  ) => {
    await startTimer(duration, beanName, weight, roastLevel);
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = async () => {
    await resumeTimer();
  };

  const handleReset = () => {
    stopSound();
    resetTimer();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);
  };

  const handleSkip = () => {
    skipTimer();
  };

  // 完了ダイアログのOKボタン
  const handleCompletionOk = async () => {
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(true);

    if (state) {
      try {
        await updateData((currentData) => ({
          ...currentData,
          roastTimerState: {
            ...state,
            dialogState: 'continuousRoast',
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
      } catch (error) {
        console.error('Failed to update dialog state:', error);
      }
    }
  };

  // 連続焙煎ダイアログの「はい」
  const handleContinuousRoastYes = async () => {
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);
    await resetTimer();
    router.push('/roast-timer');
  };

  // 連続焙煎ダイアログの「いいえ」
  const handleContinuousRoastNo = async () => {
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(true);

    if (state) {
      try {
        await updateData((currentData) => ({
          ...currentData,
          roastTimerState: {
            ...state,
            dialogState: 'afterPurge',
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
      } catch (error) {
        console.error('Failed to update dialog state:', error);
      }
    }
  };

  // アフターパージダイアログの「記録に進む」
  const handleAfterPurgeRecord = async () => {
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
  };

  // アフターパージダイアログの「閉じる」
  const handleAfterPurgeClose = async () => {
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(false);
    await resetTimer();
  };

  // 状態の計算
  const isRunning = state?.status === 'running';
  const isPaused = state?.status === 'paused';
  const isCompleted = state?.status === 'completed';
  const isIdle = !state || state.status === 'idle';

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ダイアログ */}
      <CompletionDialog
        isOpen={showCompletionDialog}
        onClose={async () => {
          stopSound();
          setShowCompletionDialog(false);

          if (state) {
            try {
              await updateData((currentData) => ({
                ...currentData,
                roastTimerState: {
                  ...state,
                  dialogState: null,
                  lastUpdatedAt: new Date().toISOString(),
                },
              }));
            } catch (error) {
              console.error('Failed to update dialog state:', error);
            }
          }
        }}
        onContinue={handleCompletionOk}
      />
      <ContinuousRoastDialog
        isOpen={showContinuousRoastDialog}
        onClose={async () => {
          setShowContinuousRoastDialog(false);

          if (state) {
            try {
              await updateData((currentData) => ({
                ...currentData,
                roastTimerState: {
                  ...state,
                  dialogState: null,
                  lastUpdatedAt: new Date().toISOString(),
                },
              }));
            } catch (error) {
              console.error('Failed to update dialog state:', error);
            }
          }
        }}
        onYes={handleContinuousRoastYes}
        onNo={handleContinuousRoastNo}
      />
      <AfterPurgeDialog
        isOpen={showAfterPurgeDialog}
        onClose={handleAfterPurgeClose}
        onRecord={handleAfterPurgeRecord}
      />

      {/* タイマー表示（実行中・一時停止中・完了時のみ表示） */}
      {!isIdle && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative px-4 sm:px-6 py-8">
          <TimerHeader
            onBack={() => router.push('/')}
            onSettingsClick={() => setShowSettings(true)}
            isOverlay
          />

          <TimerDisplay
            state={state}
            isRunning={isRunning}
            isPaused={isPaused}
            isCompleted={isCompleted}
          />

          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            isCompleted={isCompleted}
            onPause={handlePause}
            onResume={handleResume}
            onSkip={handleSkip}
            onReset={handleReset}
          />
        </div>
      )}

      {/* 設定フォーム（idle状態のみ表示） */}
      {isIdle && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
          <TimerHeader
            onBack={() => router.back()}
            onSettingsClick={() => setShowSettings(true)}
          />
          <SetupPanel onStart={handleStart} isLoading={isLoading} />
        </div>
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 my-4">
            <RoastTimerSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/hooks/useAppData';
import { useRoastTimer } from '@/hooks/useRoastTimer';
import { useRoastTimerDialogs } from '@/hooks/useRoastTimerDialogs';
import { CompletionDialog, ContinuousRoastDialog, AfterPurgeDialog } from './RoastTimerDialogs';
import { RoastTimerSettings } from './RoastTimerSettings';
import { TimerDisplay, TimerControls, TimerHeader, SetupPanel } from './roast-timer';
import type { BeanName } from '@/lib/beanConfig';
import type { RoastLevel, Weight } from '@/lib/constants';

export function RoastTimer() {
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

  const [showSettings, setShowSettings] = useState(false);

  const {
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
  } = useRoastTimerDialogs({ state, resetTimer, stopSound, updateData });

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
  };

  const handleSkip = () => {
    skipTimer();
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
        onClose={handleCompletionClose}
        onContinue={handleCompletionOk}
      />
      <ContinuousRoastDialog
        isOpen={showContinuousRoastDialog}
        onClose={handleContinuousRoastClose}
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSettings } from 'react-icons/io5';
import { useAppData } from '@/hooks/useAppData';
import { useRoastTimer } from '@/hooks/useRoastTimer';
import { useRoastTimerDialogs } from '@/hooks/useRoastTimerDialogs';
import { CompletionDialog, ContinuousRoastDialog, AfterPurgeDialog } from './RoastTimerDialogs';
import { RoastTimerSettings } from './RoastTimerSettings';
import { TimerDisplay, TimerControls, SetupPanel } from './roast-timer';
import { Modal } from '@/components/ui';
import { DEFAULT_DURATIONS } from '@/lib/constants';
import type { BeanName } from '@/lib/beanConfig';
import type { RoastLevel, Weight } from '@/lib/constants';

const panelVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const panelTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function RoastTimer() {
  const { data, updateData, isLoading } = useAppData();
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
  const [idleDuration, setIdleDuration] = useState(DEFAULT_DURATIONS[200] * 60);

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

  // ページ離脱時に音停止
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

  const handleStart = async (
    duration: number,
    beanName?: BeanName,
    weight?: Weight,
    roastLevel?: RoastLevel
  ) => {
    await startTimer(duration, beanName, weight, roastLevel);
  };

  const handlePause = () => pauseTimer();
  const handleResume = async () => { await resumeTimer(); };
  const handleReset = () => { stopSound(); resetTimer(); };
  const handleSkip = () => skipTimer();

  const handleWeightSelect = useCallback((weight: Weight) => {
    setIdleDuration(DEFAULT_DURATIONS[weight] * 60);
  }, []);

  const isRunning = state?.status === 'running';
  const isPaused = state?.status === 'paused';
  const isCompleted = state?.status === 'completed';
  const isIdle = !state || state.status === 'idle';

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--spot)' }} />
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

      {/* ヘッダー: 設定ボタン（FloatingNavはpage.tsxが提供） */}
      <div
        className="flex items-center justify-end shrink-0"
        style={{ height: 56, padding: '12px 12px 0' }}
      >
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="h-11 rounded-full flex items-center gap-[6px] cursor-pointer"
          style={{
            padding: '0 14px',
            background: 'var(--nav-bg, var(--surface))',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: 'none',
            boxShadow: '0 2px 8px var(--nav-shadow, rgba(0,0,0,0.1))',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background 0.15s',
          }}
          aria-label="タイマー設定"
        >
          <IoSettings size={18} style={{ color: 'var(--ink-sub)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--ink-sub)' }}>
            設定
          </span>
        </button>
      </div>

      {/* リングセクション（全ステートで固定位置） */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0" style={{ padding: '0 24px' }}>
        <TimerDisplay
          state={state}
          isRunning={isRunning}
          isPaused={isPaused}
          isCompleted={isCompleted}
          idleDuration={idleDuration}
        />
      </div>

      {/* 下部パネル（ステートで切替） */}
      <div
        className="shrink-0 flex flex-col"
        style={{ height: 230, padding: '0 24px 28px' }}
      >
        <AnimatePresence mode="wait">
          {isIdle && (
            <motion.div
              key="idle"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={panelTransition}
              className="flex-1 flex flex-col min-h-0"
            >
              <SetupPanel
                onStart={handleStart}
                isLoading={isLoading}
                onWeightSelect={handleWeightSelect}
              />
            </motion.div>
          )}

          {(isRunning || isPaused) && (
            <motion.div
              key="running"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={panelTransition}
              className="flex-1 flex flex-col min-h-0"
            >
              <TimerControls
                state={state}
                isRunning={isRunning}
                isPaused={isPaused}
                isCompleted={false}
                onPause={handlePause}
                onResume={handleResume}
                onSkip={handleSkip}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              key="completed"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={panelTransition}
              className="flex-1 flex flex-col min-h-0"
            >
              <TimerControls
                state={state}
                isRunning={false}
                isPaused={false}
                isCompleted={true}
                onPause={handlePause}
                onResume={handleResume}
                onSkip={handleSkip}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 設定モーダル */}
      <Modal show={showSettings} onClose={() => setShowSettings(false)}>
        <RoastTimerSettings onClose={() => setShowSettings(false)} />
      </Modal>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import type { RoastTimerState } from '@/types';
import { getSyncedTimestampSync } from '@/lib/timeSync';

/**
 * 開始時刻と一時停止時刻から経過時間を計算
 */
export function calculateElapsedTime(
  startedAt: string | undefined,
  pausedAt: string | undefined,
  pausedElapsed: number = 0,
  status: RoastTimerState['status']
): number {
  if (!startedAt) return 0;
  const totalPaused = Math.max(0, pausedElapsed);

  if (status === 'paused' && pausedAt) {
    // 一時停止中は、一時停止時点までの経過時間を返す
    const pausedTime = new Date(pausedAt).getTime();
    const startTime = new Date(startedAt).getTime();
    return Math.max(0, (pausedTime - startTime) / 1000 - totalPaused);
  }

  if (status === 'running') {
    // 実行中は、現在時刻から開始時刻を引いて、一時停止時間を差し引く(サーバー時刻ベース)
    const now = getSyncedTimestampSync();
    const startTime = new Date(startedAt).getTime();
    return Math.max(0, (now - startTime) / 1000 - totalPaused);
  }

  return Math.max(0, totalPaused);
}

export interface UseTimerStateReturn {
  localState: RoastTimerState | null;
  setLocalState: React.Dispatch<React.SetStateAction<RoastTimerState | null>>;
  localStateRef: React.MutableRefObject<RoastTimerState | null>;
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  lastUpdateRef: React.MutableRefObject<number | null>;
  pausedElapsedRef: React.MutableRefObject<number>;
  hasResetRef: React.MutableRefObject<boolean>;
  isInitialMountRef: React.MutableRefObject<boolean>;
  isUpdatingFromFirestoreRef: React.MutableRefObject<boolean>;
}

/**
 * タイマー状態管理フック
 * - ローカル状態とRefの管理
 * - 状態の初期化
 */
export function useTimerState(): UseTimerStateReturn {
  const [localState, setLocalState] = useState<RoastTimerState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const hasResetRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const isUpdatingFromFirestoreRef = useRef(false);
  const localStateRef = useRef<RoastTimerState | null>(null);

  // lastUpdateRefの初期化
  useEffect(() => {
    if (lastUpdateRef.current === null) {
      lastUpdateRef.current = Date.now();
    }
  }, []);

  // localStateRefを最新の状態に同期
  useEffect(() => {
    localStateRef.current = localState;
  }, [localState]);

  return {
    localState,
    setLocalState,
    localStateRef,
    intervalRef,
    lastUpdateRef,
    pausedElapsedRef,
    hasResetRef,
    isInitialMountRef,
    isUpdatingFromFirestoreRef,
  };
}

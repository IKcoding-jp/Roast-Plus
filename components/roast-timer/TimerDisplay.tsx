'use client';

import { useState, useEffect, useRef } from 'react';
import { HiCheckCircle } from 'react-icons/hi';
import { MdLocalFireDepartment } from 'react-icons/md';
import { formatTime } from '@/lib/roastTimerUtils';
import { getSyncedTimestampSync } from '@/lib/timeSync';
import type { RoastTimerState } from '@/types';

interface TimerDisplayProps {
  state: RoastTimerState | null;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

/**
 * タイマー表示コンポーネント
 * - タイトル（焙煎中/焙煎完了）
 * - 円形プログレスバー（rAFで60fps直接DOM操作）
 * - 残り時間/経過時間
 * - 実行中の情報（豆、重さ、焙煎度合い）
 */
export function TimerDisplay({ state, isRunning, isPaused, isCompleted }: TimerDisplayProps) {
  // 円形プログレスバーの設定（レスポンシブ対応）
  const [circleSize, setCircleSize] = useState(340);
  const strokeWidth = 16;

  // rAF用のref（DOM直接操作で60fpsアニメーション）
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const remainingTextRef = useRef<HTMLDivElement>(null);
  const elapsedTextRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  // 画面サイズに応じて円のサイズを調整
  useEffect(() => {
    const updateSize = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // スマホ（640px未満）の場合は控えめなサイズ
      if (viewportWidth < 640) {
        if (viewportHeight >= 900) {
          setCircleSize(300);
        } else if (viewportHeight >= 700) {
          setCircleSize(280);
        } else {
          setCircleSize(260);
        }
      } else if (viewportHeight >= 900) {
        // 大きな画面
        if (viewportWidth >= 1024) {
          setCircleSize(480);
        } else if (viewportWidth >= 768) {
          setCircleSize(440);
        } else {
          setCircleSize(400);
        }
      } else if (viewportHeight >= 700) {
        // 中程度の画面
        if (viewportWidth >= 1024) {
          setCircleSize(440);
        } else if (viewportWidth >= 768) {
          setCircleSize(400);
        } else {
          setCircleSize(360);
        }
      } else {
        // 小さな画面
        if (viewportWidth >= 768) {
          setCircleSize(360);
        } else {
          setCircleSize(320);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // rAFベースのアニメーション（タイマー実行中のみ）
  // React再レンダリングを経由せず、DOM直接操作で60fpsを実現
  useEffect(() => {
    if (!isRunning || !state?.startedAt) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const startedAt = state.startedAt;
    const duration = state.duration;
    const pausedElapsed = state.pausedElapsed ?? 0;

    const animate = () => {
      const now = getSyncedTimestampSync();
      const startTime = new Date(startedAt).getTime();
      const elapsed = Math.max(0, (now - startTime) / 1000 - Math.max(0, pausedElapsed));
      const remaining = Math.max(0, duration - elapsed);
      const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
      const offset = circumference - (progress / 100) * circumference;

      // DOM直接操作（React再レンダリング不要）
      if (progressCircleRef.current) {
        progressCircleRef.current.setAttribute('stroke-dashoffset', String(offset));
      }
      if (remainingTextRef.current) {
        remainingTextRef.current.textContent = formatTime(Math.floor(remaining));
      }
      if (elapsedTextRef.current) {
        elapsedTextRef.current.textContent = formatTime(Math.floor(elapsed));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, state?.startedAt, state?.pausedElapsed, state?.duration, circumference]);

  // 静的な値（非実行中のフォールバック表示用）
  const getProgress = () => {
    if (!state || state.duration === 0) return 0;
    const progress = (state.elapsed / state.duration) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const progress = getProgress();
  const remaining = state ? Math.max(0, state.remaining) : 0;
  const offset = circumference - (progress / 100) * circumference;

  // 色の決定
  const getProgressColor = () => {
    if (isCompleted) return '#10b981';
    if (isPaused) return '#f59e0b';
    if (isRunning) return '#d97706';
    return '#d1d5db';
  };

  const progressColor = getProgressColor();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* タイトル */}
      {(isRunning || isPaused) && (
        <div className="text-center space-y-2 flex-shrink-0 mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-lg mb-2 bg-gradient-to-br from-orange-400 to-red-500">
            <MdLocalFireDepartment className="text-3xl sm:text-4xl md:text-5xl text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
            焙煎中
          </h2>
        </div>
      )}
      {isCompleted && (
        <div className="text-center space-y-2 flex-shrink-0 mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-lg mb-2 bg-gradient-to-br from-green-400 to-green-600">
            <HiCheckCircle className="text-3xl sm:text-4xl md:text-5xl text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
            焙煎完了
          </h2>
        </div>
      )}

      {/* 円形プログレスバー */}
      <div
        className="relative flex-shrink-0 mb-4 sm:mb-6"
        style={{ width: circleSize, height: circleSize }}
      >
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            ref={progressCircleRef}
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: !isRunning
                ? 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out'
                : undefined,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            ref={remainingTextRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-sans text-spot"
          >
            {formatTime(Math.floor(remaining))}
          </div>
          {state && (
            <div className="text-base sm:text-lg md:text-xl mt-2 sm:mt-3 text-ink-muted">
              <span ref={elapsedTextRef}>{formatTime(Math.floor(state.elapsed))}</span> / {formatTime(state.duration)}
            </div>
          )}
          {isCompleted && (
            <div className="text-sm sm:text-base md:text-lg font-semibold mt-2 sm:mt-3 text-green-600">
              ロースト完了！
            </div>
          )}
          {isPaused && (
            <div className="text-xs sm:text-sm md:text-base mt-2 sm:mt-3 font-medium text-spot">
              一時停止中
            </div>
          )}
        </div>
      </div>

      {/* 実行中の情報表示 */}
      {state && (isRunning || isPaused || isCompleted) && (
        <div className="text-center space-y-0.5 text-sm sm:text-base flex-shrink-0 mb-4 sm:mb-6 text-ink-sub">
          {state.beanName && <div>豆の名前: {state.beanName}</div>}
          {state.weight && <div>重さ: {state.weight}g</div>}
          {state.roastLevel && <div>焙煎度合い: {state.roastLevel}</div>}
        </div>
      )}
    </div>
  );
}

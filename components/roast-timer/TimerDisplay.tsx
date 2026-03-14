'use client';

import { useEffect, useRef, useMemo } from 'react';
import { formatTime } from '@/lib/roastTimerUtils';
import { getSyncedTimestampSync } from '@/lib/timeSync';
import type { RoastTimerState } from '@/types';

interface TimerDisplayProps {
  state: RoastTimerState | null;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  /** idle状態で表示するデフォルト秒数 */
  idleDuration?: number;
}

// SVGリングの定数
const VIEWBOX = 290;
const CENTER = VIEWBOX / 2; // 145
const RADIUS = 116;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈729

// ティックマークの定数
const TICK_COUNT = 60;
const TICK_OUTER_R = 136;
const TICK_MAJOR_INNER_R = 126;
const TICK_MINOR_INNER_R = 132;

/**
 * タイマーリング表示コンポーネント
 * - 全ステートで同じ位置に表示される円形プログレス
 * - 60本ティックマーク（時計文字盤風）
 * - ステート別リング色（idle=edge-strong / running=spot / completed=success）
 * - rAFベースの60fpsアニメーション
 */
export function TimerDisplay({
  state,
  isRunning,
  isPaused,
  isCompleted,
  idleDuration = 480,
}: TimerDisplayProps) {
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const remainingTextRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const isIdle = !state || state.status === 'idle';

  // ティックマークを静的に生成
  const ticks = useMemo(() => {
    const result: Array<{
      x1: number; y1: number;
      x2: number; y2: number;
      isMajor: boolean;
    }> = [];
    for (let i = 0; i < TICK_COUNT; i++) {
      const angle = ((i * 6) - 90) * (Math.PI / 180);
      const isMajor = i % 5 === 0;
      const innerR = isMajor ? TICK_MAJOR_INNER_R : TICK_MINOR_INNER_R;
      result.push({
        x1: CENTER + TICK_OUTER_R * Math.cos(angle),
        y1: CENTER + TICK_OUTER_R * Math.sin(angle),
        x2: CENTER + innerR * Math.cos(angle),
        y2: CENTER + innerR * Math.sin(angle),
        isMajor,
      });
    }
    return result;
  }, []);

  // rAFベースのアニメーション（running中のみ）
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
      const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;
      const offset = CIRCUMFERENCE * (1 - progress);

      if (progressCircleRef.current) {
        progressCircleRef.current.setAttribute('stroke-dashoffset', String(offset));
      }
      if (remainingTextRef.current) {
        remainingTextRef.current.textContent = formatTime(Math.floor(remaining));
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
  }, [isRunning, state?.startedAt, state?.pausedElapsed, state?.duration]);

  // リング色の決定（CSS変数）
  const getRingColor = () => {
    if (isCompleted) return 'var(--success)';
    if (isRunning || isPaused) return 'var(--spot)';
    return 'var(--edge-strong)';
  };

  // 静的な表示値（非running時のフォールバック）
  const getStaticOffset = () => {
    if (isIdle) return CIRCUMFERENCE; // 0% progress
    if (isCompleted) return 0; // 100% progress
    if (!state || state.duration === 0) return CIRCUMFERENCE;
    const progress = Math.min(1, Math.max(0, state.elapsed / state.duration));
    return CIRCUMFERENCE * (1 - progress);
  };

  const getDisplayTime = () => {
    if (isIdle) {
      const mins = Math.floor(idleDuration / 60);
      const secs = idleDuration % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    if (isCompleted) return '0:00';
    if (!state) return '0:00';
    return formatTime(Math.floor(Math.max(0, state.remaining)));
  };

  const getLabel = () => {
    if (isIdle) return '焙煎時間';
    if (isCompleted) return '完了';
    return '残り時間';
  };

  const getDotClass = () => {
    if (isCompleted) return 'complete';
    if (isRunning || isPaused) return 'active';
    return '';
  };

  return (
    <div className="relative" style={{ width: 290, height: 290 }}>
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full h-full overflow-visible"
      >
        {/* グロー用フィルター */}
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* トラック（背景円） */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--edge-strong)"
          strokeWidth={STROKE_WIDTH}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{ transition: 'stroke 0.25s' }}
        />

        {/* プログレス（前景円） */}
        <circle
          ref={progressCircleRef}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={getRingColor()}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={getStaticOffset()}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          filter="url(#ring-glow)"
          style={{
            transition: !isRunning
              ? 'stroke-dashoffset 0.45s cubic-bezier(0.16,1,0.3,1), stroke 0.25s ease'
              : 'stroke 0.25s ease',
          }}
        />

        {/* ティックマーク */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1.toFixed(2)}
            y1={tick.y1.toFixed(2)}
            x2={tick.x2.toFixed(2)}
            y2={tick.y2.toFixed(2)}
            stroke={tick.isMajor ? 'var(--ink-muted)' : 'var(--edge)'}
            strokeWidth={tick.isMajor ? 1.5 : 0.8}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.25s' }}
          />
        ))}
      </svg>

      {/* リング中央テキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          ref={remainingTextRef}
          className="font-sans text-ink tabular-nums select-none"
          style={{
            fontSize: 64,
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: '-2px',
            transition: 'color 0.25s',
          }}
        >
          {getDisplayTime()}
        </div>
        <div
          className="text-ink-muted uppercase tracking-[0.16em] font-semibold"
          style={{ fontSize: 10, marginTop: 6, transition: 'color 0.25s' }}
        >
          {getLabel()}
        </div>
        <div
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            marginTop: 10,
            transition: 'all 0.25s',
            ...(getDotClass() === 'active'
              ? { background: 'var(--spot)', boxShadow: '0 0 10px var(--spot-subtle)' }
              : getDotClass() === 'complete'
                ? { background: 'var(--success)', boxShadow: '0 0 10px var(--success-subtle)' }
                : { background: 'transparent' }),
          }}
        />
      </div>
    </div>
  );
}

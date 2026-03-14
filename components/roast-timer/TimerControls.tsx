'use client';

import { formatTime } from '@/lib/roastTimerUtils';
import type { RoastTimerState } from '@/types';

interface TimerControlsProps {
  state: RoastTimerState | null;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

/**
 * 下部パネル: running / completed ステートのコンテンツ
 * - running: 経過バー + 情報バッジ + 一時停止/スキップ
 * - completed: 完了メッセージ + 統計 + リセット
 */
export function TimerControls({
  state,
  isRunning,
  isPaused,
  isCompleted,
  onPause,
  onResume,
  onSkip,
  onReset,
}: TimerControlsProps) {
  // running or paused
  if (isRunning || isPaused) {
    const elapsed = state?.elapsed ?? 0;
    const duration = state?.duration ?? 1;
    const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;
    const weight = state?.weight;

    return (
      <div className="flex flex-col flex-1 min-h-0 justify-end">
        {/* 経過バー */}
        <div className="flex items-center gap-[10px] mb-4">
          <span
            className="tabular-nums shrink-0 min-w-[32px]"
            style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-muted)' }}
          >
            {formatTime(Math.floor(elapsed))}
          </span>
          <div
            className="flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ background: 'var(--edge)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, var(--btn-primary), var(--btn-primary-hover, var(--spot-hover)))',
                transition: 'width 1s linear',
              }}
            />
          </div>
          <span
            className="tabular-nums shrink-0 min-w-[32px] text-right"
            style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-muted)' }}
          >
            {formatTime(duration)}
          </span>
        </div>

        {/* 情報バッジ */}
        <div
          className="flex items-center justify-center gap-4 rounded-[14px] mb-[10px]"
          style={{ background: 'var(--ground)', padding: '12px 20px' }}
        >
          <div className="flex flex-col items-center gap-[3px]">
            <span
              className="uppercase tracking-[0.14em] font-bold"
              style={{ fontSize: 9, color: 'var(--ink-muted)' }}
            >
              重さ
            </span>
            <span
              className="tabular-nums"
              style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink)' }}
            >
              {weight ? `${weight}g` : '—'}
            </span>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--edge)' }} />
          <div className="flex flex-col items-center gap-[3px]">
            <span
              className="uppercase tracking-[0.14em] font-bold"
              style={{ fontSize: 9, color: 'var(--ink-muted)' }}
            >
              設定時間
            </span>
            <span
              className="tabular-nums"
              style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink)' }}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-[10px] mt-[10px]">
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            className="flex-1 h-[52px] rounded-[14px] flex items-center justify-center gap-[7px] cursor-pointer"
            style={{
              background: 'var(--ground)',
              border: '2px solid var(--edge-strong)',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.15s',
            }}
            aria-label={isPaused ? '再開' : '一時停止'}
          >
            {isPaused ? (
              <svg width={15} height={15} viewBox="0 0 24 24" fill="var(--ink-sub)" className="shrink-0">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width={15} height={15} viewBox="0 0 24 24" fill="var(--ink-sub)" className="shrink-0">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
            <span className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
              {isPaused ? '再開' : '一時停止'}
            </span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="h-[52px] rounded-[14px] flex items-center justify-center gap-[7px] cursor-pointer px-5"
            style={{
              background: 'var(--ground)',
              border: '2px solid var(--edge-strong)',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.15s',
            }}
            aria-label="スキップ"
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="var(--ink-sub)" className="shrink-0">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" strokeWidth="2.5" stroke="var(--ink-sub)" fill="none" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-sub)' }}>
              スキップ
            </span>
          </button>
        </div>
      </div>
    );
  }

  // completed
  if (isCompleted) {
    const weight = state?.weight;
    const duration = state?.duration ?? 0;

    return (
      <div className="flex flex-col flex-1 min-h-0 justify-end">
        {/* 完了メッセージ */}
        <div className="text-center mb-3">
          <div
            className="font-medium tracking-[0.04em]"
            style={{ fontSize: 11, color: 'var(--ink-muted)' }}
          >
            焙煎室に戻るタイミングです
          </div>
        </div>

        {/* 統計 */}
        <div
          className="rounded-[14px] overflow-hidden mb-4"
          style={{ background: 'var(--surface)', border: '1.5px solid var(--edge)' }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: '12px 16px' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
              重さ
            </span>
            <span
              className="text-sm tabular-nums"
              style={{ fontWeight: 400, color: 'var(--ink)' }}
            >
              {weight ? `${weight}g` : '—'}
            </span>
          </div>
          <div style={{ borderTop: '1px solid var(--edge)' }} />
          <div
            className="flex items-center justify-between"
            style={{ padding: '12px 16px' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
              焙煎時間
            </span>
            <span
              className="text-sm tabular-nums"
              style={{ fontWeight: 400, color: 'var(--ink)' }}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* リセットボタン */}
        <button
          type="button"
          onClick={onReset}
          className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer mt-auto"
          style={{
            background: 'var(--ground)',
            border: '2px solid var(--edge-strong)',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.15s',
          }}
          aria-label="リセット"
        >
          <svg
            width={15}
            height={15}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-sub)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4" />
          </svg>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-sub)' }}>
            リセット
          </span>
        </button>
      </div>
    );
  }

  return null;
}

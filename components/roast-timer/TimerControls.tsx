'use client';

import { HiPlay, HiPause, HiRefresh, HiFastForward } from 'react-icons/hi';
import { Button } from '@/components/ui';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

/**
 * タイマー操作ボタンコンポーネント
 * - 実行中: 一時停止、スキップ
 * - 一時停止中: 再開、スキップ
 * - 完了時: リセット
 */
export function TimerControls({
  isRunning,
  isPaused,
  isCompleted,
  onPause,
  onResume,
  onSkip,
  onReset,
}: TimerControlsProps) {
  if (isRunning) {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
        <Button
          variant="warning"
          size="md"
          onClick={onPause}
          className="flex items-center justify-center gap-1 flex-1 max-w-[200px]"
        >
          <HiPause className="text-xl sm:text-2xl flex-shrink-0" />
          <span>一時停止</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onSkip}
          className="flex items-center justify-center gap-1 flex-1 max-w-[200px]"
        >
          <HiFastForward className="text-xl sm:text-2xl flex-shrink-0" />
          <span>スキップ</span>
        </Button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
        <Button
          variant="primary"
          size="md"
          onClick={onResume}
          className="flex items-center justify-center gap-1 flex-1 max-w-[200px]"
        >
          <HiPlay className="text-xl sm:text-2xl flex-shrink-0" />
          <span>再開</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onSkip}
          className="flex items-center justify-center gap-1 flex-1 max-w-[200px]"
        >
          <HiFastForward className="text-xl sm:text-2xl flex-shrink-0" />
          <span>スキップ</span>
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
        <div></div>
        <Button
          variant="secondary"
          size="md"
          onClick={onReset}
          className="flex items-center justify-center gap-1"
        >
          <HiRefresh className="text-xl sm:text-2xl flex-shrink-0" />
          <span>リセット</span>
        </Button>
        <div></div>
      </div>
    );
  }

  return null;
}

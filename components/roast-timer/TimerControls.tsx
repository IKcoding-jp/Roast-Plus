'use client';

import { HiPlay, HiPause, HiRefresh, HiFastForward } from 'react-icons/hi';

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
        <button
          onClick={onPause}
          className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-yellow-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
        >
          <HiPause className="text-xl sm:text-2xl flex-shrink-0" />
          <span>一時停止</span>
        </button>
        <button
          onClick={onSkip}
          className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
        >
          <HiFastForward className="text-xl sm:text-2xl flex-shrink-0" />
          <span>スキップ</span>
        </button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
        <button
          onClick={onResume}
          className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
        >
          <HiPlay className="text-xl sm:text-2xl flex-shrink-0" />
          <span>再開</span>
        </button>
        <button
          onClick={onSkip}
          className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
        >
          <HiFastForward className="text-xl sm:text-2xl flex-shrink-0" />
          <span>スキップ</span>
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
        <div></div>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] min-w-[44px]"
        >
          <HiRefresh className="text-xl sm:text-2xl flex-shrink-0" />
          <span>リセット</span>
        </button>
        <div></div>
      </div>
    );
  }

  return null;
}

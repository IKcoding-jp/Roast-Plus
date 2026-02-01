'use client';

import { HiPlay } from 'react-icons/hi';
import { MdTimer, MdLightbulb } from 'react-icons/md';

interface ModeSelectViewProps {
  durationMinutes: string;
  durationSeconds: string;
  onDurationMinutesChange: (value: string) => void;
  onDurationSecondsChange: (value: string) => void;
  onManualStart: () => Promise<void>;
  onRecommendedMode: () => void;
  isStartDisabled: boolean;
}

/**
 * モード選択画面（inputMode === null の場合に表示）
 * - 手動入力フィールドとスタートボタン
 * - おすすめタイマーボタン
 */
export function ModeSelectView({
  durationMinutes,
  durationSeconds,
  onDurationMinutesChange,
  onDurationSecondsChange,
  onManualStart,
  onRecommendedMode,
  isStartDisabled,
}: ModeSelectViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      {/* タイトルセクション */}
      <div className="text-center space-y-4 mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg mb-3">
          <MdTimer className="text-white text-4xl sm:text-5xl" />
        </div>
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          ローストタイマー
        </h3>
        <p className="text-base sm:text-lg text-gray-500">焙煎時間を設定してスタート</p>
      </div>

      {/* 手動入力フィールド */}
      <div className="space-y-4 max-w-md mx-auto w-full mb-8 sm:mb-10">
        <label className="block text-sm sm:text-base font-semibold text-gray-700 uppercase tracking-wide">
          時間設定
        </label>
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              value={durationMinutes}
              onChange={(e) => onDurationMinutesChange(e.target.value)}
              placeholder="分"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 sm:py-4 text-lg sm:text-xl text-gray-900 bg-white focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[56px] shadow-sm hover:border-gray-300"
            />
          </div>
          <div className="flex items-end pb-2">
            <span className="text-3xl font-bold text-gray-400">:</span>
          </div>
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              value={durationSeconds}
              onChange={(e) => onDurationSecondsChange(e.target.value)}
              placeholder="秒"
              maxLength={2}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 sm:py-4 text-lg sm:text-xl text-gray-900 bg-white focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[56px] shadow-sm hover:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* ボタンセクション */}
      <div className="space-y-3 sm:space-y-4 max-w-md mx-auto w-full">
        {/* 手動スタートボタン */}
        <button
          onClick={onManualStart}
          disabled={isStartDisabled}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 min-h-[60px] sm:min-h-[64px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
        >
          <HiPlay className="text-xl sm:text-2xl" />
          <span>手動でタイマースタート</span>
        </button>

        {/* おすすめ焙煎ボタン */}
        <button
          onClick={onRecommendedMode}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-2 border-amber-200 rounded-xl font-bold text-base sm:text-lg shadow-sm hover:shadow-md hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 active:scale-[0.98] transition-all duration-200 min-h-[60px] sm:min-h-[64px]"
        >
          <MdLightbulb className="text-xl sm:text-2xl text-amber-600" />
          <span>おすすめタイマー</span>
        </button>
      </div>
    </div>
  );
}

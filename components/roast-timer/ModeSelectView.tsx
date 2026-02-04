'use client';

import { HiPlay } from 'react-icons/hi';
import { MdTimer, MdLightbulb } from 'react-icons/md';
import { Input, Button } from '@/components/ui';

interface ModeSelectViewProps {
  durationMinutes: string;
  durationSeconds: string;
  onDurationMinutesChange: (value: string) => void;
  onDurationSecondsChange: (value: string) => void;
  onManualStart: () => Promise<void>;
  onRecommendedMode: () => void;
  isStartDisabled: boolean;
  isChristmasMode: boolean;
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
  isChristmasMode,
}: ModeSelectViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      {/* タイトルセクション */}
      <div className="text-center space-y-4 mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg mb-3">
          <MdTimer className="text-white text-4xl sm:text-5xl" />
        </div>
        <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
          ローストタイマー
        </h3>
        <p className={`text-base sm:text-lg ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-500'}`}>焙煎時間を設定してスタート</p>
      </div>

      {/* 手動入力フィールド */}
      <div className="space-y-4 max-w-md mx-auto w-full mb-8 sm:mb-10">
        <label className={`block text-sm sm:text-base font-semibold uppercase tracking-wide ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          時間設定
        </label>
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={durationMinutes}
              onChange={(e) => onDurationMinutesChange(e.target.value)}
              placeholder="分"
              className="text-center font-semibold text-lg sm:text-xl"
              isChristmasMode={isChristmasMode}
            />
          </div>
          <div className="flex items-end pb-2">
            <span className={`text-3xl font-bold ${isChristmasMode ? 'text-[#f8f1e7]/40' : 'text-gray-400'}`}>:</span>
          </div>
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={durationSeconds}
              onChange={(e) => onDurationSecondsChange(e.target.value)}
              placeholder="秒"
              maxLength={2}
              className="text-center font-semibold text-lg sm:text-xl"
              isChristmasMode={isChristmasMode}
            />
          </div>
        </div>
      </div>

      {/* ボタンセクション */}
      <div className="space-y-3 sm:space-y-4 max-w-md mx-auto w-full">
        {/* 手動スタートボタン */}
        <Button
          variant="primary"
          size="lg"
          onClick={onManualStart}
          disabled={isStartDisabled}
          className="w-full flex items-center justify-center gap-2"
          isChristmasMode={isChristmasMode}
        >
          <HiPlay className="text-xl sm:text-2xl" />
          <span>手動でタイマースタート</span>
        </Button>

        {/* おすすめ焙煎ボタン */}
        <Button
          variant="secondary"
          size="lg"
          onClick={onRecommendedMode}
          className="w-full flex items-center justify-center gap-2"
          isChristmasMode={isChristmasMode}
        >
          <MdLightbulb className="text-xl sm:text-2xl" />
          <span>おすすめタイマー</span>
        </Button>
      </div>
    </div>
  );
}

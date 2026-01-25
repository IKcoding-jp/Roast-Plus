'use client';

import Link from 'next/link';
import { HiArrowLeft, HiClipboardList } from 'react-icons/hi';
import { IoSettings } from 'react-icons/io5';

interface TimerHeaderProps {
  onBack: () => void;
  onSettingsClick: () => void;
  isOverlay?: boolean;
}

/**
 * タイマー画面のヘッダーボタン
 * - 戻るボタン
 * - 設定ボタン
 * - 記録一覧リンク
 */
export function TimerHeader({ onBack, onSettingsClick, isOverlay = false }: TimerHeaderProps) {
  const containerClass = isOverlay
    ? 'absolute top-4 left-4 right-4 z-10 flex justify-between items-start'
    : 'absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none';

  return (
    <div className={containerClass}>
      <button
        onClick={onBack}
        className={`px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] ${!isOverlay ? 'pointer-events-auto' : ''}`}
        title="戻る"
        aria-label="戻る"
      >
        <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
      </button>
      <div className={`flex items-center gap-2 ${!isOverlay ? 'pointer-events-auto' : ''}`}>
        <button
          onClick={onSettingsClick}
          className="px-4 py-2.5 bg-white text-gray-800 rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200 flex items-center gap-2 min-h-[44px] border border-gray-200"
          title="ローストタイマー設定"
          aria-label="ローストタイマー設定"
        >
          <IoSettings className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold hidden sm:inline">タイマー設定</span>
        </button>
        <Link
          href="/roast-record"
          className="px-4 py-2.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark hover:shadow-lg transition-all duration-200 flex items-center gap-2 min-h-[44px]"
          title="ロースト記録一覧"
          aria-label="ロースト記録一覧"
        >
          <HiClipboardList className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold hidden sm:inline">記録一覧</span>
        </Link>
      </div>
    </div>
  );
}

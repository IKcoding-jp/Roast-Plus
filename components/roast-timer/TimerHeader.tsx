'use client';

import Link from 'next/link';
import { HiArrowLeft, HiClipboardList } from 'react-icons/hi';
import { IoSettings } from 'react-icons/io5';
import { IconButton, Button } from '@/components/ui';

interface TimerHeaderProps {
  onBack: () => void;
  onSettingsClick: () => void;
  isOverlay?: boolean;
  isChristmasMode?: boolean;
}

/**
 * タイマー画面のヘッダーボタン
 * - 戻るボタン
 * - 設定ボタン
 * - 記録一覧リンク
 */
export function TimerHeader({ onBack, onSettingsClick, isOverlay = false, isChristmasMode = false }: TimerHeaderProps) {
  const containerClass = isOverlay
    ? 'absolute top-4 left-4 right-4 z-10 flex justify-between items-start'
    : 'absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none';

  return (
    <div className={containerClass}>
      <IconButton
        onClick={onBack}
        size="lg"
        title="戻る"
        aria-label="戻る"
        className={`${!isOverlay ? 'pointer-events-auto' : ''}`}
        isChristmasMode={isChristmasMode}
      >
        <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
      </IconButton>
      <div className={`flex items-center gap-2 ${!isOverlay ? 'pointer-events-auto' : ''}`}>
        <Button
          variant="secondary"
          size="md"
          onClick={onSettingsClick}
          className="flex items-center gap-2"
          title="ローストタイマー設定"
          aria-label="ローストタイマー設定"
          isChristmasMode={isChristmasMode}
        >
          <IoSettings className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold hidden sm:inline">タイマー設定</span>
        </Button>
        <Link href="/roast-record" className="inline-block">
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-2"
            title="ロースト記録一覧"
            aria-label="ロースト記録一覧"
            isChristmasMode={isChristmasMode}
          >
            <HiClipboardList className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-semibold hidden sm:inline">記録一覧</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

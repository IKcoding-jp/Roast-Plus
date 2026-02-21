'use client';

import Link from 'next/link';
import { HiClipboardList } from 'react-icons/hi';
import { IoSettings } from 'react-icons/io5';
import { Button } from '@/components/ui';

interface TimerHeaderProps {
  onSettingsClick: () => void;
  isOverlay?: boolean;
}

/**
 * タイマー画面の右側アクションボタン
 * - 設定ボタン
 * - 記録一覧リンク
 * ※ 戻るボタンはページレベルの FloatingNav で提供
 */
export function TimerHeader({ onSettingsClick, isOverlay = false }: TimerHeaderProps) {
  const containerClass = isOverlay
    ? 'absolute top-4 right-4 z-10 flex items-start'
    : 'absolute top-4 right-4 z-10 flex items-start pointer-events-none';

  return (
    <div className={containerClass}>
      <div className={`flex items-center gap-2 ${!isOverlay ? 'pointer-events-auto' : ''}`}>
        <Button
          variant="secondary"
          size="md"
          onClick={onSettingsClick}
          className="flex items-center gap-2"
          title="ローストタイマー設定"
          aria-label="ローストタイマー設定"
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
          >
            <HiClipboardList className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-semibold hidden sm:inline">記録一覧</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

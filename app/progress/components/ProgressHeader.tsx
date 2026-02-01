'use client';

import Link from 'next/link';
import { HiArrowLeft, HiPlus, HiFilter, HiArchive } from 'react-icons/hi';
import { MdTimeline } from 'react-icons/md';
import { Button } from '@/components/ui';

interface ProgressHeaderProps {
  viewMode: 'normal' | 'archived';
  showEmptyState: boolean;
  hasArchivedItems: boolean;
  onShowFilter: () => void;
  onShowArchived: () => void;
  onShowModeSelect: () => void;
  onBackToNormal: () => void;
}

export function ProgressHeader({
  viewMode,
  showEmptyState,
  hasArchivedItems,
  onShowFilter,
  onShowArchived,
  onShowModeSelect,
  onBackToNormal,
}: ProgressHeaderProps) {
  return (
    <header>
      <div className="grid grid-cols-2 sm:grid-cols-3 items-center mb-4">
        {/* 左側: 戻る */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="戻る"
            aria-label="戻る"
          >
            <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
          </Link>
        </div>

        {/* 中央: タイトル */}
        <div className="hidden sm:flex justify-center items-center gap-2 sm:gap-4 min-w-0">
          {viewMode === 'archived' ? (
            <>
              <HiArchive className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 whitespace-nowrap">アーカイブ済み作業</h1>
            </>
          ) : (
            <>
              <MdTimeline className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 whitespace-nowrap">作業進捗</h1>
            </>
          )}
        </div>

        {/* 右側: アクションボタン */}
        <div className="flex justify-end items-center gap-2 sm:gap-3 flex-shrink-0">
          {viewMode === 'normal' && !showEmptyState && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowFilter}
                className="shadow-md !bg-white !text-gray-700 hover:!bg-gray-50"
                aria-label="フィルタと並び替え"
                title="フィルタと並び替え"
              >
                <HiFilter className="h-4 w-4" />
                <span className="hidden md:inline ml-2 text-sm font-medium whitespace-nowrap">フィルター</span>
              </Button>
              {hasArchivedItems && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowArchived}
                  className="shadow-md !bg-white !text-gray-700 hover:!bg-gray-50"
                  aria-label="アーカイブ一覧"
                  title="アーカイブ一覧"
                >
                  <HiArchive className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={onShowModeSelect}
                className="shadow-md"
              >
                <HiPlus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">追加</span>
              </Button>
            </>
          )}
          {viewMode === 'archived' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToNormal}
              className="shadow-sm !bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-50"
            >
              <MdTimeline className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">一覧に戻る</span>
            </Button>
          )}
        </div>
      </div>

      {/* モバイル用タイトル */}
      <div className="sm:hidden flex justify-center items-center gap-2 mb-4">
        {viewMode === 'archived' ? (
          <>
            <HiArchive className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <h1 className="text-lg font-bold text-gray-800">アーカイブ済み作業</h1>
          </>
        ) : (
          <>
            <MdTimeline className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <h1 className="text-lg font-bold text-gray-800">作業進捗</h1>
          </>
        )}
      </div>
    </header>
  );
}

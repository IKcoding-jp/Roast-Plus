'use client';

import { HiPlus, HiFilter, HiArchive } from 'react-icons/hi';
import { MdTimeline } from 'react-icons/md';
import { Button, FloatingNav } from '@/components/ui';

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
    <FloatingNav
      backHref="/"
      right={
        <>
          {viewMode === 'normal' && !showEmptyState && (
            <>
              <Button
                variant="surface"
                size="sm"
                onClick={onShowFilter}
                aria-label="フィルタと並び替え"
                title="フィルタと並び替え"
              >
                <HiFilter className="h-4 w-4" />
                <span className="hidden md:inline ml-2 text-sm font-medium whitespace-nowrap">フィルター</span>
              </Button>
              {hasArchivedItems && (
                <Button
                  variant="surface"
                  size="sm"
                  onClick={onShowArchived}
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
              variant="surface"
              size="sm"
              onClick={onBackToNormal}
            >
              <MdTimeline className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">一覧に戻る</span>
            </Button>
          )}
        </>
      }
    />
  );
}

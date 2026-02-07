'use client';

import { useRef, useEffect } from 'react';
import { HiCheckCircle } from 'react-icons/hi';
import { MdSort, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Button } from '@/components/ui';

type SortOption = 'default' | 'createdAtDesc' | 'createdAtAsc' | 'nameAsc' | 'nameDesc';

interface SortMenuProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  showSortMenu: boolean;
  onToggleMenu: () => void;
  onClose: () => void;
}

const SORT_OPTIONS: SortOption[] = ['default', 'createdAtDesc', 'createdAtAsc', 'nameAsc', 'nameDesc'];

const getSortLabel = (option: SortOption): string => {
  switch (option) {
    case 'default':
      return 'デフォルト';
    case 'createdAtDesc':
      return '新しい順';
    case 'createdAtAsc':
      return '古い順';
    case 'nameAsc':
      return '名前昇順';
    case 'nameDesc':
      return '名前降順';
  }
};

const getSortIcon = (option: SortOption) => {
  if (option === 'default') {
    return <MdSort className="h-5 w-5" />;
  } else if (option === 'createdAtAsc' || option === 'nameAsc') {
    return <MdArrowUpward className="h-5 w-5" />;
  } else {
    return <MdArrowDownward className="h-5 w-5" />;
  }
};

export function SortMenu({
  sortOption,
  onSortChange,
  showSortMenu,
  onToggleMenu,
  onClose,
}: SortMenuProps) {
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu, onClose]);

  return (
    <div className="relative" ref={sortMenuRef}>
      <Button
        variant={showSortMenu ? 'primary' : 'surface'}
        size="sm"
        onClick={onToggleMenu}
        title="ソート"
        className="!px-3 !py-2 gap-1.5"
      >
        {getSortIcon(sortOption)}
        <span className="text-xs sm:text-sm">ソート</span>
      </Button>
      {/* ドロップダウンメニュー */}
      {showSortMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-card z-50 bg-surface border border-edge">
          <div className="py-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSortChange(option);
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                  sortOption === option
                    ? 'bg-spot-subtle text-spot font-medium'
                    : 'text-ink-sub hover:bg-ground'
                }`}
              >
                {sortOption === option && <HiCheckCircle className="h-4 w-4 text-spot" />}
                <span>{getSortLabel(option)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

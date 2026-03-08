'use client';

import { useState } from 'react';
import { HiCheckCircle, HiSearch, HiCollection, HiXCircle } from 'react-icons/hi';
import { MdFilterList, MdSort, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Button, Input, Modal } from '@/components/ui';

type FilterOption = 'all' | 'shouldRemove' | 'shouldNotRemove';
type SortOption = 'default' | 'createdAtDesc' | 'createdAtAsc' | 'nameAsc' | 'nameDesc';

interface FilterMenuProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOption: FilterOption;
  onFilterChange: (option: FilterOption) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
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

const FILTER_OPTIONS: { value: FilterOption; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: '全て', icon: <HiCollection className="h-4 w-4" /> },
  { value: 'shouldRemove', label: '省く', icon: <HiXCircle className="h-4 w-4" /> },
  { value: 'shouldNotRemove', label: '省かない', icon: <HiCheckCircle className="h-4 w-4" /> },
];

export function FilterMenu({
  searchQuery,
  onSearchChange,
  filterOption,
  onFilterChange,
  sortOption,
  onSortChange,
}: FilterMenuProps) {
  const [showModal, setShowModal] = useState(false);

  const isActive = searchQuery.trim() !== '' || filterOption !== 'all' || sortOption !== 'default';

  return (
    <>
      <Button
        variant={isActive ? 'primary' : 'surface'}
        size="sm"
        onClick={() => setShowModal(true)}
        title="フィルター"
        className="!px-3 !py-2 gap-1.5"
      >
        <MdFilterList className="h-5 w-5" />
        <span className="text-xs sm:text-sm">フィルター</span>
      </Button>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        contentClassName="bg-overlay rounded-2xl shadow-xl overflow-hidden w-full max-w-sm border border-edge"
      >
        <div className="p-5 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-ink">フィルター</h2>

          {/* 検索セクション */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-ink-sub uppercase tracking-wide">検索</p>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted z-10" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="名称や特徴で検索..."
                className="pl-10 !py-2 !text-sm !min-h-[40px]"
              />
            </div>
          </div>

          {/* 絞り込みセクション */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-ink-sub uppercase tracking-wide">絞り込み</p>
            <div className="flex gap-2">
              {FILTER_OPTIONS.map(({ value, label, icon }) => (
                <Button
                  key={value}
                  variant={filterOption === value ? 'primary' : 'surface'}
                  size="sm"
                  onClick={() => onFilterChange(value)}
                  className="flex-1 !px-3 !py-2 gap-1.5 justify-center"
                >
                  {icon}
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* ソートセクション */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-ink-sub uppercase tracking-wide">ソート</p>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSortChange(option)}
                  className={`!min-h-0 w-full !justify-start !px-3 !py-2 !text-sm !rounded-lg gap-2 ${
                    sortOption === option
                      ? 'bg-spot-subtle !text-spot !font-medium'
                      : '!text-ink-sub hover:bg-ground'
                  }`}
                >
                  {getSortIcon(option)}
                  <span>{getSortLabel(option)}</span>
                  {sortOption === option && <HiCheckCircle className="h-4 w-4 text-spot ml-auto" />}
                </Button>
              ))}
            </div>
          </div>

          {/* 閉じるボタン */}
          <Button
            variant="surface"
            size="sm"
            onClick={() => setShowModal(false)}
            className="w-full justify-center"
          >
            閉じる
          </Button>
        </div>
      </Modal>
    </>
  );
}

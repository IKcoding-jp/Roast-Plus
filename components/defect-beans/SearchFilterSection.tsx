'use client';

import { HiSearch, HiCollection, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { Input, Button } from '@/components/ui';

type FilterOption = 'all' | 'shouldRemove' | 'shouldNotRemove';

interface SearchFilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOption: FilterOption;
  onFilterChange: (option: FilterOption) => void;
}

export function SearchFilterSection({
  searchQuery,
  onSearchChange,
  filterOption,
  onFilterChange,
}: SearchFilterSectionProps) {
  return (
    <div className="rounded-lg shadow-card p-3 sm:p-4 mb-4 bg-surface border border-edge">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 検索 */}
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-ink-muted" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="名称や特徴で検索..."
              className="pl-10 !py-2 !text-sm !min-h-[40px]"
            />
          </div>
        </div>

        {/* フィルタ */}
        <div className="flex gap-1.5">
          <Button
            variant={filterOption === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onFilterChange('all')}
            className={`!px-3 !py-1.5 !min-h-[36px] ${filterOption !== 'all' ? '!bg-gray-200 !text-gray-700 hover:!bg-gray-300' : ''}`}
            title="全て表示"
          >
            <HiCollection className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm">全て</span>
          </Button>
          <Button
            variant={filterOption === 'shouldRemove' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => onFilterChange('shouldRemove')}
            className={`!px-3 !py-1.5 !min-h-[36px] ${filterOption !== 'shouldRemove' ? '!bg-gray-200 !text-gray-700 hover:!bg-gray-300' : ''}`}
            title="省く設定のもの"
          >
            <HiXCircle className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm">省く</span>
          </Button>
          <Button
            variant={filterOption === 'shouldNotRemove' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => onFilterChange('shouldNotRemove')}
            className={`!px-3 !py-1.5 !min-h-[36px] ${filterOption !== 'shouldNotRemove' ? '!bg-gray-200 !text-gray-700 hover:!bg-gray-300' : ''}`}
            title="省かない設定のもの"
          >
            <HiCheckCircle className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm">省かない</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

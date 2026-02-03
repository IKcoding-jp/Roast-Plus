'use client';

import { HiSearch, HiCollection, HiCheckCircle, HiXCircle } from 'react-icons/hi';

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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 検索 */}
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="名称や特徴で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[40px] text-sm text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* フィルタ */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 text-sm ${
              filterOption === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="全て表示"
          >
            <HiCollection className="h-4 w-4" />
            <span className="text-xs sm:text-sm">全て</span>
          </button>
          <button
            onClick={() => onFilterChange('shouldRemove')}
            className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 text-sm ${
              filterOption === 'shouldRemove'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="省く設定のもの"
          >
            <HiXCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">省く</span>
          </button>
          <button
            onClick={() => onFilterChange('shouldNotRemove')}
            className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 text-sm ${
              filterOption === 'shouldNotRemove'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="省かない設定のもの"
          >
            <HiCheckCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">省かない</span>
          </button>
        </div>
      </div>
    </div>
  );
}

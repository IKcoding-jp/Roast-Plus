'use client';

import { ROAST_LEVELS } from '@/lib/constants';

const WEIGHTS: Array<200 | 300 | 500> = [200, 300, 500];

type SortOption = 'newest' | 'oldest' | 'beanName' | 'date';

interface RoastRecordFiltersProps {
  searchQuery: string;
  sortOption: SortOption;
  showFilters: boolean;
  dateFrom: string;
  dateTo: string;
  selectedRoastLevels: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>;
  selectedWeights: Array<200 | 300 | 500>;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onShowFiltersToggle: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onRoastLevelToggle: (level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り') => void;
  onWeightToggle: (weight: 200 | 300 | 500) => void;
  onResetFilters: () => void;
}

export function RoastRecordFilters({
  searchQuery,
  sortOption,
  showFilters,
  dateFrom,
  dateTo,
  selectedRoastLevels,
  selectedWeights,
  onSearchChange,
  onSortChange,
  onShowFiltersToggle,
  onDateFromChange,
  onDateToChange,
  onRoastLevelToggle,
  onWeightToggle,
  onResetFilters,
}: RoastRecordFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4 flex-shrink-0">
      {/* 検索バーとソート */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="豆の名前で検索"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="beanName">豆の名前順</option>
            <option value="date">焙煎日順</option>
          </select>
        </div>
        <button
          onClick={onShowFiltersToggle}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap min-h-[44px]"
        >
          {showFilters ? 'フィルタを閉じる' : 'フィルタ'}
        </button>
      </div>

      {/* フィルタパネル */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* 日付範囲 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900 min-h-[44px]"
              />
            </div>
          </div>

          {/* 焙煎度合い */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              焙煎度合い
            </label>
            <div className="flex flex-wrap gap-3">
              {ROAST_LEVELS.map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoastLevels.includes(level)}
                    onChange={() => onRoastLevelToggle(level)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-600"
                  />
                  <span className="text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 重さ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              重さ
            </label>
            <div className="flex flex-wrap gap-3">
              {WEIGHTS.map((weight) => (
                <label
                  key={weight}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedWeights.includes(weight)}
                    onChange={() => onWeightToggle(weight)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-600"
                  />
                  <span className="text-sm text-gray-700">{weight}g</span>
                </label>
              ))}
            </div>
          </div>

          {/* フィルタリセット */}
          {(dateFrom ||
            dateTo ||
            selectedRoastLevels.length > 0 ||
            selectedWeights.length > 0) && (
            <button
              onClick={onResetFilters}
              className="text-sm text-amber-600 hover:underline"
            >
              フィルタをリセット
            </button>
          )}
        </div>
      )}
    </div>
  );
}

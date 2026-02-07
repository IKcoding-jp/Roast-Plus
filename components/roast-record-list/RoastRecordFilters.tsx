'use client';

import { ROAST_LEVELS } from '@/lib/constants';
import { Input, Select, Button, Checkbox } from '@/components/ui';

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
    <div className="rounded-lg p-4 space-y-4 flex-shrink-0 bg-surface text-ink-sub shadow-md">
      {/* 検索バーとソート */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="豆の名前で検索"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            options={[
              { value: 'newest', label: '新しい順' },
              { value: 'oldest', label: '古い順' },
              { value: 'beanName', label: '豆の名前順' },
              { value: 'date', label: '焙煎日順' },
            ]}
          />
        </div>
        <Button
          variant="surface"
          size="md"
          onClick={onShowFiltersToggle}
          className="whitespace-nowrap"
        >
          {showFilters ? 'フィルタを閉じる' : 'フィルタ'}
        </Button>
      </div>

      {/* フィルタパネル */}
      {showFilters && (
        <div className="pt-4 space-y-4 border-t border-edge">
          {/* 日付範囲 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-ink-sub">
                開始日
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-ink-sub">
                終了日
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
              />
            </div>
          </div>

          {/* 焙煎度合い */}
          <div>
            <label className="block text-sm font-medium mb-2 text-ink-sub">
              焙煎度合い
            </label>
            <div className="flex flex-wrap gap-3">
              {ROAST_LEVELS.map((level) => (
                <Checkbox
                  key={level}
                  checked={selectedRoastLevels.includes(level)}
                  onChange={() => onRoastLevelToggle(level)}
                  label={level}
                />
              ))}
            </div>
          </div>

          {/* 重さ */}
          <div>
            <label className="block text-sm font-medium mb-2 text-ink-sub">
              重さ
            </label>
            <div className="flex flex-wrap gap-3">
              {WEIGHTS.map((weight) => (
                <Checkbox
                  key={weight}
                  checked={selectedWeights.includes(weight)}
                  onChange={() => onWeightToggle(weight)}
                  label={`${weight}g`}
                />
              ))}
            </div>
          </div>

          {/* フィルタリセット */}
          {(dateFrom ||
            dateTo ||
            selectedRoastLevels.length > 0 ||
            selectedWeights.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
            >
              フィルタをリセット
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

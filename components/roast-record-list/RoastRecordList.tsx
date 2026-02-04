'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AppData } from '@/types';
import { RoastRecordFilters } from './RoastRecordFilters';
import { RoastRecordCard } from './RoastRecordCard';

interface RoastRecordListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
  isChristmasMode?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'beanName' | 'date';

export function RoastRecordList({ data, onUpdate, isChristmasMode = false }: RoastRecordListProps) {
  const router = useRouter();

  const roastTimerRecords = useMemo(
    () => (Array.isArray(data.roastTimerRecords) ? data.roastTimerRecords : []),
    [data.roastTimerRecords]
  );

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<
    Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>
  >([]);
  const [selectedWeights, setSelectedWeights] = useState<Array<200 | 300 | 500>>([]);
  const [showFilters, setShowFilters] = useState(false);

  // フィルタリングとソート
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = [...roastTimerRecords];

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) =>
        record.beanName.toLowerCase().includes(query)
      );
    }

    // 日付範囲フィルタ
    if (dateFrom) {
      filtered = filtered.filter((record) => record.roastDate >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((record) => record.roastDate <= dateTo);
    }

    // 焙煎度合いフィルタ
    if (selectedRoastLevels.length > 0) {
      filtered = filtered.filter((record) =>
        selectedRoastLevels.includes(record.roastLevel)
      );
    }

    // 重さフィルタ
    if (selectedWeights.length > 0) {
      filtered = filtered.filter((record) =>
        selectedWeights.includes(record.weight)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          // 焙煎日（新しい順）、同じ日付の場合はcreatedAt（新しい順）
          const dateCompare = b.roastDate.localeCompare(a.roastDate);
          if (dateCompare !== 0) return dateCompare;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          // 焙煎日（古い順）、同じ日付の場合はcreatedAt（古い順）
          const dateCompareOld = a.roastDate.localeCompare(b.roastDate);
          if (dateCompareOld !== 0) return dateCompareOld;
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'beanName':
          return a.beanName.localeCompare(b.beanName, 'ja');
        case 'date':
          return b.roastDate.localeCompare(a.roastDate);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    roastTimerRecords,
    searchQuery,
    sortOption,
    dateFrom,
    dateTo,
    selectedRoastLevels,
    selectedWeights,
  ]);

  // 検索・フィルタ変更時のハンドラー
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
  };

  const handleRoastLevelToggle = (
    level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  ) => {
    setSelectedRoastLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const handleWeightToggle = (weight: 200 | 300 | 500) => {
    setSelectedWeights((prev) =>
      prev.includes(weight)
        ? prev.filter((w) => w !== weight)
        : [...prev, weight]
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // カードクリックイベントを防ぐ
    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (!confirmDelete) return;

    const updatedRecords = roastTimerRecords.filter((r) => r.id !== id);
    onUpdate({
      ...data,
      roastTimerRecords: updatedRecords,
    });
  };

  const handleCardClick = (id: string) => {
    router.push(`/roast-record?recordId=${id}`);
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedRoastLevels([]);
    setSelectedWeights([]);
  };

  if (roastTimerRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}>ロースト記録がありません</p>
        <p className={`text-sm mt-2 ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>
          右上のボタンから新規記録を作成できます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col min-h-0">
      {/* 検索・ソート・フィルタUI */}
      <RoastRecordFilters
        searchQuery={searchQuery}
        sortOption={sortOption}
        showFilters={showFilters}
        dateFrom={dateFrom}
        dateTo={dateTo}
        selectedRoastLevels={selectedRoastLevels}
        selectedWeights={selectedWeights}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onShowFiltersToggle={() => setShowFilters(!showFilters)}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onRoastLevelToggle={handleRoastLevelToggle}
        onWeightToggle={handleWeightToggle}
        onResetFilters={handleResetFilters}
        isChristmasMode={isChristmasMode}
      />

      {/* 結果数表示 */}
      {filteredAndSortedRecords.length === 0 ? (
        <div className={`text-center py-12 rounded-lg shadow-md flex-shrink-0 ${isChristmasMode ? 'bg-[#0a2818]' : 'bg-white'}`}>
          <p className={isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}>検索条件に一致する記録がありません</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0 md:items-start md:auto-rows-auto">
          {filteredAndSortedRecords.map((record) => (
            <RoastRecordCard
              key={record.id}
              record={record}
              onDelete={handleDelete}
              onClick={handleCardClick}
              isChristmasMode={isChristmasMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

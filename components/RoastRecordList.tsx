'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AppData, RoastTimerRecord } from '@/types';
import { formatTime } from '@/lib/roastTimerUtils';
import { HiTrash, HiCalendar } from 'react-icons/hi';
import { MdTimer } from 'react-icons/md';
import { PiCoffeeBeanFill } from 'react-icons/pi';

interface RoastRecordListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

type SortOption = 'newest' | 'oldest' | 'beanName' | 'date';

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

const WEIGHTS: Array<200 | 300 | 500> = [200, 300, 500];

export function RoastRecordList({ data, onUpdate }: RoastRecordListProps) {
  const router = useRouter();

  const roastTimerRecords = Array.isArray(data.roastTimerRecords)
    ? data.roastTimerRecords
    : [];

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

  const formatDate = (dateStr: string) => {
    // YYYY-MM-DD形式をYYYY/MM/DD形式に変換
    const [year, month, day] = dateStr.split('-');
    return `${year}/${month}/${day}`;
  };

  const getRoastLevelColor = (
    level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  ) => {
    switch (level) {
      case '深煎り':
        return '#120C0A';
      case '中深煎り':
        return '#4E3526';
      case '中煎り':
        return '#745138';
      case '浅煎り':
        return '#C78F5D';
      default:
        return '#6B7280';
    }
  };

  if (roastTimerRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ロースト記録がありません</p>
        <p className="text-sm text-gray-500 mt-2">
          右上のボタンから新規記録を作成できます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col min-h-0">
      {/* 検索・ソート・フィルタUI */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4 flex-shrink-0">
        {/* 検索バーとソート */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="豆の名前で検索"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="beanName">豆の名前順</option>
              <option value="date">焙煎日順</option>
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
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
                  onChange={(e) => handleDateFromChange(e.target.value)}
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
                  onChange={(e) => handleDateToChange(e.target.value)}
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
                      onChange={() => handleRoastLevelToggle(level)}
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
                      onChange={() => handleWeightToggle(weight)}
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
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSelectedRoastLevels([]);
                  setSelectedWeights([]);
                }}
                className="text-sm text-amber-600 hover:underline"
              >
                フィルタをリセット
              </button>
            )}
          </div>
        )}
      </div>

      {/* 結果数表示 */}
      {filteredAndSortedRecords.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md flex-shrink-0">
          <p className="text-gray-600">検索条件に一致する記録がありません</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
          {filteredAndSortedRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-100"
              onClick={() => handleCardClick(record.id)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* 左側: メイン情報 */}
                <div className="flex-1 min-w-0">
                  {/* 豆名と焙煎度合い */}
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <PiCoffeeBeanFill className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {record.beanName}
                      </h3>
                      <span
                        className="inline-block px-2.5 sm:px-3 py-1 text-white text-xs sm:text-sm font-semibold rounded-full flex-shrink-0"
                        style={{ backgroundColor: getRoastLevelColor(record.roastLevel) }}
                      >
                        {record.roastLevel}
                      </span>
                    </div>
                  </div>

                  {/* 詳細情報（グリッドレイアウト） */}
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
                    {/* 焙煎日 */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <HiCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-0.5">焙煎日</span>
                        <span className="text-sm sm:text-base font-medium text-gray-900">
                          {formatDate(record.roastDate)}
                        </span>
                      </div>
                    </div>

                    {/* 重さ */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-base sm:text-lg">⚖</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-0.5">重さ</span>
                        <span className="text-sm sm:text-base font-medium text-gray-900">
                          {record.weight}g
                        </span>
                      </div>
                    </div>

                    {/* 焙煎時間 */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <MdTimer className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-0.5">焙煎時間</span>
                        <span className="text-sm sm:text-base font-medium text-gray-900 font-mono">
                          {formatTime(record.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右側: 削除ボタン */}
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="削除"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


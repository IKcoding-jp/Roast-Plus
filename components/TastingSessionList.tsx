'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoCreateOutline } from 'react-icons/io5';
import { FaCoffee } from 'react-icons/fa';
import type { AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import { TastingSessionCarousel } from './TastingSessionCarousel';
import {
  calculateAverageScores,
  getActiveMemberCount,
  getRecordsBySessionId,
} from '@/lib/tastingUtils';

interface TastingSessionListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

type SortOption = 'newest' | 'oldest' | 'beanName';

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

export function TastingSessionList({ data, onUpdate }: TastingSessionListProps) {
  const router = useRouter();

  const tastingSessions = Array.isArray(data.tastingSessions)
    ? data.tastingSessions
    : [];
  const tastingRecords = Array.isArray(data.tastingRecords)
    ? data.tastingRecords
    : [];
  const activeMemberCount = getActiveMemberCount(data.members);

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<
    Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>
  >([]);
  const [showFilters, setShowFilters] = useState(false);

  // フィルタリングとソート
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...tastingSessions];

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.beanName.toLowerCase().includes(query)
      );
    }

    // 日付範囲フィルタ
    if (dateFrom) {
      filtered = filtered.filter(
        (session) => session.createdAt >= dateFrom
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (session) => session.createdAt <= `${dateTo}T23:59:59.999Z`
      );
    }

    // 焙煎度合いフィルタ
    if (selectedRoastLevels.length > 0) {
      filtered = filtered.filter((session) =>
        selectedRoastLevels.includes(session.roastLevel)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'beanName':
          return a.beanName.localeCompare(b.beanName, 'ja');
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    tastingSessions,
    searchQuery,
    sortOption,
    dateFrom,
    dateTo,
    selectedRoastLevels,
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating: number) => {
    if (rating === 0) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">評価なし</span>
        </div>
      );
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-base">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-base">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-300 text-base">★</span>
        ))}
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (tastingSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">試飲セッションがありません</p>
        <p className="text-sm text-gray-500 mt-2">
          右下のボタンから新規セッションを作成できます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 検索・ソート・フィルタUI */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
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
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
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

            {/* フィルタリセット */}
            {(dateFrom || dateTo || selectedRoastLevels.length > 0) && (
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSelectedRoastLevels([]);
                  setCurrentPage(1);
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
      {filteredAndSortedSessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">検索条件に一致するセッションがありません</p>
        </div>
      ) : (
        <TastingSessionCarousel
          sessions={filteredAndSortedSessions}
          tastingRecords={tastingRecords}
          activeMemberCount={activeMemberCount}
          router={router}
        />
      )}
    </div>
  );
}

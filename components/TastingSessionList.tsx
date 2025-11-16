'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCoffee } from 'react-icons/fa';
import { HiSearch, HiPlus, HiX, HiFilter } from 'react-icons/hi';
import type { AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import { TastingSessionCarousel } from './TastingSessionCarousel';
import {
  calculateAverageScores,
  getActiveParticipantCount,
  getRecordsBySessionId,
} from '@/lib/tastingUtils';

interface TastingSessionListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
  filterButtonContainerId?: string;
}

type SortOption = 'newest' | 'oldest' | 'beanName';

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

export function TastingSessionList({ data, onUpdate, filterButtonContainerId }: TastingSessionListProps) {
  const router = useRouter();

  const tastingSessions = Array.isArray(data.tastingSessions)
    ? data.tastingSessions
    : [];
  const tastingRecords = Array.isArray(data.tastingRecords)
    ? data.tastingRecords
    : [];
  const activeMemberCount = getActiveParticipantCount(data);

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<
    Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>
  >([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // モーダル内で使用する一時的なフィルター状態
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [tempSortOption, setTempSortOption] = useState<SortOption>('newest');
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [tempSelectedRoastLevels, setTempSelectedRoastLevels] = useState<
    Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>
  >([]);

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

  // モーダル内での焙煎度合いトグル
  const handleTempRoastLevelToggle = (
    level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  ) => {
    setTempSelectedRoastLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  // フィルターモーダルを開く
  const handleOpenFilterModal = () => {
    setTempSearchQuery(searchQuery);
    setTempSortOption(sortOption);
    setTempDateFrom(dateFrom);
    setTempDateTo(dateTo);
    setTempSelectedRoastLevels(selectedRoastLevels);
    setIsFilterModalOpen(true);
  };

  // フィルターモーダルを閉じる
  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  // フィルターを適用
  const handleApplyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setSortOption(tempSortOption);
    setDateFrom(tempDateFrom);
    setDateTo(tempDateTo);
    setSelectedRoastLevels(tempSelectedRoastLevels);
    setIsFilterModalOpen(false);
  };

  // フィルターをリセット
  const handleResetFilters = () => {
    setTempSearchQuery('');
    setTempSortOption('newest');
    setTempDateFrom('');
    setTempDateTo('');
    setTempSelectedRoastLevels([]);
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (isFilterModalOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseFilterModal();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isFilterModalOpen]);

  // アクティブなフィルターの数を計算
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (selectedRoastLevels.length > 0) count++;
    return count;
  }, [searchQuery, dateFrom, dateTo, selectedRoastLevels]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  if (tastingSessions.length === 0) {
    return (
      <div className="py-12 sm:py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
          {/* アイコン */}
          <div className="relative">
            <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-50 flex items-center justify-center">
              <FaCoffee className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
            </div>
          </div>
          
          {/* メッセージ */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              試飲セッションがありません
            </h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
              最初の試飲セッションを作成して、コーヒーの感想を記録しましょう。
            </p>
          </div>
          
          {/* アクションボタン */}
          <Link
            href="/tasting/sessions/new"
            className="mt-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            <HiPlus className="w-5 h-5" />
            <span className="font-medium">セッションを作成</span>
          </Link>
        </div>
      </div>
    );
  }

  // フィルターボタンを外部コンテナにレンダリング
  const [filterButtonContainer, setFilterButtonContainer] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    if (filterButtonContainerId) {
      const container = document.getElementById(filterButtonContainerId);
      setFilterButtonContainer(container);
    }
  }, [filterButtonContainerId]);

  const filterButton = (
    <button
      onClick={handleOpenFilterModal}
      className={`px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] relative ${
        activeFilterCount > 0 ? 'text-amber-600' : ''
      }`}
      title="フィルター"
      aria-label="フィルター"
    >
      <HiFilter className="h-6 w-6 flex-shrink-0" />
      {activeFilterCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* フィルターボタンを外部コンテナにPortalでレンダリング */}
      {filterButtonContainer && createPortal(filterButton, filterButtonContainer)}
      
      <div className="space-y-3 h-full flex flex-col min-h-0">

      {/* フィルターモーダル */}
      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseFilterModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">フィルター</h2>
              <button
                onClick={handleCloseFilterModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="閉じる"
              >
                <HiX className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* 検索バー */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  豆の名前で検索
                </label>
                <input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  placeholder="豆の名前で検索"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
                />
              </div>

              {/* ソート */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  並び順
                </label>
                <select
                  value={tempSortOption}
                  onChange={(e) => setTempSortOption(e.target.value as SortOption)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
                >
                  <option value="newest">新しい順</option>
                  <option value="oldest">古い順</option>
                  <option value="beanName">豆の名前順</option>
                </select>
              </div>

              {/* 日付範囲 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  日付範囲
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      開始日
                    </label>
                    <input
                      type="date"
                      value={tempDateFrom}
                      onChange={(e) => setTempDateFrom(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      終了日
                    </label>
                    <input
                      type="date"
                      value={tempDateTo}
                      onChange={(e) => setTempDateTo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* 焙煎度合い */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                        checked={tempSelectedRoastLevels.includes(level)}
                        onChange={() => handleTempRoastLevelToggle(level)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-600"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* フィルタリセット */}
              {(tempSearchQuery.trim() || tempDateFrom || tempDateTo || tempSelectedRoastLevels.length > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-amber-600 hover:underline"
                >
                  フィルタをリセット
                </button>
              )}
            </div>

            {/* フッター */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 flex gap-3">
              <button
                onClick={handleCloseFilterModal}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium min-h-[44px]"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 結果数表示 */}
      {filteredAndSortedSessions.length === 0 ? (
        <div className="py-12 sm:py-16 text-center flex-shrink-0">
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
            {/* アイコン */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-50 flex items-center justify-center">
                <HiSearch className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
              </div>
            </div>
            
            {/* メッセージ */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                検索条件に一致するセッションがありません
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                別のキーワードで検索するか、フィルタを変更してみてください。
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-hidden">
          <TastingSessionCarousel
            sessions={filteredAndSortedSessions}
            tastingRecords={tastingRecords}
            activeMemberCount={activeMemberCount}
            router={router}
          />
        </div>
      )}
      </div>
    </>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
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

const ITEMS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);
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

  // ページネーション
  const totalPages = Math.ceil(filteredAndSortedSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSessions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedSessions, currentPage]);

  // 検索・フィルタ変更時にページを1にリセット
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const handleRoastLevelToggle = (
    level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  ) => {
    setSelectedRoastLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
    setCurrentPage(1);
  };

  const handleCardClick = (sessionId: string) => {
    router.push(`/tasting/sessions/${sessionId}`);
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
        <>
          <div className="text-sm text-gray-600">
            {filteredAndSortedSessions.length}件のセッションが見つかりました
          </div>

          {/* グリッドレイアウト */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSessions.map((session) => {
              const sessionRecords = getRecordsBySessionId(
                tastingRecords,
                session.id
              );
              const recordCount = sessionRecords.length;
              const averageScores = calculateAverageScores(sessionRecords);

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                  onClick={() => handleCardClick(session.id)}
                >
                  {/* セッション情報 */}
                  <div className="mb-2">
                    <div className="flex flex-row justify-between items-center">
                      {/* 左下: 豆の名前、焙煎度合い、記録数、作成日 */}
                      <div className="flex-1 min-w-0">
                        {/* 豆の名前、焙煎度合い */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-800">
                            {session.beanName}
                          </h3>
                          <span 
                            className="px-2 py-0.5 text-white text-xs rounded-full flex-shrink-0"
                            style={
                              session.roastLevel === '深煎り' 
                                ? { backgroundColor: '#120C0A' }
                                : session.roastLevel === '中深煎り'
                                ? { backgroundColor: '#4E3526' }
                                : session.roastLevel === '中煎り'
                                ? { backgroundColor: '#745138' }
                                : session.roastLevel === '浅煎り'
                                ? { backgroundColor: '#C78F5D' }
                                : { backgroundColor: '#6B7280' }
                            }
                          >
                            {session.roastLevel}
                          </span>
                        </div>

                        {/* 作成日 */}
                        <div>
                          <span className="text-xs text-gray-600">
                            {formatDate(session.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* 右下: 総合点表示 */}
                      {recordCount > 0 && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              総合点
                            </p>
                            {renderStars(averageScores.overallRating)}
                          </div>
                        </div>
                      )}
                      {recordCount === 0 && (
                        <div className="flex-shrink-0 ml-2 text-right">
                          <p className="text-xs text-gray-500">
                            まだ記録がありません
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* レーダーチャート（記録がある場合のみ） */}
                  {recordCount > 0 && (
                    <div className="flex justify-center mb-2 w-full">
                      <div className="w-full">
                        <TastingRadarChart
                          record={{
                            bitterness: averageScores.bitterness,
                            acidity: averageScores.acidity,
                            body: averageScores.body,
                            sweetness: averageScores.sweetness,
                            aroma: averageScores.aroma,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* みんなの感想 */}
                  {(() => {
                    // overallImpressionが存在する記録をフィルタリング
                    const comments = sessionRecords
                      .filter((record) => record.overallImpression && record.overallImpression.trim() !== '')
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((record) => record.overallImpression!);

                    if (comments.length === 0) return null;

                    return (
                      <div className="mb-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-gray-800">みんなの感想</h4>
                          <span className="px-2 py-0.5 bg-amber-600 text-white text-sm font-semibold rounded-full flex-shrink-0">
                            {recordCount}/{activeMemberCount}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {comments.map((comment, index) => (
                            <li key={index} className="text-sm text-gray-700 whitespace-pre-wrap">
                              ・{comment}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}

                </div>
              );
            })}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
              >
                前へ
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // ページ番号の表示ロジック（最大7個まで表示）
                    if (
                      totalPages <= 7 ||
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-amber-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

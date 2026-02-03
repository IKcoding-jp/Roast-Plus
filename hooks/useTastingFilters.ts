import { useState, useMemo } from 'react';
import type { TastingSession } from '@/types';

type SortOption = 'newest' | 'oldest' | 'beanName';

export function useTastingFilters(sessions: TastingSession[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<
    Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>
  >([]);

  // フィルタリングとソート
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session) => session.beanName.toLowerCase().includes(query));
    }

    // 日付範囲フィルタ
    if (dateFrom) {
      filtered = filtered.filter((session) => session.createdAt >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((session) => session.createdAt <= `${dateTo}T23:59:59.999Z`);
    }

    // 焙煎度合いフィルタ
    if (selectedRoastLevels.length > 0) {
      filtered = filtered.filter((session) => selectedRoastLevels.includes(session.roastLevel));
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'beanName':
          return a.beanName.localeCompare(b.beanName, 'ja');
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchQuery, sortOption, dateFrom, dateTo, selectedRoastLevels]);

  // アクティブなフィルターの数を計算
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (selectedRoastLevels.length > 0) count++;
    return count;
  }, [searchQuery, dateFrom, dateTo, selectedRoastLevels]);

  return {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedRoastLevels,
    setSelectedRoastLevels,
    filteredAndSortedSessions,
    activeFilterCount,
  };
}

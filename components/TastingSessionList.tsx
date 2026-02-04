'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Plus, Faders } from 'phosphor-react';
import type { AppData } from '@/types';
import { TastingSessionCarousel } from './TastingSessionCarousel';
import { TastingSessionFilterModal } from './TastingSessionFilterModal';
import { useMembers, getActiveMembers } from '@/hooks/useMembers';
import { useAuth } from '@/lib/auth';
import { useTastingFilters } from '@/hooks/useTastingFilters';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';

interface TastingSessionListProps {
  data: AppData;
  onUpdate?: (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void> | void;
  filterButtonContainerId?: string;
  filterButtonContainerIdMobile?: string;
}

export function TastingSessionList({
  data,
  onUpdate,
  filterButtonContainerId,
  filterButtonContainerIdMobile,
}: TastingSessionListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const { isChristmasMode } = useChristmasMode();

  const { members: allMembers, manager } = useMembers(userId);

  const tastingSessions = useMemo(
    () => (Array.isArray(data.tastingSessions) ? data.tastingSessions : []),
    [data.tastingSessions]
  );
  const tastingRecords = useMemo(
    () => (Array.isArray(data.tastingRecords) ? data.tastingRecords : []),
    [data.tastingRecords]
  );

  const activeMemberCount = getActiveMembers(allMembers).length + (manager ? 1 : 0);

  const {
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
  } = useTastingFilters(tastingSessions);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [containers, setContainers] = useState<{
    desktop: HTMLElement | null;
    mobile: HTMLElement | null;
  }>({ desktop: null, mobile: null });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ハイドレーション後のポータル有効化に必要
    setMounted(true);
    const updateContainers = () => {
      const desktopEl = filterButtonContainerId
        ? document.getElementById(filterButtonContainerId)
        : null;
      const mobileEl = filterButtonContainerIdMobile
        ? document.getElementById(filterButtonContainerIdMobile)
        : null;

      setContainers({
        desktop: desktopEl && desktopEl.getBoundingClientRect().width > 0 ? desktopEl : null,
        mobile: mobileEl && mobileEl.getBoundingClientRect().width > 0 ? mobileEl : null,
      });
    };

    updateContainers();
    const timer = setTimeout(updateContainers, 100);
    window.addEventListener('resize', updateContainers);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateContainers);
    };
  }, [filterButtonContainerId, filterButtonContainerIdMobile]);

  // AI分析結果をFirestoreに保存するコールバック
  const handleUpdateSession = (sessionId: string, aiAnalysis: string, recordCount: number) => {
    if (!onUpdate) return;

    onUpdate((currentData) => {
      const updatedSessions = currentData.tastingSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              aiAnalysis,
              aiAnalysisUpdatedAt: new Date().toISOString(),
              aiAnalysisRecordCount: recordCount,
            }
          : session
      );

      return {
        ...currentData,
        tastingSessions: updatedSessions,
      };
    });
  };

  const handleApplyFilters = (filters: {
    searchQuery: string;
    sortOption: 'newest' | 'oldest' | 'beanName';
    dateFrom: string;
    dateTo: string;
    selectedRoastLevels: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>;
  }) => {
    setSearchQuery(filters.searchQuery);
    setSortOption(filters.sortOption);
    setDateFrom(filters.dateFrom);
    setDateTo(filters.dateTo);
    setSelectedRoastLevels(filters.selectedRoastLevels);
  };

  const filterButton = (
    <Button
      variant="surface"
      onClick={() => setIsFilterModalOpen(true)}
      badge={activeFilterCount}
      isChristmasMode={isChristmasMode}
      title="フィルター"
      aria-label="フィルター"
      className="flex items-center gap-2"
    >
      <Faders
        size={20}
        weight={activeFilterCount > 0 ? 'fill' : 'bold'}
      />
      <span className="whitespace-nowrap">フィルター</span>
    </Button>
  );

  if (tastingSessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full rounded-[3rem] p-10 border shadow-sm text-center space-y-8 ${
            isChristmasMode
              ? 'bg-[#0a2f1a] border-[#d4af37]/30'
              : 'bg-white border-stone-100'
          }`}
        >
          <div className="relative mx-auto w-32 h-32">
            <div className={`absolute inset-0 rounded-full scale-110 blur-2xl opacity-60 ${
              isChristmasMode ? 'bg-[#d4af37]/20' : 'bg-amber-50'
            }`}></div>
            <div className={`relative w-full h-full rounded-full flex items-center justify-center border-2 shadow-inner ${
              isChristmasMode
                ? 'bg-[#0a2f1a] border-[#d4af37]/30'
                : 'bg-stone-50 border-white'
            }`}>
              <Coffee size={64} weight="duotone" className={isChristmasMode ? 'text-[#d4af37]/50' : 'text-amber-200'} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className={`text-2xl font-black tracking-tight ${
              isChristmasMode ? 'text-[#f8f1e7]' : 'text-stone-800'
            }`}>
              試飲セッションがありません
            </h3>
            <p className={`text-sm font-medium leading-relaxed ${
              isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-stone-400'
            }`}>
              最初の試飲セッションを作成して、
              <br />
              コーヒーの奥深い世界を記録しましょう。
            </p>
          </div>

          <Link
            href="/tasting/sessions/new"
            className={`inline-flex items-center gap-3 px-8 py-4 text-white rounded-2xl font-black text-lg transition-all active:scale-95 ${
              isChristmasMode
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b8962e] shadow-xl shadow-[#d4af37]/20 hover:from-[#c9a633] hover:to-[#a8872a]'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-xl shadow-amber-200 hover:from-amber-700 hover:to-amber-600'
            }`}
          >
            <Plus size={24} weight="bold" />
            <span>セッションを開始</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* フィルターボタンを外部コンテナにPortalでレンダリング */}
      {mounted && containers.desktop && createPortal(filterButton, containers.desktop)}
      {mounted && containers.mobile && createPortal(filterButton, containers.mobile)}

      <div className="h-full flex flex-col min-h-0">
        {/* フィルターモーダル */}
        <TastingSessionFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          searchQuery={searchQuery}
          sortOption={sortOption}
          dateFrom={dateFrom}
          dateTo={dateTo}
          selectedRoastLevels={selectedRoastLevels}
          onApply={handleApplyFilters}
          isChristmasMode={isChristmasMode}
        />

        <div className="flex-1 min-h-0 overflow-y-hidden pt-4 pb-8">
          <TastingSessionCarousel
            sessions={filteredAndSortedSessions}
            tastingRecords={tastingRecords}
            activeMemberCount={activeMemberCount}
            router={router}
            onUpdateSession={handleUpdateSession}
          />
        </div>
      </div>
    </>
  );
}

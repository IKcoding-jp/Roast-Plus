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
          className="max-w-md w-full rounded-[3rem] p-10 border border-edge shadow-card text-center space-y-8 bg-surface"
        >
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full scale-110 blur-2xl opacity-60 bg-spot-subtle"></div>
            <div className="relative w-full h-full rounded-full flex items-center justify-center border-2 shadow-inner bg-ground border-edge">
              <Coffee size={64} weight="duotone" className="text-spot opacity-50" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black tracking-tight text-ink">
              試飲セッションがありません
            </h3>
            <p className="text-sm font-medium leading-relaxed text-ink-muted">
              最初の試飲セッションを作成して、
              <br />
              コーヒーの奥深い世界を記録しましょう。
            </p>
          </div>

          <Link
            href="/tasting/sessions/new"
            className="inline-flex items-center gap-3 px-8 py-4 text-white rounded-2xl font-black text-lg transition-all active:scale-95 bg-gradient-to-r from-spot to-spot/80 shadow-xl shadow-spot/20 hover:from-spot/90 hover:to-spot/70"
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

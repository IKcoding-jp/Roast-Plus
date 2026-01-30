'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coffee,
  MagnifyingGlass,
  Plus,
  X,
  Faders,
  CalendarBlank,
  SortAscending,
  Thermometer
} from 'phosphor-react';
import type { AppData } from '@/types';
import { TastingSessionCarousel } from './TastingSessionCarousel';
import { useMembers, getActiveMembers } from '@/hooks/useMembers';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface TastingSessionListProps {
  data: AppData;
  onUpdate?: (newDataOrUpdater: AppData | ((currentData: AppData) => AppData)) => Promise<void> | void;
  filterButtonContainerId?: string;
  filterButtonContainerIdMobile?: string;
}

type SortOption = 'newest' | 'oldest' | 'beanName';

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

export function TastingSessionList({ data, onUpdate, filterButtonContainerId, filterButtonContainerIdMobile }: TastingSessionListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  // 担当表の /users/{userId}/members コレクションからメンバーと管理者を取得
  const { members: allMembers, manager } = useMembers(userId);

  const tastingSessions = useMemo(
    () => (Array.isArray(data.tastingSessions) ? data.tastingSessions : []),
    [data.tastingSessions]
  );
  const tastingRecords = useMemo(
    () => (Array.isArray(data.tastingRecords) ? data.tastingRecords : []),
    [data.tastingRecords]
  );
  // アクティブメンバー数 + 管理者（存在する場合）
  const activeMemberCount = getActiveMembers(allMembers).length + (manager ? 1 : 0);

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

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<
    Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>
  >([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ポータル先の要素を保持
  const [containers, setContainers] = useState<{
    desktop: HTMLElement | null;
    mobile: HTMLElement | null;
  }>({ desktop: null, mobile: null });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const updateContainers = () => {
      const desktopEl = filterButtonContainerId ? document.getElementById(filterButtonContainerId) : null;
      const mobileEl = filterButtonContainerIdMobile ? document.getElementById(filterButtonContainerIdMobile) : null;

      // コンテナが表示されている(0x0でない)場合のみ設定
      setContainers({
        desktop: desktopEl && desktopEl.getBoundingClientRect().width > 0 ? desktopEl : null,
        mobile: mobileEl && mobileEl.getBoundingClientRect().width > 0 ? mobileEl : null,
      });
    };

    updateContainers();
    // 念のため少し遅らせて実行（ハイドレーション対策）
    const timer = setTimeout(updateContainers, 100);

    // リサイズ時にも再チェック
    window.addEventListener('resize', updateContainers);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateContainers);
    };
  }, [filterButtonContainerId, filterButtonContainerIdMobile]);

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

  const filterButton = (
    <button
      onClick={handleOpenFilterModal}
      className={`px-4 py-2 rounded-2xl bg-white shadow-sm border transition-all hover:shadow-md hover:border-amber-200 flex items-center justify-center gap-2 min-h-[44px] relative group ${activeFilterCount > 0 ? 'text-amber-600 border-amber-200' : 'text-stone-500 border-stone-100'
        }`}
      title="フィルター"
      aria-label="フィルター"
    >
      <Faders size={20} weight={activeFilterCount > 0 ? "fill" : "bold"} className="group-hover:scale-110 transition-transform" />
      <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.15em]">フィルター</span>
      {activeFilterCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  if (tastingSessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-10 border border-stone-100 shadow-sm text-center space-y-8"
        >
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-amber-50 rounded-full scale-110 blur-2xl opacity-60"></div>
            <div className="relative w-full h-full rounded-full bg-stone-50 flex items-center justify-center border-2 border-white shadow-inner">
              <Coffee size={64} weight="duotone" className="text-amber-200" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-stone-800 tracking-tight">
              試飲セッションがありません
            </h3>
            <p className="text-stone-400 text-sm font-medium leading-relaxed">
              最初の試飲セッションを作成して、<br />
              コーヒーの奥深い世界を記録しましょう。
            </p>
          </div>

          <Link
            href="/tasting/sessions/new"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-200 hover:from-amber-700 hover:to-amber-600 transition-all active:scale-95"
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
      {mounted && containers.mobile && createPortal(
        <button
          onClick={handleOpenFilterModal}
          className={`px-4 py-2 rounded-2xl bg-white shadow-sm border transition-all hover:shadow-md hover:border-amber-200 flex items-center justify-center gap-2 min-h-[44px] relative group ${activeFilterCount > 0 ? 'text-amber-600 border-amber-200' : 'text-stone-500 border-stone-100'
            }`}
          title="フィルター"
          aria-label="フィルター"
        >
          <Faders size={20} weight={activeFilterCount > 0 ? "fill" : "bold"} className="group-hover:scale-110 transition-transform" />
          <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.15em]">フィルター</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white">
              {activeFilterCount}
            </span>
          )}
        </button>,
        containers.mobile
      )}

      <div className="h-full flex flex-col min-h-0">

        {/* フィルターモーダル */}
        <AnimatePresence>
          {isFilterModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseFilterModal}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-stone-100"
              >
                {/* ヘッダー */}
                <div className="p-8 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Faders size={24} weight="fill" className="text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-800 tracking-tight">フィルター設定</h2>
                  </div>
                  <button
                    onClick={handleCloseFilterModal}
                    className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400"
                    aria-label="閉じる"
                  >
                    <X size={24} weight="bold" />
                  </button>
                </div>

                {/* コンテンツ */}
                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8">
                  {/* 検索バー */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                      <MagnifyingGlass size={16} weight="bold" />
                      豆の名前で検索
                    </label>
                    <input
                      type="text"
                      value={tempSearchQuery}
                      onChange={(e) => setTempSearchQuery(e.target.value)}
                      placeholder="豆の名前を入力..."
                      className="w-full px-5 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold placeholder:text-stone-300"
                    />
                  </div>

                  {/* ソート */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                      <SortAscending size={16} weight="bold" />
                      並び替え
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'newest', label: '新しい順' },
                        { id: 'oldest', label: '古い順' },
                        { id: 'beanName', label: '豆の名前順' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setTempSortOption(opt.id as SortOption)}
                          className={`px-5 py-3.5 rounded-2xl text-left font-bold transition-all border-2 ${tempSortOption === opt.id
                              ? 'bg-amber-50 border-amber-500 text-amber-700'
                              : 'bg-stone-50 border-transparent text-stone-500 hover:bg-stone-100'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 日付範囲 */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                      <CalendarBlank size={16} weight="bold" />
                      日付範囲
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={tempDateFrom}
                        onChange={(e) => setTempDateFrom(e.target.value)}
                        className="px-4 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold text-sm"
                      />
                      <input
                        type="date"
                        value={tempDateTo}
                        onChange={(e) => setTempDateTo(e.target.value)}
                        className="px-4 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold text-sm"
                      />
                    </div>
                  </div>

                  {/* 焙煎度合い */}
                  <div className="space-y-3 pb-4">
                    <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                      <Thermometer size={16} weight="bold" />
                      焙煎度合い
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ROAST_LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => handleTempRoastLevelToggle(level)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${tempSelectedRoastLevels.includes(level)
                              ? 'bg-stone-800 border-stone-800 text-white'
                              : 'bg-stone-50 border-transparent text-stone-500 hover:bg-stone-100'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* フッター */}
                <div className="p-8 pt-4 bg-stone-50/50 flex flex-col gap-3">
                  {(tempSearchQuery.trim() || tempDateFrom || tempDateTo || tempSelectedRoastLevels.length > 0) && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-black text-amber-600 uppercase tracking-widest hover:underline mb-2 mx-auto"
                    >
                      フィルターをリセット
                    </button>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseFilterModal}
                      className="flex-1 px-6 py-4 bg-white border-2 border-stone-100 text-stone-400 rounded-2xl font-black transition-all hover:bg-stone-100"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 px-6 py-4 bg-stone-800 text-white rounded-2xl font-black transition-all hover:bg-stone-900 shadow-xl shadow-stone-200"
                    >
                      適用
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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

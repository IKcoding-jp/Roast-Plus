import { useRef, useEffect, useState, useMemo } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { TastingRecord, TastingSession } from '@/types';
import { calculateAverageScores, getRecordsBySessionId } from '@/lib/tastingUtils';
import { useTastingAIAnalysis } from '@/hooks/useTastingAIAnalysis';
import { TastingSessionCardDesktop } from './TastingSessionCardDesktop';
import { TastingSessionCardMobile } from './TastingSessionCardMobile';
import { useChristmasMode } from '@/hooks/useChristmasMode';

interface TastingSessionCarouselProps {
  sessions: TastingSession[];
  tastingRecords: TastingRecord[];
  activeMemberCount: number;
  router: AppRouterInstance;
  onUpdateSession?: (sessionId: string, aiAnalysis: string, recordCount: number) => void;
}

// 焙煎度に応じたバッジスタイル（焙煎色グラデーション）
const getRoastBadgeStyle = (level: string) => {
  switch (level) {
    case '浅煎り':
      return {
        bg: '#C8A882',
        text: '#3E2723',
        label: level,
      };
    case '中煎り':
      return {
        bg: '#A0826D',
        text: '#FFFFFF',
        label: level,
      };
    case '中深煎り':
      return {
        bg: '#6F4E37',
        text: '#FFFFFF',
        label: level,
      };
    case '深煎り':
      return {
        bg: '#3E2723',
        text: '#FFFFFF',
        label: level,
      };
    default:
      return {
        bg: '#8D6E63',
        text: '#FFFFFF',
        label: level,
      };
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

export function TastingSessionCarousel({
  sessions,
  tastingRecords,
  activeMemberCount,
  router,
  onUpdateSession,
}: TastingSessionCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { isChristmasMode } = useChristmasMode();

  // セッションカードの共通データを準備
  const sessionData = useMemo(
    () =>
      sessions.map((session) => {
        const sessionRecords = getRecordsBySessionId(tastingRecords, session.id);
        const recordCount = sessionRecords.length;
        const averageScores = calculateAverageScores(sessionRecords);
        const comments = sessionRecords
          .filter((record) => record.overallImpression && record.overallImpression.trim() !== '')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((record) => record.overallImpression!);

        return { session, sessionRecords, recordCount, averageScores, comments };
      }),
    [sessions, tastingRecords]
  );

  // AI分析を管理
  const { isAnalyzing } = useTastingAIAnalysis({
    sessions,
    sessionData,
    onUpdateSession,
  });

  // 横スクロールの追跡（モバイル用）
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (mediaQuery.matches) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [activeIndex]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`font-serif italic ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-stone-500'}`}>
          試飲セッションがありません
        </p>
      </div>
    );
  }

  return (
    <>
      {/* デスクトップ向けレイアウト (md以上で表示) */}
      <div className="hidden md:block w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          {sessionData.map(({ session, recordCount, averageScores, comments }) => (
            <TastingSessionCardDesktop
              key={session.id}
              session={session}
              recordCount={recordCount}
              averageScores={averageScores}
              comments={comments}
              activeMemberCount={activeMemberCount}
              isAnalyzing={!!isAnalyzing[session.id]}
              getRoastBadgeStyle={getRoastBadgeStyle}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>

      {/* モバイル向けレイアウト (md未満で表示) */}
      <div className="md:hidden relative w-full h-[calc(100vh-140px)] overflow-hidden flex flex-col">
        {/* 横スクロールコンテナ */}
        <div
          ref={scrollContainerRef}
          className={`flex flex-row gap-4 px-4 h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory
                     [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:mx-8 [&::-webkit-scrollbar-track]:rounded-full
                     [&::-webkit-scrollbar-thumb]:rounded-full ${
                       isChristmasMode
                         ? '[&::-webkit-scrollbar-track]:bg-[#d4af37]/20 [&::-webkit-scrollbar-thumb]:bg-[#d4af37]'
                         : '[&::-webkit-scrollbar-track]:bg-stone-200/50 [&::-webkit-scrollbar-thumb]:bg-[#8D6E63]'
                     }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sessionData.map(({ session, recordCount, averageScores, comments }) => (
            <TastingSessionCardMobile
              key={session.id}
              session={session}
              recordCount={recordCount}
              averageScores={averageScores}
              comments={comments}
              isAnalyzing={!!isAnalyzing[session.id]}
              getRoastBadgeStyle={getRoastBadgeStyle}
              formatDate={formatDate}
            />
          ))}
        </div>

        {/* ページインジケーター */}
        <div className="flex-shrink-0 flex justify-center gap-1.5 py-4">
          {sessionData.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? isChristmasMode ? 'bg-[#d4af37] scale-125' : 'bg-gray-700 scale-125'
                  : isChristmasMode ? 'bg-[#d4af37]/30' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

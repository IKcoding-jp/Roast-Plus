'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Coffee, 
  PencilSimple, 
  Quotes, 
  Users, 
  CalendarBlank,
  CaretRight
} from 'phosphor-react';
import { motion } from 'framer-motion';
import type { TastingRecord, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import {
  calculateAverageScores,
  getRecordsBySessionId,
} from '@/lib/tastingUtils';

interface TastingSessionCarouselProps {
  sessions: TastingSession[];
  tastingRecords: TastingRecord[];
  activeMemberCount: number;
  router: ReturnType<typeof useRouter>;
}

export function TastingSessionCarousel({
  sessions,
  tastingRecords,
  activeMemberCount,
  router,
}: TastingSessionCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">試飲セッションがありません</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* 横スクロール可能なグリッドレイアウト */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="inline-flex gap-6 pb-6 h-full items-stretch" style={{ minWidth: 'max-content' }}>
          {sessions.map((session, index) => {
            const sessionRecords = getRecordsBySessionId(
              tastingRecords,
              session.id
            );
            const recordCount = sessionRecords.length;
            const averageScores = calculateAverageScores(sessionRecords);
            const comments = sessionRecords
              .filter((record) => record.overallImpression && record.overallImpression.trim() !== '')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((record) => record.overallImpression!);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[85vw] sm:w-80 md:w-96 h-full"
              >
                <Link
                  href={`/tasting?sessionId=${session.id}`}
                  className="block h-full group"
                >
                  <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-500 flex flex-col h-full min-h-0 border border-stone-100 overflow-hidden relative">
                    {/* 装飾的な背景要素 */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <Coffee size={120} weight="fill" />
                    </div>

                    {/* ヘッダー部分 */}
                    <div className="p-6 pb-0 flex-shrink-0 z-10">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-2xl font-black text-stone-800 tracking-tight leading-tight">
                                {session.beanName}
                              </h3>
                              <span
                                className="px-2.5 py-0.5 text-white text-[10px] font-black rounded-md shadow-sm uppercase tracking-widest flex-shrink-0"
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
                            <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-black uppercase tracking-[0.15em]">
                              <CalendarBlank size={12} weight="bold" />
                              {formatDate(session.createdAt)}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/tasting?sessionId=${session.id}&edit=true`);
                            }}
                            className="p-2.5 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all border border-transparent hover:border-amber-100 flex-shrink-0"
                            aria-label="セッションを編集"
                          >
                            <PencilSimple size={20} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* レーダーチャートセクション - 高さを固定してサイズを一定に保つ */}
                    <div className="h-[280px] flex-shrink-0 flex items-center justify-center relative z-10 px-4">
                      {recordCount > 0 ? (
                        <div className="w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                          <TastingRadarChart
                            size={240}
                            record={{
                              bitterness: averageScores.bitterness,
                              acidity: averageScores.acidity,
                              body: averageScores.body,
                              sweetness: averageScores.sweetness,
                              aroma: averageScores.aroma,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-stone-50/50 rounded-[2rem] border-2 border-dashed border-stone-100">
                          <div className="p-4 bg-white rounded-2xl shadow-sm mb-3">
                            <Coffee size={32} weight="duotone" className="text-stone-300" />
                          </div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                            まだ記録がありません
                          </p>
                        </div>
                      )}
                    </div>

                    {/* みんなの感想セクション */}
                    <div className="flex-1 flex flex-col min-h-0 p-6 pt-0 z-10">
                      <div className="bg-stone-50 rounded-[2rem] p-5 flex flex-col flex-1 min-h-0 border border-stone-100/50">
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-stone-100">
                              <Quotes size={16} weight="fill" className="text-amber-600" />
                            </div>
                            <h4 className="text-sm font-black text-stone-700 tracking-tight">みんなの感想</h4>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-stone-100 shadow-sm">
                            <Users size={12} weight="bold" className="text-stone-400" />
                            <span className="text-[10px] font-black text-stone-600 tabular-nums">
                              {recordCount}/{activeMemberCount}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {comments.length > 0 ? (
                            <ul className="space-y-3">
                              {comments.map((comment, commentIndex) => (
                                <li key={commentIndex} className="text-xs text-stone-600 font-medium leading-relaxed flex gap-2">
                                  <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                  <span className="break-words">{comment}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex items-center justify-center h-full opacity-40">
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">感想がありません</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 詳細へボタン (Hover時のみ強調) */}
                    <div className="px-6 pb-6 flex justify-end">
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest group-hover:gap-2 transition-all duration-300">
                        詳細を見る <CaretRight size={12} weight="bold" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef, useEffect, useState } from 'react';
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
  const [isDesktop, setIsDesktop] = useState(false);
  const DESKTOP_CHART_SIZE = 280; // PC/タブレット向け固定サイズ
  const MOBILE_CHART_SIZE = 180;  // スマホ向けサイズ

  // 画面幅に応じてレイアウトモードを決定
  useEffect(() => {
    const updateLayout = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // 横スクロール用のホイールイベント（モバイルのみ）
  useEffect(() => {
    if (isDesktop) return;

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
  }, [isDesktop]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 font-serif italic">No tasting sessions yet.</p>
      </div>
    );
  }

  // セッションカードの共通データを準備
  const sessionData = sessions.map((session) => {
    const sessionRecords = getRecordsBySessionId(tastingRecords, session.id);
    const recordCount = sessionRecords.length;
    const averageScores = calculateAverageScores(sessionRecords);
    const comments = sessionRecords
      .filter((record) => record.overallImpression && record.overallImpression.trim() !== '')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((record) => record.overallImpression!);

    return { session, sessionRecords, recordCount, averageScores, comments };
  });

  // 焙煎度に応じたバッジスタイル
  const getRoastBadgeStyle = (level: string) => {
    switch (level) {
      case '深煎り': return { bg: '#2C1810', text: '#D7CCC8', label: 'Dark Roast' };
      case '中深煎り': return { bg: '#4E342E', text: '#EFEBE9', label: 'Medium-Dark' };
      case '中煎り': return { bg: '#795548', text: '#F5F5F5', label: 'Medium Roast' };
      case '浅煎り': return { bg: '#A1887F', text: '#FFFFFF', label: 'Light Roast' };
      default: return { bg: '#8D6E63', text: '#FFFFFF', label: level };
    }
  };

  // ========================================
  // デスクトップ向けレイアウト（横長カード・縦スクロール）
  // ========================================
  if (isDesktop) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          {sessionData.map(({ session, recordCount, averageScores, comments }, index) => {
            const roastStyle = getRoastBadgeStyle(session.roastLevel);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ease: "easeOut" }}
              >
                <Link
                  href={`/tasting?sessionId=${session.id}`}
                  className="block group relative"
                >
                  {/* カード本体：木目調背景 */}
                  <div
                    className="rounded-[4px] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative border border-[#3E2723]/30"
                    style={{
                      backgroundImage: 'url("/images/backgrounds/wood-texture.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* ダークオーバーレイ（文字を見やすくするため） */}
                    <div className="absolute inset-0 bg-[#1a0f0a]/30 mix-blend-multiply pointer-events-none" />

                    {/* カード内コンテンツラッパー */}
                    <div className="relative z-10 p-1">
                      {/* 紙のような質感の内側コンテナ */}
                      <div className="bg-[#FDFBF7] rounded-[2px] shadow-inner border border-[#D7CCC8]/50 h-full">

                        {/* ヘッダー部分 */}
                        <div className="px-8 pt-7 pb-5 border-b border-dashed border-[#8D6E63]/30 flex items-center justify-between bg-[#FFF8E1]/30">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-3xl font-serif font-black text-[#3E2723] tracking-tight leading-tight truncate drop-shadow-sm">
                                  {session.beanName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-current rounded-full"
                                    style={{
                                      color: roastStyle.bg,
                                      backgroundColor: 'transparent',
                                      borderColor: roastStyle.bg
                                    }}
                                  >
                                    {roastStyle.label}
                                  </span>
                                  {/* Original blend badge or similar (optional) */}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-[#5D4037] text-xs font-medium font-serif italic">
                                <CalendarBlank size={14} weight="fill" />
                                <span>{formatDate(session.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/tasting?sessionId=${session.id}&edit=true`);
                            }}
                            className="p-3 text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#D7CCC8]/20 rounded-full transition-all"
                            aria-label="セッションを編集"
                          >
                            <PencilSimple size={22} weight="duotone" />
                          </button>
                        </div>

                        {/* メインコンテンツ */}
                        <div className="flex items-stretch">
                          {/* みんなの感想（左）: ノート風デザイン */}
                          <div className="flex-1 p-8 border-r border-dashed border-[#8D6E63]/30 relative bg-[#fffdf5]">
                            {/* ノートの罫線装飾（CSSグラデーション） */}
                            <div
                              className="absolute inset-0 pointer-events-none opacity-10"
                              style={{ backgroundImage: 'linear-gradient(#8D6E63 1px, transparent 1px)', backgroundSize: '100% 2rem' }}
                            />

                            <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                  <Quotes size={24} weight="fill" className="text-[#8D6E63]" />
                                  <h4 className="text-base font-serif font-bold text-[#5D4037] tracking-wide">Tasting Notes</h4>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EFEBE9] rounded-full text-[#5D4037] text-xs font-bold shadow-sm z-20">
                                  <Users size={14} weight="fill" />
                                  <span>{recordCount} / {activeMemberCount}</span>
                                </div>
                              </div>

                              <div className="flex-1 min-h-[160px]">
                                {comments.length > 0 ? (
                                  <ul className="space-y-4">
                                    {comments.map((comment, commentIndex) => (
                                      <li key={commentIndex} className="text-[#4E342E] font-medium leading-relaxed relative pl-4 border-l-2 border-[#D7CCC8]">
                                        <span className="text-sm font-serif italic block">"{comment}"</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-4">
                                    <p className="text-xs font-serif italic text-[#8D6E63]">Waiting for impressions...</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* レーダーチャート（右）: クラフト紙風背景 */}
                          <div className="w-[340px] flex-shrink-0 p-6 flex items-center justify-center bg-[#f5f5f5] relative overflow-hidden">
                            {/* コーヒー染みのような装飾があれば良いが、今回はシンプルに */}
                            {recordCount > 0 ? (
                              <div className="transform group-hover:scale-105 transition-transform duration-700 ease-out">
                                <TastingRadarChart
                                  size={DESKTOP_CHART_SIZE}
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
                              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-[#D7CCC8] rounded-xl p-8 opacity-60">
                                <Coffee size={40} weight="thin" className="text-[#8D6E63] mb-3" />
                                <p className="text-xs font-serif font-bold text-[#8D6E63] tracking-widest text-center">NO DATA</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* フッター: 詳細リンク */}
                        <div className="px-8 py-4 bg-[#F5F5F5] border-t border-dashed border-[#8D6E63]/30 flex justify-between items-center">
                          <div className="text-[10px] text-[#A1887F] font-serif italic tracking-wider">
                            RoastPlus Original Blend Record
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#5D4037] uppercase tracking-widest group-hover:text-[#3E2723] group-hover:translate-x-1 transition-all duration-300 cursor-pointer">
                            View Details <CaretRight size={14} weight="bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ========================================
  // モバイル向けレイアウト（洗練されたカルーセル）
  // ========================================
  return (
    <div className="relative w-full h-full py-4">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="inline-flex gap-5 pb-6 h-full items-stretch" style={{ minWidth: 'max-content' }}>
          {sessionData.map(({ session, recordCount, averageScores, comments }, index) => {
            const roastStyle = getRoastBadgeStyle(session.roastLevel);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[85vw] sm:w-80 h-full"
              >
                <Link
                  href={`/tasting?sessionId=${session.id}`}
                  className="block h-full group"
                >
                  {/* モバイルカード: 木目背景 */}
                  <div
                    className="rounded-[4px] shadow-lg flex flex-col h-full min-h-[600px] overflow-hidden relative border border-[#3E2723]/20"
                    style={{
                      backgroundImage: 'url("/images/backgrounds/wood-texture.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* ダークオーバーレイ */}
                    <div className="absolute inset-0 bg-[#1a0f0a]/30 mix-blend-multiply pointer-events-none" />

                    {/* コンテンツコンテナ（紙風） */}
                    <div className="relative z-10 p-1 flex flex-col h-full">
                      <div className="bg-[#FDFBF7] rounded-[2px] shadow-inner border border-[#D7CCC8]/50 flex flex-col h-full">

                        {/* ヘッダー */}
                        <div className="p-6 pb-4 border-b border-dashed border-[#8D6E63]/30 bg-[#FFF8E1]/30">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-serif font-black text-[#3E2723] tracking-tight leading-tight mb-2">
                                {session.beanName}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-current rounded-full"
                                  style={{
                                    color: roastStyle.bg,
                                    borderColor: roastStyle.bg
                                  }}
                                >
                                  {roastStyle.label}
                                </span>
                                <div className="text-[#8D6E63] text-[10px] font-medium flex items-center gap-1">
                                  <CalendarBlank size={12} weight="fill" />
                                  {formatDate(session.createdAt)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/tasting?sessionId=${session.id}&edit=true`);
                              }}
                              className="p-2 text-[#8D6E63] hover:bg-[#D7CCC8]/20 rounded-full"
                            >
                              <PencilSimple size={20} weight="duotone" />
                            </button>
                          </div>
                        </div>

                        {/* チャート */}
                        <div className="h-[220px] sm:h-[240px] flex-shrink-0 flex items-center justify-center relative bg-[#fffdf5]">
                          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#8D6E63 1px, transparent 1px)', backgroundSize: '1rem 1rem' }} />
                          {recordCount > 0 ? (
                            <div className="transform scale-95">
                              <TastingRadarChart
                                size={MOBILE_CHART_SIZE}
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
                            <div className="flex flex-col items-center justify-center opacity-40">
                              <Coffee size={32} weight="thin" className="text-[#8D6E63] mb-2" />
                              <p className="text-[10px] font-serif text-[#8D6E63]">NO DATA</p>
                            </div>
                          )}
                        </div>

                        {/* 感想 */}
                        <div className="flex-1 flex flex-col min-h-0 p-5 pt-0 bg-[#fffdf5]">
                          <div className="border-t-2 border-[#D7CCC8] pt-4 flex flex-col flex-1 h-full min-h-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Quotes size={16} weight="fill" className="text-[#8D6E63]" />
                                <h4 className="text-sm font-serif font-bold text-[#5D4037]">Notes</h4>
                              </div>
                              <span className="text-[10px] font-bold text-[#A1887F]">{recordCount} records</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] [&::-webkit-scrollbar-thumb]:rounded-full">
                              {comments.length > 0 ? (
                                <ul className="space-y-3">
                                  {comments.map((comment, commentIndex) => (
                                    <li key={commentIndex} className="text-sm text-[#4E342E] leading-relaxed pl-3 border-l-2 border-[#A1887F]/30 font-serif italic">
                                      {comment}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="flex items-center justify-center h-full opacity-40">
                                  <p className="text-[10px] font-serif text-[#8D6E63]">No impressions yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* フッター */}
                        <div className="p-4 bg-[#F5F5F5] border-t border-dashed border-[#8D6E63]/30 flex justify-end">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#5D4037] uppercase tracking-widest">
                            Details <CaretRight size={12} weight="bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

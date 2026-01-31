import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coffee,
  PencilSimple,
  Quotes,
  Users,
  CalendarBlank,
  CaretRight,
  Notepad
} from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TastingRecord, TastingSession } from '@/types';
import {
  calculateAverageScores,
  getRecordsBySessionId,
} from '@/lib/tastingUtils';
import { analyzeTastingSession } from '@/lib/tastingAnalysis';
import type { AverageScores } from '@/lib/tastingUtils';

interface TastingSessionCarouselProps {
  sessions: TastingSession[];
  tastingRecords: TastingRecord[];
  activeMemberCount: number;
  router: ReturnType<typeof useRouter>;
  onUpdateSession?: (sessionId: string, aiAnalysis: string, recordCount: number) => void;
}

export function TastingSessionCarousel({
  sessions,
  tastingRecords,
  activeMemberCount,
  router,
  onUpdateSession,
}: TastingSessionCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // isDesktop 状態を削除 - CSSメディアクエリで対応

  // AI分析の状態管理
  const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>({});
  // 分析済みIDを追跡（重複実行防止）
  const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());
  // AI分析モーダル用の状態
  const [aiModalSession, setAiModalSession] = useState<TastingSession | null>(null);
  // アクティブなカードのインデックス（モバイル用）
  const [activeIndex, setActiveIndex] = useState(0);

  // 自動分析を実行する関数
  const triggerAutoAnalysis = useCallback(async (session: TastingSession, comments: string[], averageScores: AverageScores, recordCount: number) => {
    // 分析中の場合はスキップ
    if (isAnalyzing[session.id] || analyzedIds.has(session.id)) return;

    setIsAnalyzing(prev => ({ ...prev, [session.id]: true }));
    setAnalyzedIds(prev => new Set(prev).add(session.id));

    const result = await analyzeTastingSession({
      beanName: session.beanName,
      roastLevel: session.roastLevel,
      comments,
      averageScores,
    });

    if (result.status === 'success' && result.text && onUpdateSession) {
      onUpdateSession(session.id, result.text, recordCount);
    }

    setIsAnalyzing(prev => ({ ...prev, [session.id]: false }));
  }, [isAnalyzing, analyzedIds, onUpdateSession]);

  // 横スクロールの追跡とホイールイベント（モバイル用）
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // md以上（768px以上）ではスクロール処理を無効化
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // セッションカードの共通データを準備（Hooksは条件分岐の前に配置）
  const sessionData = useMemo(() => sessions.map((session) => {
    const sessionRecords = getRecordsBySessionId(tastingRecords, session.id);
    const recordCount = sessionRecords.length;
    const averageScores = calculateAverageScores(sessionRecords);
    const comments = sessionRecords
      .filter((record) => record.overallImpression && record.overallImpression.trim() !== '')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((record) => record.overallImpression!);

    return { session, sessionRecords, recordCount, averageScores, comments };
  }), [sessions, tastingRecords]);

  // 自動分析をトリガーするuseEffect（Hooksは条件分岐の前に配置）
  useEffect(() => {
    if (!onUpdateSession || sessions.length === 0) return;

    sessionData.forEach(({ session, recordCount, averageScores, comments }) => {
      // 記録があり、未分析または記録数が変わった場合は自動分析を開始
      const needsReanalysis = recordCount > 0 && (
        !session.aiAnalysis ||                                    // 未分析
        session.aiAnalysisRecordCount !== recordCount             // 記録数が変わった
      );

      if (needsReanalysis && !isAnalyzing[session.id] && !analyzedIds.has(session.id)) {
        triggerAutoAnalysis(session, comments, averageScores, recordCount);
      }
    });
  }, [sessionData, onUpdateSession, isAnalyzing, analyzedIds, triggerAutoAnalysis, sessions.length]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 font-serif italic">試飲セッションがありません</p>
      </div>
    );
  }

  // 焙煎度に応じたバッジスタイル（Stitchデザイン対応）
  const getRoastBadgeStyle = (level: string) => {
    switch (level) {
      case '深煎り': return { bg: '#7C3A2D', text: '#FFFFFF', label: '深煎り' };
      case '中深煎り': return { bg: '#A0522D', text: '#FFFFFF', label: '中深煎り' };
      case '中煎り': return { bg: '#CD853F', text: '#1F2A44', label: '中煎り' };
      case '浅煎り': return { bg: '#DEB887', text: '#1F2A44', label: '浅煎り' };
      default: return { bg: '#d47311', text: '#FFFFFF', label: level };
    }
  };

  // ========================================
  // 両レイアウトを同時にレンダリングし、CSSメディアクエリで表示切り替え
  // これによりSSR時のハイドレーションミスマッチとレイアウトシフトを防止
  // ========================================
  return (
    <>
      {/* ========================================
          デスクトップ向けレイアウト (md以上で表示)
          ======================================== */}
      <div className="hidden md:block w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          {sessionData.map(({ session, recordCount, averageScores, comments }) => {
            const roastStyle = getRoastBadgeStyle(session.roastLevel);
            const hasAnalysis = !!session.aiAnalysis;
            const analyzing = !!isAnalyzing[session.id];

            return (
              <div key={session.id}>
                <Link
                  href={`/tasting?sessionId=${session.id}`}
                  className="block group relative"
                >
                  {/* カード本体 (Stitchデザイン) */}
                  <div
                    className="rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative border border-[#d47311]/20 bg-gradient-to-br from-white via-white to-amber-50/30"
                  >
                    {/* グラデーションアクセント */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d47311]/60 via-amber-500/60 to-[#d47311]/60"></div>

                    <div className="relative z-10">
                      <div className="h-full flex flex-col">

                        {/* ヘッダー (Stitchデザイン) */}
                        <div className="px-8 pt-7 pb-5 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-transparent">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-3xl font-bold text-[#1F2A44] tracking-tight leading-tight truncate" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                                  {session.beanName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm"
                                    style={{
                                      color: roastStyle.text,
                                      backgroundColor: roastStyle.bg,
                                      fontFamily: 'Epilogue, sans-serif'
                                    }}
                                  >
                                    {roastStyle.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/tasting?sessionId=${session.id}&edit=true`);
                            }}
                            className="p-3 text-stone-500 hover:text-[#d47311] hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <PencilSimple size={22} weight="duotone" />
                          </button>
                        </div>

                        {/* メインコンテンツ (Flex Row) - Stitchデザイン */}
                        <div className="flex items-stretch border-b border-stone-200">
                          {/* 感想 (左) */}
                          <div className="flex-1 p-8 border-r border-stone-200 relative bg-white">
                            <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-amber-100 rounded-xl">
                                    <Quotes size={20} weight="fill" className="text-[#d47311]" />
                                  </div>
                                  <h4 className="text-base font-bold text-[#1F2A44] tracking-wide" style={{ fontFamily: 'Epilogue, sans-serif' }}>感想</h4>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl text-[#d47311] text-xs font-bold shadow-sm z-20">
                                  <Users size={14} weight="fill" />
                                  <span style={{ fontFamily: 'Epilogue, sans-serif' }}>{recordCount} / {activeMemberCount}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-h-[160px] max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-track]:rounded-full">
                                {comments.length > 0 ? (
                                  <ul className="space-y-4">
                                    {comments.map((comment, commentIndex) => (
                                      <li key={commentIndex} className="text-[#4a3728] font-medium leading-relaxed relative pl-4 border-l-3 border-l-[3px] border-amber-300 bg-gradient-to-r from-amber-50/30 to-transparent p-3 rounded-r-lg">
                                        <span className="text-sm block" style={{ fontFamily: 'Epilogue, sans-serif' }}>&ldquo;{comment}&rdquo;</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-4">
                                    <Coffee size={40} weight="thin" className="text-amber-300 mb-2" />
                                    <p className="text-xs text-stone-400" style={{ fontFamily: 'Epilogue, sans-serif' }}>まだ感想がありません...</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* チャート (右) - Stitchデザイン */}
                          <div className="w-[340px] flex-shrink-0 p-8 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-amber-50/30 to-white">
                            {recordCount > 0 ? (
                              <div className="space-y-5 w-full relative z-10">
                                {[
                                  { label: '苦味', value: averageScores.bitterness, color: '#6B5B3E' },
                                  { label: '酸味', value: averageScores.acidity, color: '#f5821f' },
                                  { label: 'ボディ', value: averageScores.body, color: '#A0522D' },
                                  { label: '甘み', value: averageScores.sweetness, color: '#d47311' },
                                  { label: '香り', value: averageScores.aroma, color: '#CD853F' },
                                ].map((item) => (
                                  <div key={item.label} className="group/bar">
                                    <div className="flex justify-between items-center mb-2 px-0.5">
                                      <span className="text-sm font-bold text-[#1F2A44] tracking-wide" style={{ fontFamily: 'Epilogue, sans-serif' }}>{item.label}</span>
                                      <span className="text-sm font-black text-[#d47311]" style={{ fontFamily: 'Epilogue, sans-serif' }}>{item.value.toFixed(1)}</span>
                                    </div>
                                    <div className="h-3 bg-stone-100 rounded-xl overflow-hidden shadow-sm border border-stone-200">
                                      <div
                                        className="h-full rounded-xl shadow-sm transition-all duration-700 group-hover/bar:brightness-110"
                                        style={{
                                          width: `${((item.value - 1) / 4) * 100}%`,
                                          backgroundColor: item.color
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-amber-200 rounded-xl p-8 opacity-60 bg-white/50 backdrop-blur-sm">
                                <Coffee size={40} weight="thin" className="text-amber-300 mb-3" />
                                <p className="text-xs font-bold text-stone-400 tracking-widest text-center" style={{ fontFamily: 'Epilogue, sans-serif' }}>データなし</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI分析レポート (下) - Stitchデザイン */}
                        <div className="p-8 bg-gradient-to-br from-white to-amber-50/20 relative min-h-[120px] transition-all duration-500">
                          <div className="relative z-10">
                            {!hasAnalysis && !analyzing && recordCount === 0 && (
                              <div className="flex items-center justify-center py-2">
                                <p className="text-xs text-stone-400" style={{ fontFamily: 'Epilogue, sans-serif' }}>記録が追加されるとAI分析が開始されます</p>
                              </div>
                            )}

                            {analyzing && (
                              <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d47311]"></div>
                                <p className="text-xs text-stone-500 animate-pulse" style={{ fontFamily: 'Epilogue, sans-serif' }}>コーヒーの香りを分析中...</p>
                              </div>
                            )}

                            {hasAnalysis && (
                              <div className="bg-white/80 p-6 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden backdrop-blur-sm">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d47311] to-amber-400"></div>
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="p-2 bg-amber-100 rounded-lg">
                                    <Notepad size={18} weight="fill" className="text-[#d47311]" />
                                  </div>
                                  <h4 className="text-sm font-bold text-[#1F2A44]" style={{ fontFamily: 'Epilogue, sans-serif' }}>AIコーヒーマイスターのコメント</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-[#4a3728] whitespace-pre-wrap" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                                  {session.aiAnalysis}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* フッター - Stitchデザイン */}
                        <div className="px-8 py-4 bg-stone-50/50 border-t border-stone-200 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-stone-400 text-xs tracking-wider" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                            <CalendarBlank size={14} weight="fill" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#d47311] uppercase tracking-widest group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300 cursor-pointer" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                            詳細を見る <CaretRight size={14} weight="bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================
          モバイル向けレイアウト (md未満で表示)
          ======================================== */}
      <div className="md:hidden relative w-full h-[calc(100vh-140px)] overflow-hidden flex flex-col">
        {/* 横スクロールコンテナ */}
        <div
          ref={scrollContainerRef}
          className="flex flex-row gap-4 px-4 h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory
                     [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-stone-200/50 [&::-webkit-scrollbar-track]:mx-8 [&::-webkit-scrollbar-track]:rounded-full
                     [&::-webkit-scrollbar-thumb]:bg-[#8D6E63] [&::-webkit-scrollbar-thumb]:rounded-full"
          style={{
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {sessionData.map(({ session, recordCount, averageScores, comments }) => {
            const hasAnalysis = !!session.aiAnalysis;
            const analyzing = !!isAnalyzing[session.id];

            return (
              <div
                key={session.id}
                className="flex-shrink-0 w-[calc(100vw-2rem)] h-full snap-center"
              >
                <Link
                  href={`/tasting?sessionId=${session.id}`}
                  className="block h-full"
                >
                  <div
                    className="rounded-xl shadow-lg flex flex-col h-full overflow-hidden relative border border-[#d47311]/20 bg-gradient-to-br from-white via-white to-amber-50/30"
                  >
                    {/* グラデーションアクセント */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d47311]/60 via-amber-500/60 to-[#d47311]/60"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex flex-col h-full">

                        {/* ヘッダー（タイトル） - Stitchデザイン */}
                        <div className="flex-shrink-0 p-5 pb-4 border-b border-stone-200 bg-gradient-to-r from-amber-50/50 to-transparent">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl">
                              <Coffee size={24} weight="fill" className="text-[#d47311]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-[#1F2A44] tracking-tight leading-tight truncate" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                                {session.beanName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm"
                                  style={{
                                    color: getRoastBadgeStyle(session.roastLevel).text,
                                    backgroundColor: getRoastBadgeStyle(session.roastLevel).bg,
                                    fontFamily: 'Epilogue, sans-serif'
                                  }}
                                >
                                  {session.roastLevel}
                                </span>
                                <span className="text-[10px] text-stone-400 font-medium" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                                  {formatDate(session.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 横バーチャート（スコア表示） - Stitchデザイン */}
                        {recordCount > 0 && (
                          <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-br from-amber-50/30 to-white border-b border-stone-200">
                            <div className="space-y-2.5">
                              {[
                                { label: '苦味', value: averageScores.bitterness, color: '#6B5B3E' },
                                { label: '酸味', value: averageScores.acidity, color: '#f5821f' },
                                { label: 'ボディ', value: averageScores.body, color: '#A0522D' },
                                { label: '甘み', value: averageScores.sweetness, color: '#d47311' },
                                { label: '香り', value: averageScores.aroma, color: '#CD853F' },
                              ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#1F2A44] w-10 flex-shrink-0" style={{ fontFamily: 'Epilogue, sans-serif' }}>{item.label}</span>
                                  <div className="flex-1 h-2.5 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                                    <div
                                      className="h-full rounded-xl transition-all duration-500"
                                      style={{
                                        width: `${((item.value - 1) / 4) * 100}%`,
                                        backgroundColor: item.color
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-[#d47311] w-6 text-right" style={{ fontFamily: 'Epilogue, sans-serif' }}>{item.value.toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 感想 + AIコメント - Stitchデザイン */}
                        <div className="flex-1 flex flex-col min-h-0 p-4 bg-white">
                          {/* 感想セクション */}
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-amber-100 rounded-lg">
                                <Quotes size={14} weight="fill" className="text-[#d47311]" />
                              </div>
                              <h4 className="text-sm font-bold text-[#1F2A44]" style={{ fontFamily: 'Epilogue, sans-serif' }}>感想</h4>
                              <span className="text-[10px] font-bold text-stone-400 ml-auto" style={{ fontFamily: 'Epilogue, sans-serif' }}>{recordCount}件の記録</span>
                            </div>

                            <div className="h-[calc(100%-28px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-track]:rounded-full">
                              {comments.length > 0 ? (
                                <ul className="space-y-3">
                                  {comments.map((comment, commentIndex) => (
                                    <li key={commentIndex} className="text-sm text-[#4a3728] leading-relaxed pl-3 border-l-[3px] border-amber-300 bg-gradient-to-r from-amber-50/30 to-transparent p-2 rounded-r-lg" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                                      {comment}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                  <Coffee size={32} weight="thin" className="text-amber-300 mb-2" />
                                  <p className="text-xs text-stone-400" style={{ fontFamily: 'Epilogue, sans-serif' }}>まだ感想がありません</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* AI分析ボタン - Stitchデザイン */}
                          <div className="flex-shrink-0 border-t border-stone-200 pt-3 mt-3">
                            {!hasAnalysis && !analyzing && recordCount === 0 && (
                              <p className="text-center text-xs text-stone-400 py-2" style={{ fontFamily: 'Epilogue, sans-serif' }}>記録が追加されるとAI分析が開始されます</p>
                            )}

                            {analyzing && (
                              <div className="flex items-center justify-center gap-2 py-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#d47311]"></div>
                                <span className="text-xs text-stone-500" style={{ fontFamily: 'Epilogue, sans-serif' }}>分析中...</span>
                              </div>
                            )}

                            {hasAnalysis && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setAiModalSession(session);
                                }}
                                className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-amber-50 to-white p-3 rounded-xl border border-amber-200 hover:from-amber-100 hover:to-amber-50 transition-all active:scale-[0.98] shadow-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-amber-100 rounded-lg">
                                    <Notepad size={14} weight="fill" className="text-[#d47311]" />
                                  </div>
                                  <span className="text-xs font-bold text-[#1F2A44]" style={{ fontFamily: 'Epilogue, sans-serif' }}>AIコーヒーマイスター</span>
                                </div>
                                <CaretRight size={16} weight="bold" className="text-[#d47311]" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* ページインジケーター - Stitchデザイン */}
        <div className="flex-shrink-0 flex justify-center gap-2 py-4">
          {sessionData.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-[#d47311] w-6 scale-110' : 'bg-stone-300 w-1.5'
                }`}
            />
          ))}
        </div>

        {/* AI分析モーダル - Stitchデザイン */}
        <AnimatePresence>
          {aiModalSession && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAiModalSession(null)}
                className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="relative bg-gradient-to-br from-white to-amber-50/30 rounded-t-[2rem] shadow-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-t-4 border-[#d47311]"
              >
                {/* ハンドル */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-stone-300 rounded-full" />
                </div>

                {/* ヘッダー */}
                <div className="px-6 pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Notepad size={24} weight="fill" className="text-[#d47311]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2A44]" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                        AIコーヒーマイスター
                      </h3>
                      <p className="text-xs text-stone-500" style={{ fontFamily: 'Epilogue, sans-serif' }}>{aiModalSession.beanName}</p>
                    </div>
                  </div>
                </div>

                {/* コンテンツ */}
                <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-track]:rounded-full">
                  <p className="text-sm leading-relaxed text-[#4a3728] whitespace-pre-wrap" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                    {aiModalSession.aiAnalysis}
                  </p>
                </div>

                {/* 閉じるボタン */}
                <div className="p-4 border-t border-stone-200 bg-white/80">
                  <button
                    onClick={() => setAiModalSession(null)}
                    className="w-full py-3 bg-gradient-to-r from-[#d47311] to-amber-600 text-white rounded-xl font-bold text-sm hover:from-amber-600 hover:to-[#d47311] transition-all active:scale-[0.98] shadow-lg"
                    style={{ fontFamily: 'Epilogue, sans-serif' }}
                  >
                    閉じる
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

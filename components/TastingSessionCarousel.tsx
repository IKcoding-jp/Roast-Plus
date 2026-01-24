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
  const [isDesktop, setIsDesktop] = useState(false);

  // AI分析の状態管理
  const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>({});
  // 分析済みIDを追跡（重複実行防止）
  const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());
  // AI分析モーダル用の状態
  const [aiModalSession, setAiModalSession] = useState<TastingSession | null>(null);
  // アクティブなカードのインデックス
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

  // ... (既存のuseEffectなどはそのまま) ...

  // 画面幅に応じてレイアウトモードを決定
  useEffect(() => {
    const updateLayout = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // 横スクロールの追跡とホイールイベント
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isDesktop) return;

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
  }, [isDesktop, activeIndex]);

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

  // 焙煎度に応じたバッジスタイル
  const getRoastBadgeStyle = (level: string) => {
    switch (level) {
      case '深煎り': return { bg: '#2C1810', text: '#D7CCC8', label: '深煎り' };
      case '中深煎り': return { bg: '#4E342E', text: '#EFEBE9', label: '中深煎り' };
      case '中煎り': return { bg: '#795548', text: '#F5F5F5', label: '中煎り' };
      case '浅煎り': return { bg: '#A1887F', text: '#FFFFFF', label: '浅煎り' };
      default: return { bg: '#8D6E63', text: '#FFFFFF', label: level };
    }
  };

  // ========================================
  // デスクトップ向けレイアウト
  // ========================================
  if (isDesktop) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          {sessionData.map(({ session, recordCount, averageScores, comments }, index) => {
            const roastStyle = getRoastBadgeStyle(session.roastLevel);
            const hasAnalysis = !!session.aiAnalysis;
            const analyzing = !!isAnalyzing[session.id];

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
                  {/* カード本体 */}
                  <div
                    className="rounded-[4px] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative border border-[#3E2723]/30"
                    style={{
                      backgroundImage: 'url("/images/backgrounds/wood-texture.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-[#1a0f0a]/30 mix-blend-multiply pointer-events-none" />

                    <div className="relative z-10 p-1">
                      <div className="bg-[#FDFBF7] rounded-[2px] shadow-inner border border-[#D7CCC8]/50 h-full flex flex-col">

                        {/* ヘッダー */}
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
                            className="p-3 text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#D7CCC8]/20 rounded-full transition-all"
                          >
                            <PencilSimple size={22} weight="duotone" />
                          </button>
                        </div>

                        {/* メインコンテンツ (Flex Row) */}
                        <div className="flex items-stretch border-b border-dashed border-[#8D6E63]/30">
                          {/* 感想 (左) */}
                          <div className="flex-1 p-8 border-r border-dashed border-[#8D6E63]/30 relative bg-[#fffdf5]">
                            <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                  <Quotes size={24} weight="fill" className="text-[#8D6E63]" />
                                  <h4 className="text-base font-serif font-bold text-[#5D4037] tracking-wider">感想</h4>
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
                                        <span className="text-sm font-serif italic block">&ldquo;{comment}&rdquo;</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-4">
                                    <p className="text-xs font-serif italic text-[#8D6E63]">まだ感想がありません...</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* チャート (右) */}
                          <div className="w-[340px] flex-shrink-0 p-8 flex flex-col justify-center relative overflow-hidden bg-[#fffdf5]">
                            {/* 紙の質感（粒状ノイズ） */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-stone-900 mix-blend-overlay" />

                            {recordCount > 0 ? (
                              <div className="space-y-4 w-full relative z-10">
                                {[
                                  { label: '苦味', value: averageScores.bitterness, color: '#44403C' },
                                  { label: '酸味', value: averageScores.acidity, color: '#EA580C' },
                                  { label: 'ボディ', value: averageScores.body, color: '#92400E' },
                                  { label: '甘み', value: averageScores.sweetness, color: '#E11D48' },
                                  { label: '香り', value: averageScores.aroma, color: '#059669' },
                                ].map((item) => (
                                  <div key={item.label} className="group/bar">
                                    <div className="flex justify-between items-center mb-1.5 px-0.5">
                                      <span className="text-xs font-serif font-black text-[#5D4037] tracking-wider">{item.label}</span>
                                      <span className="text-xs font-black text-[#8D6E63]">{item.value.toFixed(1)}</span>
                                    </div>
                                    <div className="h-2.5 bg-[#EFEBE9] rounded-full overflow-hidden shadow-inner border border-[#D7CCC8]/30">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${((item.value - 1) / 4) * 100}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className="h-full rounded-full shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-[#D7CCC8] rounded-xl p-8 opacity-60 bg-[#fffdf5]/50 backdrop-blur-sm">
                                <Coffee size={40} weight="thin" className="text-[#8D6E63] mb-3" />
                                <p className="text-xs font-serif font-bold text-[#8D6E63] tracking-widest text-center">データなし</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI分析レポート (下) */}
                        <div className="p-8 bg-[#FDFBF7] relative min-h-[120px] transition-all duration-500">
                          {/* 和紙風のテクスチャ */}
                          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")' }}></div>

                          <div className="relative z-10">
                            {!hasAnalysis && !analyzing && recordCount === 0 && (
                              <div className="flex items-center justify-center py-2">
                                <p className="text-xs font-serif text-[#8D6E63] italic">記録が追加されるとAI分析が開始されます</p>
                              </div>
                            )}

                            {analyzing && (
                              <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D4037]"></div>
                                <p className="text-xs font-serif text-[#8D6E63] animate-pulse">コーヒーの香りを分析中...</p>
                              </div>
                            )}

                            {hasAnalysis && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-white/60 p-6 rounded-sm border border-[#D7CCC8] shadow-sm relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#D7CCC8]/30"></div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Notepad size={20} weight="duotone" className="text-[#8D6E63]" />
                                  <h4 className="text-sm font-serif font-bold text-[#5D4037]">AIコーヒーマイスターのコメント</h4>
                                </div>
                                <p className="text-sm font-serif leading-loose text-[#4E342E] whitespace-pre-wrap">
                                  {session.aiAnalysis}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* フッター */}
                        <div className="px-8 py-4 bg-[#F5F5F5] border-t border-dashed border-[#8D6E63]/30 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[#A1887F] text-xs font-serif italic tracking-wider">
                            <CalendarBlank size={14} weight="fill" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#5D4037] uppercase tracking-widest group-hover:text-[#3E2723] group-hover:translate-x-1 transition-all duration-300 cursor-pointer">
                            詳細を見る <CaretRight size={14} weight="bold" />
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
  // モバイル向けレイアウト（横スクロールカルーセル）
  // ========================================
  return (
    <div className="relative w-full h-[calc(100vh-140px)] overflow-hidden flex flex-col">
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
        {sessionData.map(({ session, recordCount, averageScores, comments }, index) => {
          const hasAnalysis = !!session.aiAnalysis;
          const analyzing = !!isAnalyzing[session.id];

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[calc(100vw-2rem)] h-full snap-center"
            >
              <Link
                href={`/tasting?sessionId=${session.id}`}
                className="block h-full"
              >
                <div
                  className="rounded-[4px] shadow-lg flex flex-col h-full overflow-hidden relative border border-[#3E2723]/20"
                  style={{
                    backgroundImage: 'url("/images/backgrounds/wood-texture.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-[#1a0f0a]/30 mix-blend-multiply pointer-events-none" />

                  <div className="relative z-10 p-1 flex flex-col h-full">
                    <div className="bg-[#FDFBF7] rounded-[2px] shadow-inner border border-[#D7CCC8]/50 flex flex-col h-full">

                      {/* ヘッダー（タイトル） */}
                      <div className="flex-shrink-0 p-5 pb-4 border-b border-dashed border-[#8D6E63]/30 bg-[#FFF8E1]/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-xl">
                            <Coffee size={24} weight="fill" className="text-amber-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-serif font-black text-[#3E2723] tracking-tight leading-tight truncate">
                              {session.beanName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-current rounded-full"
                                style={{
                                  color: getRoastBadgeStyle(session.roastLevel).bg,
                                  borderColor: getRoastBadgeStyle(session.roastLevel).bg
                                }}
                              >
                                {session.roastLevel}
                              </span>
                              <span className="text-[10px] text-[#A1887F] font-medium">
                                {formatDate(session.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 横バーチャート（スコア表示） */}
                      {recordCount > 0 && (
                        <div className="flex-shrink-0 px-4 py-3 bg-[#fffdf5] border-b border-dashed border-[#8D6E63]/20">
                          <div className="space-y-2">
                            {[
                              { label: '苦味', value: averageScores.bitterness, color: '#44403C' },
                              { label: '酸味', value: averageScores.acidity, color: '#EA580C' },
                              { label: 'ボディ', value: averageScores.body, color: '#92400E' },
                              { label: '甘み', value: averageScores.sweetness, color: '#E11D48' },
                              { label: '香り', value: averageScores.aroma, color: '#059669' },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#5D4037] w-10 flex-shrink-0">{item.label}</span>
                                <div className="flex-1 h-2 bg-[#EFEBE9] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${((item.value - 1) / 4) * 100}%`,
                                      backgroundColor: item.color
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-[#8D6E63] w-6 text-right">{item.value.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 感想 + AIコメント */}
                      <div className="flex-1 flex flex-col min-h-0 p-4 bg-[#fffdf5]">
                        {/* 感想セクション */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-3">
                            <Quotes size={16} weight="fill" className="text-[#8D6E63]" />
                            <h4 className="text-sm font-serif font-bold text-[#5D4037]">感想</h4>
                            <span className="text-[10px] font-bold text-[#A1887F] ml-auto">{recordCount}件の記録</span>
                          </div>

                          <div className="h-[calc(100%-28px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] [&::-webkit-scrollbar-thumb]:rounded-full">
                            {comments.length > 0 ? (
                              <ul className="space-y-3">
                                {comments.map((comment, commentIndex) => (
                                  <li key={commentIndex} className="text-sm text-[#4E342E] leading-relaxed pl-3 border-l-2 border-[#A1887F]/40 font-serif italic">
                                    {comment}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="flex items-center justify-center h-full opacity-40">
                                <p className="text-xs font-serif text-[#8D6E63]">まだ感想がありません</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI分析ボタン */}
                        <div className="flex-shrink-0 border-t border-dashed border-[#D7CCC8] pt-3 mt-3">
                          {!hasAnalysis && !analyzing && recordCount === 0 && (
                            <p className="text-center text-xs font-serif text-[#8D6E63] italic py-2">記録が追加されるとAI分析が開始されます</p>
                          )}

                          {analyzing && (
                            <div className="flex items-center justify-center gap-2 py-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5D4037]"></div>
                              <span className="text-xs font-serif text-[#8D6E63]">分析中...</span>
                            </div>
                          )}

                          {hasAnalysis && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAiModalSession(session);
                              }}
                              className="w-full flex items-center justify-between gap-2 bg-[#fffcf0] p-3 rounded border border-[#D7CCC8] hover:bg-[#FFF8E1] transition-colors active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-2">
                                <Notepad size={16} weight="fill" className="text-[#8D6E63]" />
                                <span className="text-xs font-bold text-[#5D4037] font-serif">AIコーヒーマイスターのコメント</span>
                              </div>
                              <CaretRight size={16} weight="bold" className="text-[#A1887F]" />
                            </button>
                          )}
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

      {/* ページインジケーター */}
      <div className="flex-shrink-0 flex justify-center gap-1.5 py-4">
        {sessionData.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-[#5D4037] scale-125' : 'bg-[#D7CCC8]'
              }`}
          />
        ))}
      </div>

      {/* AI分析モーダル */}
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
              className="relative bg-[#FDFBF7] rounded-t-[2rem] shadow-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* ハンドル */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#D7CCC8] rounded-full" />
              </div>

              {/* ヘッダー */}
              <div className="px-6 pb-4 border-b border-dashed border-[#D7CCC8]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Notepad size={24} weight="fill" className="text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black text-[#3E2723]">
                      AIコーヒーマイスター
                    </h3>
                    <p className="text-xs text-[#8D6E63]">{aiModalSession.beanName}</p>
                  </div>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-sm font-serif leading-loose text-[#4E342E] whitespace-pre-wrap">
                  {aiModalSession.aiAnalysis}
                </p>
              </div>

              {/* 閉じるボタン */}
              <div className="p-4 border-t border-[#D7CCC8] bg-[#F5F5F5]">
                <button
                  onClick={() => setAiModalSession(null)}
                  className="w-full py-3 bg-[#5D4037] text-white rounded-2xl font-bold text-sm hover:bg-[#4E342E] transition-colors active:scale-[0.98]"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

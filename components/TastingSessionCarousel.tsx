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

  // 焙煎度に応じたバッジスタイル（焙煎色グラデーション）
  const getRoastBadgeStyle = (level: string) => {
    switch (level) {
      case '浅煎り':
        return {
          bg: '#C8A882', // ライトロースト（ライトブラウン）
          text: '#3E2723', // ダークブラウン（コントラスト高）
          label: level
        };
      case '中煎り':
        return {
          bg: '#A0826D', // ミディアムロースト（ミディアムブラウン）
          text: '#FFFFFF', // 白（見やすい）
          label: level
        };
      case '中深煎り':
        return {
          bg: '#6F4E37', // ミディアムダークロースト（ダークブラウン）
          text: '#FFFFFF', // 白
          label: level
        };
      case '深煎り':
        return {
          bg: '#3E2723', // ダークロースト（非常に濃い茶色）
          text: '#FFFFFF', // 白
          label: level
        };
      default:
        return {
          bg: '#8D6E63', // デフォルト（中間色）
          text: '#FFFFFF',
          label: level
        };
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
                    className="rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative border border-gray-100 bg-white"
                  >
                    <div className="relative z-10">
                      <div className="h-full flex flex-col">

                        {/* ヘッダー (Stitchデザイン) */}
                        <div className="px-8 pt-8 pb-6 border-b border-dashed border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div>
                              <div className="flex items-center gap-4 mb-1">
                                <h3 className="text-4xl font-serif font-bold text-[#4a3728] tracking-tight leading-tight truncate">
                                  {session.beanName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-3 py-1 text-xs font-bold rounded-full shadow-sm"
                                    style={{
                                      backgroundColor: getRoastBadgeStyle(session.roastLevel).bg,
                                      color: getRoastBadgeStyle(session.roastLevel).text
                                    }}
                                  >
                                    {getRoastBadgeStyle(session.roastLevel).label}
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
                            className="p-3 text-gray-400 hover:text-[#f5821f] transition-colors"
                          >
                            <PencilSimple size={22} weight="duotone" />
                          </button>
                        </div>

                        {/* メインコンテンツ (Flex Row) - Stitchデザイン */}
                        <div className="flex items-stretch border-b border-dashed border-gray-200">
                          {/* 感想 (左) */}
                          <div className="flex-1 p-8 border-r border-dashed border-gray-200 relative bg-white">
                            <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-[#4a3728]">
                                  <Quotes size={20} weight="fill" />
                                  <h4 className="text-base font-bold">感想</h4>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-500">
                                  <Users size={14} weight="fill" />
                                  <span>{recordCount} / {activeMemberCount}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-h-[160px] max-h-[300px] overflow-y-auto pr-2">
                                {comments.length > 0 ? (
                                  <ul className="space-y-4">
                                    {comments.map((comment, commentIndex) => (
                                      <li key={commentIndex} className="text-sm italic text-gray-600 leading-relaxed relative pl-4 border-l-2 border-gray-200">
                                        &ldquo;{comment}&rdquo;
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-4">
                                    <Coffee size={40} weight="thin" className="text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400 italic">まだ感想がありません...</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* チャート (右) - Stitchデザイン */}
                          <div className="w-80 flex-shrink-0 p-8 flex flex-col justify-center relative overflow-hidden bg-white">
                            {recordCount > 0 ? (
                              <div className="space-y-5 w-full relative z-10">
                                {[
                                  { label: '苦味', value: averageScores.bitterness, color: '#3e2723' },
                                  { label: '酸味', value: averageScores.acidity, color: '#ff7043' },
                                  { label: 'ボディ', value: averageScores.body, color: '#8d6e63' },
                                  { label: '甘み', value: averageScores.sweetness, color: '#d81b60' },
                                  { label: '香り', value: averageScores.aroma, color: '#00897b' },
                                ].map((item) => (
                                  <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                      <span>{item.label}</span>
                                      <span>{item.value.toFixed(1)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                                      <div
                                        className="h-full transition-all duration-700"
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
                              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 rounded-xl p-8 opacity-60">
                                <Coffee size={40} weight="thin" className="text-gray-300 mb-3" />
                                <p className="text-xs font-bold text-gray-400 tracking-widest text-center">データなし</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI分析レポート (下) - Stitchデザイン */}
                        <div className="p-8 relative min-h-[120px] transition-all duration-500">
                          <div className="relative z-10">
                            {!hasAnalysis && !analyzing && recordCount === 0 && (
                              <div className="flex items-center justify-center py-2">
                                <p className="text-xs text-gray-500 italic">記録が追加されるとAI分析が開始されます</p>
                              </div>
                            )}

                            {analyzing && (
                              <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5821f]"></div>
                                <p className="text-xs text-gray-500 animate-pulse">コーヒーの香りを分析中...</p>
                              </div>
                            )}

                            {hasAnalysis && (
                              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                  <Notepad size={20} weight="fill" className="text-[#f5821f]" />
                                  <h4 className="text-sm font-bold tracking-wide text-[#4a3728]">AIコーヒーマイスターのコメント</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-[#4a3728] whitespace-pre-wrap">
                                  {session.aiAnalysis}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* フッター - Stitchデザイン */}
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <CalendarBlank size={14} weight="fill" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#f5821f] transition-colors cursor-pointer">
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
                    className="rounded-2xl shadow-lg flex flex-col h-full overflow-hidden relative border border-gray-100 bg-white"
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex flex-col h-full">

                        {/* ヘッダー（タイトル） - Stitchデザイン */}
                        <div className="flex-shrink-0 p-5 pb-4 border-b border-dashed border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-serif font-bold text-[#4a3728] tracking-tight leading-tight truncate mb-2">
                                {session.beanName}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-0.5 text-[9px] font-bold rounded-full shadow-sm"
                                  style={{
                                    backgroundColor: getRoastBadgeStyle(session.roastLevel).bg,
                                    color: getRoastBadgeStyle(session.roastLevel).text
                                  }}
                                >
                                  {session.roastLevel}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {formatDate(session.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 横バーチャート（スコア表示） - Stitchデザイン */}
                        {recordCount > 0 && (
                          <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-dashed border-gray-200">
                            <div className="space-y-2.5">
                              {[
                                { label: '苦味', value: averageScores.bitterness, color: '#3e2723' },
                                { label: '酸味', value: averageScores.acidity, color: '#ff7043' },
                                { label: 'ボディ', value: averageScores.body, color: '#8d6e63' },
                                { label: '甘み', value: averageScores.sweetness, color: '#d81b60' },
                                { label: '香り', value: averageScores.aroma, color: '#00897b' },
                              ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-500 w-10 flex-shrink-0">{item.label}</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
                                    <div
                                      className="h-full transition-all duration-500"
                                      style={{
                                        width: `${((item.value - 1) / 4) * 100}%`,
                                        backgroundColor: item.color
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-500 w-6 text-right">{item.value.toFixed(1)}</span>
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
                              <Quotes size={16} weight="fill" className="text-[#4a3728]" />
                              <h4 className="text-sm font-bold text-[#4a3728]">感想</h4>
                              <span className="text-[10px] font-bold text-gray-400 ml-auto">{recordCount}件の記録</span>
                            </div>

                            <div className="h-[calc(100%-28px)] overflow-y-auto pr-1">
                              {comments.length > 0 ? (
                                <ul className="space-y-3">
                                  {comments.map((comment, commentIndex) => (
                                    <li key={commentIndex} className="text-sm italic text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">
                                      {comment}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                  <Coffee size={32} weight="thin" className="text-gray-300 mb-2" />
                                  <p className="text-xs text-gray-400 italic">まだ感想がありません</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* AI分析ボタン - Stitchデザイン */}
                          <div className="flex-shrink-0 border-t border-dashed border-gray-200 pt-3 mt-3">
                            {!hasAnalysis && !analyzing && recordCount === 0 && (
                              <p className="text-center text-xs text-gray-500 italic py-2">記録が追加されるとAI分析が開始されます</p>
                            )}

                            {analyzing && (
                              <div className="flex items-center justify-center gap-2 py-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f5821f]"></div>
                                <span className="text-xs text-gray-500">分析中...</span>
                              </div>
                            )}

                            {hasAnalysis && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setAiModalSession(session);
                                }}
                                className="w-full flex items-center justify-between gap-2 bg-gray-50 p-3 rounded border border-gray-200 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                              >
                                <div className="flex items-center gap-2">
                                  <Notepad size={16} weight="fill" className="text-[#f5821f]" />
                                  <span className="text-xs font-bold text-[#4a3728]">AIコーヒーマイスター</span>
                                </div>
                                <CaretRight size={16} weight="bold" className="text-gray-400" />
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
        <div className="flex-shrink-0 flex justify-center gap-1.5 py-4">
          {sessionData.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-gray-700 scale-125' : 'bg-gray-300'
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
                className="relative bg-white rounded-t-[2rem] shadow-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              >
                {/* ハンドル */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* ヘッダー */}
                <div className="px-6 pb-4 border-b border-dashed border-gray-200">
                  <div className="flex items-center gap-3">
                    <Notepad size={24} weight="fill" className="text-[#f5821f]" />
                    <div>
                      <h3 className="text-lg font-bold text-[#4a3728]">
                        AIコーヒーマイスター
                      </h3>
                      <p className="text-xs text-gray-500">{aiModalSession.beanName}</p>
                    </div>
                  </div>
                </div>

                {/* コンテンツ */}
                <div className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm leading-relaxed text-[#4a3728] whitespace-pre-wrap">
                    {aiModalSession.aiAnalysis}
                  </p>
                </div>

                {/* 閉じるボタン */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setAiModalSession(null)}
                    className="w-full py-3 bg-[#f5821f] hover:bg-orange-600 text-white rounded-full font-bold text-sm transition-colors active:scale-[0.98] shadow-lg"
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

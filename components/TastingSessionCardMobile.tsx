import { useState } from 'react';
import Link from 'next/link';
import { Coffee, Quotes, Notepad, CaretRight } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TastingSession } from '@/types';
import type { AverageScores } from '@/lib/tastingUtils';

interface TastingSessionCardMobileProps {
  session: TastingSession;
  recordCount: number;
  averageScores: AverageScores;
  comments: string[];
  isAnalyzing: boolean;
  getRoastBadgeStyle: (level: string) => { bg: string; text: string; label: string };
  formatDate: (dateStr: string) => string;
}

export function TastingSessionCardMobile({
  session,
  recordCount,
  averageScores,
  comments,
  isAnalyzing,
  getRoastBadgeStyle,
  formatDate,
}: TastingSessionCardMobileProps) {
  const [aiModalSession, setAiModalSession] = useState<TastingSession | null>(null);
  const hasAnalysis = !!session.aiAnalysis;

  return (
    <>
      <div className="flex-shrink-0 w-[calc(100vw-2rem)] h-full snap-center">
        <Link href={`/tasting?sessionId=${session.id}`} className="block h-full">
          <div className="rounded-2xl shadow-lg flex flex-col h-full overflow-hidden relative border border-gray-100 bg-white">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex flex-col h-full">
                {/* ヘッダー（タイトル） */}
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
                            color: getRoastBadgeStyle(session.roastLevel).text,
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

                {/* 横バーチャート（スコア表示） */}
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
                          <span className="text-[10px] font-bold text-gray-500 w-10 flex-shrink-0">
                            {item.label}
                          </span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${((item.value - 1) / 4) * 100}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 w-6 text-right">
                            {item.value.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 感想 + AIコメント */}
                <div className="flex-1 flex flex-col min-h-0 p-4 bg-white">
                  {/* 感想セクション */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <Quotes size={16} weight="fill" className="text-[#4a3728]" />
                      <h4 className="text-sm font-bold text-[#4a3728]">感想</h4>
                      <span className="text-[10px] font-bold text-gray-400 ml-auto">
                        {recordCount}件の記録
                      </span>
                    </div>

                    <div className="h-[calc(100%-28px)] overflow-y-auto pr-1">
                      {comments.length > 0 ? (
                        <ul className="space-y-3">
                          {comments.map((comment, commentIndex) => (
                            <li
                              key={commentIndex}
                              className="text-sm italic text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200"
                            >
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

                  {/* AI分析ボタン */}
                  <div className="flex-shrink-0 border-t border-dashed border-gray-200 pt-3 mt-3">
                    {!hasAnalysis && !isAnalyzing && recordCount === 0 && (
                      <p className="text-center text-xs text-gray-500 italic py-2">
                        記録が追加されるとAI分析が開始されます
                      </p>
                    )}

                    {isAnalyzing && (
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
                          <span className="text-xs font-bold text-[#4a3728]">
                            AIコーヒーマイスター
                          </span>
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
                    <h3 className="text-lg font-bold text-[#4a3728]">AIコーヒーマイスター</h3>
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
    </>
  );
}

'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoCreateOutline } from 'react-icons/io5';
import { FaCoffee } from 'react-icons/fa';
import type { AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import { StarRating } from './StarRating';
import {
  calculateAverageScores,
  getActiveMemberCount,
  getRecordsBySessionId,
} from '@/lib/tastingUtils';

interface TastingSessionCarouselProps {
  sessions: TastingSession[];
  tastingRecords: any[];
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

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollContainerRef.current) return;
    e.preventDefault();
    scrollContainerRef.current.scrollLeft += e.deltaY;
  };

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
        className="overflow-x-auto overflow-y-hidden h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
        onWheel={handleWheel}
      >
        <div className="inline-flex gap-4 pb-2 h-full" style={{ minWidth: 'max-content' }}>
          {sessions.map((session) => {
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
              <div
                key={session.id}
                className="flex-shrink-0 w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-full"
              >
                <Link
                  href={`/tasting?sessionId=${session.id}`}
                  className="block h-full"
                >
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full min-h-0">
                    {/* ヘッダー部分 */}
                    <div className="mb-0 flex-shrink-0">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap h-7">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                              {session.beanName}
                            </h3>
                            <span
                              className="px-2 py-1 text-white text-xs rounded-full flex-shrink-0"
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
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/tasting?sessionId=${session.id}&edit=true`);
                              }}
                              className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors flex-shrink-0"
                              aria-label="セッションを編集"
                            >
                              <IoCreateOutline className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 h-5 flex items-center">
                            {formatDate(session.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* レーダーチャート */}
                    <div className="mb-3 sm:mb-4 flex-1 flex items-center justify-center min-h-0 relative -mt-10">
                      {recordCount > 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <TastingRadarChart
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
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <FaCoffee className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            まだ記録がありません
                          </p>
                        </div>
                      )}
                      {/* 星評価 - 中央よりに配置 */}
                      {recordCount > 0 && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                          <StarRating rating={averageScores.overallRating} size="md" />
                        </div>
                      )}
                    </div>

                    {/* みんなの感想 */}
                    {(() => {
                      if (comments.length === 0) return null;

                      return (
                        <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col flex-shrink-0 min-h-[12rem] max-h-[min(20rem,calc(100vh-28rem))] sm:max-h-[min(22rem,calc(100vh-30rem))] md:max-h-[min(24rem,calc(100vh-32rem))]">
                          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                            <h4 className="text-sm font-semibold text-gray-800">みんなの感想</h4>
                            <span className="px-2 py-0.5 bg-amber-600 text-white text-sm font-semibold rounded-full flex-shrink-0">
                              {recordCount}/{activeMemberCount}
                            </span>
                          </div>
                          <ul className="space-y-1.5 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {comments.map((comment, commentIndex) => (
                              <li key={commentIndex} className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                ・{comment}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

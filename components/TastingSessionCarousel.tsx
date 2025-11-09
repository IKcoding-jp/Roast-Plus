'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoCreateOutline } from 'react-icons/io5';
import { FaCoffee } from 'react-icons/fa';
import type { AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
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

  const renderStars = (rating: number) => {
    if (rating === 0) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">評価なし</span>
        </div>
      );
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-base">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-base">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-300 text-base">★</span>
        ))}
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
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
        <div className="inline-flex gap-4 pb-4 h-full" style={{ minWidth: 'max-content' }}>
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
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                    {/* ヘッダー部分 */}
                    <div className="mb-4 flex-shrink-0">
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
                        <div className="text-right flex-shrink-0 min-w-[100px] flex flex-col items-end">
                          {recordCount > 0 ? (
                            <>
                              <div className="text-sm font-medium text-gray-700 mb-1 h-7 flex items-center">
                                総合点
                              </div>
                              <div className="h-5 flex items-center">
                                {renderStars(averageScores.overallRating)}
                              </div>
                            </>
                          ) : (
                            <div className="h-[3rem]"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* レーダーチャート */}
                    <div className="mb-4 flex-1 flex items-center justify-center min-h-[200px]">
                      {recordCount > 0 ? (
                        <div className="w-full">
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
                        <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
                          <FaCoffee className="w-16 h-16 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            まだ記録がありません
                          </p>
                        </div>
                      )}
                    </div>

                    {/* みんなの感想 */}
                    {(() => {
                      if (comments.length === 0) return null;

                      return (
                        <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col flex-shrink-0 min-h-[200px] max-h-[240px]">
                          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                            <h4 className="text-sm font-semibold text-gray-800">みんなの感想</h4>
                            <span className="px-2 py-0.5 bg-amber-600 text-white text-sm font-semibold rounded-full flex-shrink-0">
                              {recordCount}/{activeMemberCount}
                            </span>
                          </div>
                          <ul className="space-y-1.5 flex-1 overflow-y-auto min-h-0">
                            {comments.map((comment, commentIndex) => (
                              <li key={commentIndex} className="text-sm text-gray-700 whitespace-pre-wrap">
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

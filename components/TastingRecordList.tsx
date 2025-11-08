'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TastingRecord, AppData } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import { getSelectedMemberId } from '@/lib/localStorage';
import { HiTrash } from 'react-icons/hi';

interface TastingRecordListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export function TastingRecordList({ data, onUpdate }: TastingRecordListProps) {
  const router = useRouter();
  const selectedMemberId = getSelectedMemberId();

  // tastingRecordsが配列でない場合のフォールバック
  const tastingRecords = Array.isArray(data.tastingRecords) ? data.tastingRecords : [];

  // 試飲日時順（新しい順）でソート
  const sortedRecords = [...tastingRecords].sort((a, b) => {
    const dateA = new Date(a.tastingDate).getTime();
    const dateB = new Date(b.tastingDate).getTime();
    if (dateA !== dateB) {
      return dateB - dateA; // 日付が新しい順
    }
    // 日付が同じ場合は更新日時でソート
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (!confirmDelete) return;

    const updatedRecords = tastingRecords.filter((r) => r.id !== id);
    onUpdate({
      ...data,
      tastingRecords: updatedRecords,
    });
  };

  const handleCardClick = (id: string) => {
    router.push(`/tasting/${id}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-300 text-lg">★</span>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (sortedRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">試飲記録がありません</p>
        <p className="text-sm text-gray-500 mt-2">右下のボタンから新規作成できます</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => {
        const isOwnRecord = record.memberId === selectedMemberId;

        return (
          <div
            key={record.id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(record.id)}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* 左側: 豆名と基本情報 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {record.beanName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#8B4513] text-white text-sm rounded-full">
                      {record.roastLevel}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(record.tastingDate)}
                    </span>
                    {isOwnRecord && onUpdate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="削除"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 星評価 */}
                <div className="mb-4">{renderStars(record.overallRating)}</div>

                {/* コメント */}
                {record.overallImpression && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {record.overallImpression}
                  </p>
                )}
              </div>

              {/* 右側: レーダーチャート */}
              <div className="flex-shrink-0">
                <TastingRadarChart record={record} size={180} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


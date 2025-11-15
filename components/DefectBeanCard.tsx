'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { DefectBean } from '@/types';
import { DefectBeanDetail } from './DefectBeanDetail';

interface DefectBeanCardProps {
  defectBean: DefectBean;
  shouldRemove?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onToggleSetting?: (id: string, shouldRemove: boolean) => void;
  onDelete?: (id: string, imageUrl: string) => void;
  isUserDefectBean?: boolean;
}

export function DefectBeanCard({
  defectBean,
  shouldRemove,
  isSelected = false,
  onSelect,
  onToggleSetting,
  onDelete,
  isUserDefectBean = false,
}: DefectBeanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(defectBean.id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-amber-500' : ''
      } ${isExpanded ? 'shadow-lg' : ''}`}
    >
      {/* カード本体 */}
      <div
        className={`cursor-pointer ${isExpanded ? '' : 'hover:shadow-lg'}`}
        onClick={handleCardClick}
      >
        {/* 画像 */}
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={defectBean.imageUrl}
            alt={defectBean.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
          />
          {/* 設定バッジ */}
          {shouldRemove !== undefined && (
            <div
              className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                shouldRemove
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {shouldRemove ? '省く' : '省かない'}
            </div>
          )}
          {/* 選択バッジ */}
          {isSelected && (
            <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {defectBean.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {defectBean.characteristics}
          </p>
        </div>
      </div>

      {/* 展開された詳細 */}
      {isExpanded && !onSelect && (
        <DefectBeanDetail
          defectBean={defectBean}
          shouldRemove={shouldRemove}
          onToggleSetting={onToggleSetting}
          onDelete={isUserDefectBean ? onDelete : undefined}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}


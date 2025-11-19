'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HiXCircle } from 'react-icons/hi';
import type { DefectBean } from '@/types';

interface DefectBeanCardProps {
  defectBean: DefectBean;
  shouldRemove?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onToggleSetting?: (id: string, shouldRemove: boolean) => void;
  onDelete?: (id: string, imageUrl: string) => void;
  isUserDefectBean?: boolean;
  onEdit?: (id: string) => void;
  compareMode?: boolean;
}

export function DefectBeanCard({
  defectBean,
  shouldRemove,
  isSelected = false,
  onSelect,
  onToggleSetting,
  onDelete,
  isUserDefectBean = false,
  onEdit,
  compareMode = false,
}: DefectBeanCardProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const handleCardClick = () => {
    if (compareMode && onSelect) {
      // 比較モード中は選択のみ
      onSelect(defectBean.id);
    } else if (!compareMode && onEdit) {
      // 通常モードでは編集ダイアログを開く
      onEdit(defectBean.id);
    }
  };

  const handleToggleSetting = (newShouldRemove: boolean) => {
    if (onToggleSetting) {
      onToggleSetting(defectBean.id, newShouldRemove);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all flex flex-col ${
          isSelected ? 'ring-2 ring-amber-500' : ''
        } hover:shadow-lg ${!compareMode && onEdit ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
      >
        {/* 画像 */}
        <div
          className="relative w-full aspect-square cursor-pointer flex-shrink-0 p-2.5 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100"
          onClick={(e) => {
            e.stopPropagation(); // カードクリックを防ぐ
            setShowImageModal(true);
          }}
        >
          {/* 外側の太い枠（深いブラウン、強い影） */}
          <div className="absolute inset-0 border-[6px] border-amber-950/50 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.1)]"></div>
          {/* 内側の細い枠（上品なゴールド、光沢感） */}
          <div className="absolute inset-2 border-[1.5px] border-amber-500/70 rounded-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.1)]"></div>
          {/* 画像コンテナ */}
          <div className="absolute inset-[10px] bg-gray-100 rounded-lg overflow-hidden shadow-inner">
            <Image
              src={defectBean.imageUrl}
              alt={defectBean.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          </div>
          {/* 選択バッジ */}
          {isSelected && (
            <div className="absolute top-1 left-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center z-10 shadow-lg">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="p-2 flex flex-col flex-1 min-h-0">
          {/* 名称 */}
          <div className="flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {defectBean.name}
            </h3>
          </div>

          {/* 詳細情報 */}
          <div className="space-y-1.5 flex-1 min-h-0">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-0.5">特徴</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3 min-h-[2.5rem]">
                {defectBean.characteristics || <span className="text-gray-400">未入力</span>}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-0.5">味への影響</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3 min-h-[2.5rem]">
                {defectBean.tasteImpact || <span className="text-gray-400">未入力</span>}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-0.5">省く理由</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3 min-h-[2.5rem]">
                {defectBean.removalReason || <span className="text-gray-400">未入力</span>}
              </p>
            </div>
          </div>

          {/* 設定切り替え */}
          {onToggleSetting && (
            <div className="flex gap-1.5 pt-1.5 border-t border-gray-200 mt-auto flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleToggleSetting(true)}
                className={`flex-1 px-1.5 sm:px-2 py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors min-h-[36px] flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap ${
                  shouldRemove === true
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">×</span>
                <span>省く</span>
              </button>
              <button
                onClick={() => handleToggleSetting(false)}
                className={`flex-1 px-1.5 sm:px-2 py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors min-h-[36px] flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap ${
                  shouldRemove === false
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">○</span>
                <span>省かない</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 画像拡大モーダル */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <HiXCircle className="h-8 w-8" />
          </button>
          <div className="relative max-w-full max-h-full">
            <Image
              src={defectBean.imageUrl}
              alt={defectBean.name}
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}


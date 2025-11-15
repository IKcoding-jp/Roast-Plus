'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HiTrash, HiCheck, HiXCircle } from 'react-icons/hi';
import type { DefectBean } from '@/types';

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
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(defectBean.id);
    }
  };

  const handleToggleSetting = (newShouldRemove: boolean) => {
    if (onToggleSetting) {
      onToggleSetting(defectBean.id, newShouldRemove);
    }
  };

  const handleDelete = () => {
    if (onDelete && defectBean.imageUrl) {
      onDelete(defectBean.id, defectBean.imageUrl);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
          isSelected ? 'ring-2 ring-amber-500' : ''
        } hover:shadow-lg`}
      >
        {/* 画像 */}
        <div
          className="relative w-full h-32 bg-gray-100 cursor-pointer"
          onClick={() => setShowImageModal(true)}
        >
          <Image
            src={defectBean.imageUrl}
            alt={defectBean.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
          {/* 設定バッジ */}
          {shouldRemove !== undefined && (
            <div
              className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
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
            <div className="absolute top-1 left-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="p-2 space-y-2">
          {/* 名称 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {defectBean.name}
            </h3>
          </div>

          {/* 詳細情報 */}
          <div className="space-y-1.5">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-0.5">特徴</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-2">
                {defectBean.characteristics}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-0.5">味への影響</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-2">
                {defectBean.tasteImpact}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-0.5">省く理由</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-2">
                {defectBean.removalReason}
              </p>
            </div>
          </div>

          {/* 設定切り替え */}
          {onToggleSetting && (
            <div className="flex gap-1.5 pt-1.5 border-t border-gray-200">
              <button
                onClick={() => handleToggleSetting(true)}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors min-h-[36px] flex items-center justify-center gap-1 ${
                  shouldRemove === true
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <HiXCircle className="h-4 w-4" />
                省く
              </button>
              <button
                onClick={() => handleToggleSetting(false)}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors min-h-[36px] flex items-center justify-center gap-1 ${
                  shouldRemove === false
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <HiCheck className="h-4 w-4" />
                省かない
              </button>
            </div>
          )}

          {/* 削除ボタン（ユーザー追加データのみ） */}
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors min-h-[36px] flex items-center justify-center gap-1 text-xs"
            >
              <HiTrash className="h-4 w-4" />
              削除
            </button>
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

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              削除の確認
            </h3>
            <p className="text-gray-600 mb-4">
              この欠点豆を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px]"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


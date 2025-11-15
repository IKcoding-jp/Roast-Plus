'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HiX, HiTrash, HiCheck, HiXCircle } from 'react-icons/hi';
import type { DefectBean } from '@/types';

interface DefectBeanDetailProps {
  defectBean: DefectBean;
  shouldRemove?: boolean;
  onToggleSetting?: (id: string, shouldRemove: boolean) => void;
  onDelete?: (id: string, imageUrl: string) => void;
  onClose?: () => void;
}

export function DefectBeanDetail({
  defectBean,
  shouldRemove,
  onToggleSetting,
  onDelete,
  onClose,
}: DefectBeanDetailProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleSetting = (newShouldRemove: boolean) => {
    if (onToggleSetting) {
      onToggleSetting(defectBean.id, newShouldRemove);
    }
  };

  const handleDelete = () => {
    if (onDelete && defectBean.imageUrl) {
      onDelete(defectBean.id, defectBean.imageUrl);
      setShowDeleteConfirm(false);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <>
      <div className="border-t border-gray-200 p-4 space-y-4">
        {/* 画像（拡大表示可能） */}
        <div
          className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setShowImageModal(true)}
        >
          <Image
            src={defectBean.imageUrl}
            alt={defectBean.name}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </div>

        {/* 詳細情報 */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">特徴</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {defectBean.characteristics}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">味への影響</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {defectBean.tasteImpact}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">省く理由</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {defectBean.removalReason}
            </p>
          </div>
        </div>

        {/* 設定切り替え */}
        {onToggleSetting && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => handleToggleSetting(true)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
                shouldRemove === true
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <HiXCircle className="h-5 w-5" />
              省く
            </button>
            <button
              onClick={() => handleToggleSetting(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
                shouldRemove === false
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <HiCheck className="h-5 w-5" />
              省かない
            </button>
          </div>
        )}

        {/* 削除ボタン（ユーザー追加データのみ） */}
        {onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            <HiTrash className="h-5 w-5" />
            削除
          </button>
        )}

        {/* 閉じるボタン */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            <HiX className="h-5 w-5" />
            閉じる
          </button>
        )}
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
            <HiX className="h-8 w-8" />
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


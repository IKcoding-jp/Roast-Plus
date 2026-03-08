'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HiX, HiTrash, HiCheck, HiXCircle } from 'react-icons/hi';
import { Button, IconButton } from '@/components/ui';
import type { DefectBean } from '@/types';

interface DefectBeanDetailProps {
  defectBean: DefectBean;
  shouldRemove?: boolean;
  onToggleSetting?: (id: string, shouldRemove: boolean) => void;
  onDelete?: (id: string, imageUrl: string) => void;
  onClose?: () => void;
  isCompareMode?: boolean;
}

export function DefectBeanDetail({
  defectBean,
  shouldRemove,
  onToggleSetting,
  onDelete,
  onClose,
  isCompareMode = false,
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
      <div className={`${isCompareMode ? 'p-0' : 'border-t border-gray-200 p-4'} ${isCompareMode ? 'space-y-3' : 'space-y-3 sm:space-y-4'}`}>
        {/* 名前 */}
        <h3 className="text-xl font-bold text-gray-800 text-center">
          {defectBean.name}
        </h3>

        {/* 画像（拡大表示可能） */}
        <div
          className={`relative w-full mx-auto aspect-square cursor-pointer p-2.5 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 ${
            isCompareMode ? 'max-w-[280px] sm:max-w-[320px]' : 'max-w-xs'
          }`}
          onClick={() => setShowImageModal(true)}
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
              sizes={isCompareMode ? "(max-width: 768px) 280px, 320px" : "(max-width: 768px) 100vw, 320px"}
              unoptimized
            />
          </div>
        </div>

        {/* 詳細情報 */}
        <div className={isCompareMode ? 'space-y-2.5' : 'space-y-3'}>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">特徴</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {defectBean.characteristics}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">味への影響</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {defectBean.tasteImpact}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">省く理由</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {defectBean.removalReason}
            </p>
          </div>
        </div>

        {/* 設定切り替え */}
        {onToggleSetting && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button
              onClick={() => handleToggleSetting(true)}
              variant={shouldRemove === true ? 'danger' : 'secondary'}
              size="sm"
              className={`flex-1 gap-2 ${
                shouldRemove === true
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <HiXCircle className="h-5 w-5" />
              省く
            </Button>
            <Button
              onClick={() => handleToggleSetting(false)}
              variant={shouldRemove === false ? 'success' : 'secondary'}
              size="sm"
              className={`flex-1 gap-2 ${
                shouldRemove === false
                  ? ''
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <HiCheck className="h-5 w-5" />
              省かない
            </Button>
          </div>
        )}

        {/* 削除ボタン（ユーザー追加データのみ） */}
        {onDelete && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="sm"
            fullWidth
            className="gap-2"
          >
            <HiTrash className="h-5 w-5" />
            削除
          </Button>
        )}

        {/* 閉じるボタン */}
        {onClose && (
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            fullWidth
            className="gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <HiX className="h-5 w-5" />
            閉じる
          </Button>
        )}
      </div>

      {/* 画像拡大モーダル */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <IconButton
            onClick={() => setShowImageModal(false)}
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label="閉じる"
          >
            <HiX className="h-8 w-8" />
          </IconButton>
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
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
                size="sm"
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                size="sm"
                className="flex-1"
              >
                削除
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


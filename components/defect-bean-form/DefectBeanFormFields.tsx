'use client';

import Image from 'next/image';
import { HiX, HiCamera, HiTrash } from 'react-icons/hi';
import { Input, Textarea, Button } from '@/components/ui';
interface DefectBeanFormFieldsProps {
  mode: 'add' | 'edit';
  imagePreview: string | null;
  name: string;
  characteristics: string;
  tasteImpact: string;
  removalReason: string;
  isSubmitting: boolean;
  isDeleting: boolean;
  onNameChange: (value: string) => void;
  onCharacteristicsChange: (value: string) => void;
  onTasteImpactChange: (value: string) => void;
  onRemovalReasonChange: (value: string) => void;
  onShowCamera: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function DefectBeanFormFields({
  mode,
  imagePreview,
  name,
  characteristics,
  tasteImpact,
  removalReason,
  isSubmitting,
  isDeleting,
  onNameChange,
  onCharacteristicsChange,
  onTasteImpactChange,
  onRemovalReasonChange,
  onShowCamera,
  onFileSelect,
  onClearImage,
  onSubmit,
  onDelete,
  onCancel,
}: DefectBeanFormFieldsProps) {
  return (
    <>
      {/* 画像選択 */}
      <div className="px-6 pt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          画像 {mode === 'add' && <span className="text-red-500">*</span>}
        </label>
        {imagePreview ? (
          <div className="flex justify-center">
            <div className="relative w-full max-w-xs">
              <Image
                src={imagePreview}
                alt="Preview"
                width={320}
                height={320}
                className="w-full aspect-square object-cover rounded-lg"
                unoptimized
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearImage();
                }}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onShowCamera}
              className="w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[200px]"
            >
              <HiCamera className="h-12 w-12 text-gray-400" />
              <span className="text-gray-600 font-medium">カメラで撮影</span>
            </button>
            <div className="text-center text-sm text-gray-500">または</div>
            <label className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer text-center min-h-[44px] flex items-center justify-center">
              <span className="text-gray-700 font-medium">ファイルを選択</span>
              <input
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* フォーム */}
      <form onSubmit={onSubmit} className="p-6 space-y-6">

        {/* 名称 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            名称 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="例: カビ豆"
            required
          />
        </div>

        {/* 特徴 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            特徴（見た目の説明）
          </label>
          <Textarea
            value={characteristics}
            onChange={(e) => onCharacteristicsChange(e.target.value)}
            placeholder="例: 黒いカビが生えている。表面が黒ずんでいる。"
            rows={4}
          />
        </div>

        {/* 味への影響 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            味への影響
          </label>
          <Textarea
            value={tasteImpact}
            onChange={(e) => onTasteImpactChange(e.target.value)}
            placeholder="例: カビ臭さがコーヒーの風味を損なう。"
            rows={4}
          />
        </div>

        {/* 省く理由 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            省く理由
          </label>
          <Textarea
            value={removalReason}
            onChange={(e) => onRemovalReasonChange(e.target.value)}
            placeholder="例: 品質を保つため、カビ豆は必ず除去する。"
            rows={4}
          />
        </div>

        {/* ボタン */}
        <div className={`flex gap-3 pt-4 border-t border-gray-200 ${mode === 'edit' && onDelete ? 'justify-between' : 'justify-end'}`}>
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={isSubmitting || isDeleting}
            >
              <HiTrash className="h-5 w-5" />
              {isDeleting ? '削除中...' : '削除'}
            </Button>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isDeleting}
              loading={isSubmitting}
            >
              {isSubmitting
                ? mode === 'edit'
                  ? '更新中...'
                  : '追加中...'
                : mode === 'edit'
                  ? '更新'
                  : '追加'}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

'use client';

import Image from 'next/image';
import { HiX, HiCamera, HiTrash } from 'react-icons/hi';
import { Input, Textarea, Button, IconButton } from '@/components/ui';

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
  const labelClass = 'block text-sm font-semibold mb-2 text-ink-sub';

  return (
    <>
      {/* 画像選択 */}
      <div className="px-6 pt-6">
        <label className={labelClass}>
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
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onClearImage();
                }}
                className="absolute top-2 right-2 !bg-black !bg-opacity-50 !text-white hover:!bg-opacity-70 z-10"
                rounded
                aria-label="画像をクリア"
              >
                <HiX className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={onShowCamera}
              className="!w-full !px-4 !py-12 !border-2 !border-dashed !rounded-lg flex-col !min-h-[200px] !border-edge-strong hover:!border-spot hover:!bg-spot-subtle"
            >
              <HiCamera className="h-12 w-12 text-ink-muted" />
              <span className="font-medium text-ink-sub">カメラで撮影</span>
            </Button>
            <div className="text-center text-sm text-ink-muted">または</div>
            <label className="block w-full px-4 py-3 border-2 rounded-lg transition-colors cursor-pointer text-center min-h-[44px] flex items-center justify-center border-edge-strong hover:border-spot hover:bg-spot-subtle text-ink-sub">
              <span className="font-medium">ファイルを選択</span>
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
          <label className={labelClass}>
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
          <label className={labelClass}>
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
          <label className={labelClass}>
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
          <label className={labelClass}>
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
        <div className={`flex gap-3 pt-4 border-t border-edge ${mode === 'edit' && onDelete ? 'justify-between' : 'justify-end'}`}>
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

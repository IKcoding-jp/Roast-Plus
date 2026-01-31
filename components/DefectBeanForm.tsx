'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiX, HiCamera, HiTrash } from 'react-icons/hi';
import { CameraCapture } from './CameraCapture';
import type { DefectBean } from '@/types';
import { Input, Textarea, Button } from '@/components/ui';
import { useToastContext } from '@/components/Toast';

interface DefectBeanFormProps {
  mode?: 'add' | 'edit';
  defectBean?: DefectBean; // 編集モード時に既存データを渡す
  onSubmit: (
    defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
    imageFile: File | null // 編集モード時はnullの可能性がある
  ) => Promise<void>;
  onUpdate?: (
    defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
    imageFile: File | null
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export function DefectBeanForm({
  mode = 'add',
  defectBean,
  onSubmit,
  onUpdate,
  onDelete,
  onCancel,
}: DefectBeanFormProps) {
  const { showToast } = useToastContext();
  const [showCamera, setShowCamera] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [tasteImpact, setTasteImpact] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 編集モード時に既存データをフォームに設定
  useEffect(() => {
    if (mode === 'edit' && defectBean) {
      setName(defectBean.name);
      setCharacteristics(defectBean.characteristics);
      setTasteImpact(defectBean.tasteImpact);
      setRemovalReason(defectBean.removalReason);
      setImagePreview(defectBean.imageUrl);
    }
  }, [mode, defectBean]);

  const handleCameraCapture = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setShowCamera(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 追加モード時は画像が必須
    if (mode === 'add' && !imageFile) {
      showToast('画像を選択してください。', 'warning');
      return;
    }

    if (!name.trim()) {
      showToast('名称を入力してください。', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const defectBeanData = {
        name: name.trim(),
        characteristics: characteristics.trim() || '',
        tasteImpact: tasteImpact.trim() || '',
        removalReason: removalReason.trim() || '',
      };

      if (mode === 'edit' && onUpdate) {
        await onUpdate(defectBeanData, imageFile);
      } else {
        if (!imageFile) {
          showToast('画像を選択してください。', 'warning');
          return;
        }
        await onSubmit(defectBeanData, imageFile);
      }
    } catch (error) {
      console.error(`Failed to ${mode === 'edit' ? 'update' : 'submit'} defect bean:`, error);
      showToast(`欠点豆の${mode === 'edit' ? '更新' : '追加'}に失敗しました。`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!window.confirm('この欠点豆を削除しますか？')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete defect bean:', error);
      showToast('欠点豆の削除に失敗しました。', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-20">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'edit' ? '欠点豆を編集' : '欠点豆を追加'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

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
                    if (mode === 'edit' && defectBean && imageFile) {
                      // 編集モードで新しい画像を選択していた場合、既存画像に戻す
                      setImageFile(null);
                      setImagePreview(defectBean.imageUrl);
                    } else {
                      // 追加モード、または編集モードで既存画像を表示している場合、画像選択UIに戻す
                      setImageFile(null);
                      setImagePreview(null);
                    }
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
                onClick={() => setShowCamera(true)}
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
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 名称 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              名称 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setCharacteristics(e.target.value)}
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
              onChange={(e) => setTasteImpact(e.target.value)}
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
              onChange={(e) => setRemovalReason(e.target.value)}
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
                onClick={handleDelete}
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
      </div>
    </div>
  );
}


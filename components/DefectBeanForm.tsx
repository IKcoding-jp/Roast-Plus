'use client';

import { useState } from 'react';
import { HiX, HiCamera } from 'react-icons/hi';
import { CameraCapture } from './CameraCapture';
import type { DefectBean } from '@/types';

interface DefectBeanFormProps {
  onSubmit: (
    defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
    imageFile: File
  ) => Promise<void>;
  onCancel: () => void;
}

export function DefectBeanForm({ onSubmit, onCancel }: DefectBeanFormProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [tasteImpact, setTasteImpact] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!imageFile) {
      alert('画像を選択してください。');
      return;
    }

    if (!name.trim()) {
      alert('名称を入力してください。');
      return;
    }

    if (!characteristics.trim()) {
      alert('特徴を入力してください。');
      return;
    }

    if (!tasteImpact.trim()) {
      alert('味への影響を入力してください。');
      return;
    }

    if (!removalReason.trim()) {
      alert('省く理由を入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          name: name.trim(),
          characteristics: characteristics.trim(),
          tasteImpact: tasteImpact.trim(),
          removalReason: removalReason.trim(),
        },
        imageFile
      );
    } catch (error) {
      console.error('Failed to submit defect bean:', error);
      alert('欠点豆の追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
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
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">欠点豆を追加</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 画像選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              画像 <span className="text-red-500">*</span>
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md mx-auto aspect-square object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <HiX className="h-5 w-5" />
                </button>
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

          {/* 名称 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px] text-gray-900 bg-white"
              placeholder="例: カビ豆"
              required
            />
          </div>

          {/* 特徴 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              特徴（見た目の説明） <span className="text-red-500">*</span>
            </label>
            <textarea
              value={characteristics}
              onChange={(e) => setCharacteristics(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[100px] resize-y text-gray-900 bg-white"
              placeholder="例: 白いカビが生えている。表面がふわふわしている。"
              required
            />
          </div>

          {/* 味への影響 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              味への影響 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={tasteImpact}
              onChange={(e) => setTasteImpact(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[100px] resize-y text-gray-900 bg-white"
              placeholder="例: カビ臭さがコーヒーの風味を損なう。"
              required
            />
          </div>

          {/* 省く理由 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              省く理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[100px] resize-y text-gray-900 bg-white"
              placeholder="例: 品質を保つため、カビ豆は必ず除去する。"
              required
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors min-h-[44px]"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


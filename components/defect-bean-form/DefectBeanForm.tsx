'use client';

import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { CameraCapture } from '../CameraCapture';
import { DefectBeanFormFields } from './DefectBeanFormFields';
import { Modal, IconButton } from '@/components/ui';
import type { DefectBean } from '@/types';
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

  const handleClearImage = () => {
    if (mode === 'edit' && defectBean && imageFile) {
      // 編集モードで新しい画像を選択していた場合、既存画像に戻す
      setImageFile(null);
      setImagePreview(defectBean.imageUrl);
    } else {
      // 追加モード、または編集モードで既存画像を表示している場合、画像選択UIに戻す
      setImageFile(null);
      setImagePreview(null);
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
    <Modal
      show={true}
      onClose={onCancel}
      closeOnBackdropClick={false}
      contentClassName="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-overlay border border-edge"
    >
      {/* ヘッダー */}
      <div className="sticky top-0 p-4 flex items-center justify-between z-20 border-b bg-surface border-edge">
        <h2 className="text-xl font-semibold text-ink">
          {mode === 'edit' ? '欠点豆を編集' : '欠点豆を追加'}
        </h2>
        <IconButton
          onClick={onCancel}
          rounded
          aria-label="閉じる"
        >
          <HiX className="h-6 w-6" />
        </IconButton>
      </div>

      <DefectBeanFormFields
        mode={mode}
        imagePreview={imagePreview}
        name={name}
        characteristics={characteristics}
        tasteImpact={tasteImpact}
        removalReason={removalReason}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        onNameChange={setName}
        onCharacteristicsChange={setCharacteristics}
        onTasteImpactChange={setTasteImpact}
        onRemovalReasonChange={setRemovalReason}
        onShowCamera={() => setShowCamera(true)}
        onFileSelect={handleFileSelect}
        onClearImage={handleClearImage}
        onSubmit={handleSubmit}
        onDelete={onDelete ? handleDelete : undefined}
        onCancel={onCancel}
      />
    </Modal>
  );
}

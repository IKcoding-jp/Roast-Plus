'use client';

import { useState } from 'react';
import { HiX, HiTrash } from 'react-icons/hi';
import { Button } from '@/components/ui';
import { extractTargetAmount, extractUnitFromWeight } from '@/lib/firestore';
import type { WorkProgressStatus } from '@/types';
import type { WorkProgressInput } from '@/hooks/useWorkProgressActions';

interface WorkProgressFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkProgressInput) => Promise<void>;
  onDelete?: () => void;
  initialData?: WorkProgressInput;
  isEditing: boolean;
  defaultGroupName?: string | null;
}

export function WorkProgressFormDialog({
  isOpen, onClose, onSubmit, onDelete, initialData, isEditing, defaultGroupName
}: WorkProgressFormDialogProps) {
  const initialWeight = initialData?.weight || '';
  const initialAmount = initialWeight ? extractTargetAmount(initialWeight) : undefined;
  const initialUnit = initialWeight ? extractUnitFromWeight(initialWeight) : '';
  const validUnits = ['kg', 'g', '個', '枚', '袋', '箱'];
  const initialUnitValid = validUnits.includes(initialUnit) ? initialUnit : '';

  const [formData, setFormData] = useState({
    groupName: defaultGroupName || initialData?.groupName || '',
    taskName: initialData?.taskName || '',
    targetAmount: initialAmount !== undefined ? initialAmount.toString() : '',
    targetUnit: initialUnitValid,
    memo: initialData?.memo || '',
    status: initialData?.status || 'pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let weight = '';
      if (formData.targetAmount.trim()) {
        const amount = formData.targetAmount.trim();
        const unit = formData.targetUnit.trim();
        weight = unit ? `${amount}${unit}` : amount;
      }

      const payload: WorkProgressInput = {
        groupName: formData.groupName || undefined,
        taskName: formData.taskName,
        memo: formData.memo || undefined,
        status: formData.status,
        weight: weight || undefined,
      };
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">
            {isEditing ? '作業を編集' : '新しい作業を追加'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">グループ名 (任意)</label>
              <input
                type="text"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="例: ブラジル No.2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">作業名</label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="例: ハンドピック"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">目標量 (任意)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="数値"
                  step="0.1"
                  min="0"
                />
                <select
                  value={formData.targetUnit}
                  onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                >
                  <option value="">単位なし</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="個">個</option>
                  <option value="枚">枚</option>
                  <option value="袋">袋</option>
                  <option value="箱">箱</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                ※ 数値と単位を入力すると進捗バーが表示されます（例: 10kg）。<br />
                ※ 空欄の場合は完成数のみをカウントするモードになります。
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">メモ (任意)</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-gray-900 bg-white"
                rows={3}
                placeholder="備考があれば入力してください"
              />
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">状態</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkProgressStatus })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                >
                  <option value="pending">作業前</option>
                  <option value="in_progress">作業中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={onDelete}
                className="!bg-red-50 !text-red-600 hover:!bg-red-100 !rounded-xl"
                title="削除"
              >
                <HiTrash className="h-5 w-5" />
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="flex-1 shadow-md hover:shadow-lg !rounded-xl"
            >
              {isSubmitting ? '保存中...' : (isEditing ? '更新する' : '追加する')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

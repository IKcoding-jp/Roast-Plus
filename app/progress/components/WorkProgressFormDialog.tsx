'use client';

import { useState } from 'react';
import { HiX, HiTrash } from 'react-icons/hi';
import { Button, IconButton, Input, Select, Textarea } from '@/components/ui';
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
      <div className="bg-overlay rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-edge">
        <div className="px-6 py-4 border-b border-edge flex justify-between items-center bg-ground">
          <h3 className="font-bold text-ink text-lg">
            {isEditing ? '作業を編集' : '新しい作業を追加'}
          </h3>
          <IconButton variant="ghost" size="md" rounded onClick={onClose} aria-label="閉じる">
            <HiX className="h-5 w-5" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">
            <Input
              label="グループ名 (任意)"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              placeholder="例: ブラジル No.2"
            />

            <Input
              label="作業名"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              placeholder="例: ハンドピック"
              required
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-2">目標量 (任意)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="数値"
                  step="0.1"
                  min="0"
                  className="flex-1"
                />
                <Select
                  value={formData.targetUnit}
                  onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                  options={[
                    { value: '', label: '単位なし' },
                    { value: 'kg', label: 'kg' },
                    { value: 'g', label: 'g' },
                    { value: '個', label: '個' },
                    { value: '枚', label: '枚' },
                    { value: '袋', label: '袋' },
                    { value: '箱', label: '箱' },
                  ]}
                  className="w-28"
                />
              </div>
              <p className="text-xs text-ink-muted mt-1.5">
                ※ 数値と単位を入力すると進捗バーが表示されます（例: 10kg）。<br />
                ※ 空欄の場合は完成数のみをカウントするモードになります。
              </p>
            </div>

            <Textarea
              label="メモ (任意)"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              rows={3}
              placeholder="備考があれば入力してください"
            />

            {isEditing && (
              <Select
                label="状態"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkProgressStatus })}
                options={[
                  { value: 'pending', label: '作業前' },
                  { value: 'in_progress', label: '作業中' },
                  { value: 'completed', label: '完了' },
                ]}
              />
            )}
          </div>

          <div className="mt-8 flex gap-3">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={onDelete}
                className="!rounded-xl"
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

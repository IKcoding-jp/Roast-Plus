'use client';

import { Button } from '@/components/ui';

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">通知を削除</h3>
        <p className="text-gray-600 mb-6">
          この通知を削除してもよろしいですか？この操作は取り消せません。
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            キャンセル
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
          >
            削除
          </Button>
        </div>
      </div>
    </div>
  );
}

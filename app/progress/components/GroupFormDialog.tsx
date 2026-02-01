'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface GroupFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialGroupName?: string;
  isEditing?: boolean;
}

export function GroupFormDialog({
  isOpen, onClose, onSubmit, initialGroupName, isEditing
}: GroupFormDialogProps) {
  const [groupName, setGroupName] = useState(initialGroupName || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">
            {isEditing ? 'グループ名を編集' : '新しいグループを作成'}
          </h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (groupName.trim()) onSubmit(groupName);
          }}
          className="p-6"
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">グループ名</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
              placeholder="例: ブラジル No.2"
              autoFocus
              required
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1 !rounded-xl"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!groupName.trim()}
              className="flex-1 shadow-md !rounded-xl"
            >
              {isEditing ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

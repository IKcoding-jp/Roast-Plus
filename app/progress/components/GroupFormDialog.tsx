'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

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
      <div className="bg-overlay rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in border border-edge">
        <div className="px-6 py-4 border-b border-edge bg-ground">
          <h3 className="font-bold text-ink text-lg">
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
            <Input
              label="グループ名"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
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

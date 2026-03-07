'use client';

import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import type { Manager } from '@/types';
import { Button, Input, IconButton } from '@/components/ui';

interface ManagerDialogProps {
  isOpen: boolean;
  manager: Manager | null;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ManagerDialog({
  isOpen,
  manager,
  onClose,
  onSave,
  onDelete,
}: ManagerDialogProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ダイアログが開いたときに既存の管理者名をセット
  useEffect(() => {
    if (isOpen) {
      setName(manager?.name || '');
    }
  }, [isOpen, manager]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch (error) {
      console.error('Failed to save manager:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!manager) return;

    const confirmed = window.confirm('管理者を削除しますか？');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete manager:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && name.trim()) {
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-xl max-w-sm w-full mx-4 shadow-xl bg-overlay border border-edge overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="px-4 py-3 flex items-center justify-between bg-ground border-b border-edge">
          <h2 className="font-bold text-ink">
            {manager ? '管理者を編集' : '管理者を追加'}
          </h2>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="閉じる"
          >
            <MdClose size={20} />
          </IconButton>
        </div>

        {/* ボディ */}
        <div className="p-6">
          {/* 入力フォーム */}
          <div className="mb-6">
            <Input
              label="名前"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="管理者の名前を入力"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            {manager && (
              <Button
                variant="danger"
                size="md"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1"
              >
                削除
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
              loading={isLoading}
              className="flex-1"
            >
              {manager ? '更新' : '追加'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

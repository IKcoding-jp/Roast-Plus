'use client';

import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import type { Manager } from '@/types';
import { Button, Input } from '@/components/ui';

interface ManagerDialogProps {
  isOpen: boolean;
  manager: Manager | null;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
  isChristmasMode?: boolean;
}

export function ManagerDialog({
  isOpen,
  manager,
  onClose,
  onSave,
  onDelete,
  isChristmasMode = false,
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
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl ${
          isChristmasMode ? 'bg-[#0a2f1a] border border-[#d4af37]/30' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            {manager ? '管理者を編集' : '管理者を追加'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            isChristmasMode={isChristmasMode}
            className="!p-1 !min-h-0"
            aria-label="閉じる"
          >
            <HiX className="w-5 h-5" />
          </Button>
        </div>

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
            isChristmasMode={isChristmasMode}
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
              isChristmasMode={isChristmasMode}
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
            isChristmasMode={isChristmasMode}
            className="flex-1"
          >
            {manager ? '更新' : '追加'}
          </Button>
        </div>
      </div>
    </div>
  );
}


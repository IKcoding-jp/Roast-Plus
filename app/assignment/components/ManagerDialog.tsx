'use client';

import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import type { Manager } from '@/types';

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
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {manager ? '管理者を編集' : '管理者を追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
            aria-label="閉じる"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* 入力フォーム */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="管理者の名前を入力"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            autoFocus
            disabled={isLoading}
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          {manager && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              削除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '保存中...' : manager ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}


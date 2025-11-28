'use client';

import React, { useState } from 'react';
import type { WorkProgress } from '@/types';
import { extractUnit } from '@/lib/workProgress';
import { HiX } from 'react-icons/hi';

interface Props {
  workProgress: WorkProgress;
  onSave: (amount: number, memo?: string) => void;
  onCancel: () => void;
}

export default function ProgressInputDialog({ workProgress, onSave, onCancel }: Props) {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const unit = workProgress.goal.unit || extractUnit(workProgress.weight) || (workProgress.goal.mode === 'count' ? '個' : '');
  const isTarget = workProgress.goal.mode === 'target';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!Number.isNaN(numAmount) && numAmount !== 0) {
      onSave(numAmount, memo.trim() || undefined);
    }
  };

  const step = unit.toLowerCase() === 'kg' ? '0.1' : '1';

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {isTarget ? '進捗を増減' : '完了数を増減'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isTarget ? `進捗量の増減（${unit}）` : '完了数の増減'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={step}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder={isTarget ? `例: +50${unit} または -10${unit}` : '例: +10 または -5'}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              正の値で増加、負の値で減少します。
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メモ（任意）</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px] text-gray-900"
              placeholder="メモを入力してください"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] min-w-[44px]"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] min-w-[44px]"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

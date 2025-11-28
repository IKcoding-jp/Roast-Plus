'use client';

import React from 'react';
import type { WorkProgressStatus } from '@/types';
import { HiX } from 'react-icons/hi';

type SortOption = 'createdAt' | 'taskName' | 'status';

interface Props {
  sortOption: SortOption;
  filterTaskName: string;
  filterStatus: WorkProgressStatus | 'all';
  onSortChange: (option: SortOption) => void;
  onFilterTaskNameChange: (name: string) => void;
  onFilterStatusChange: (status: WorkProgressStatus | 'all') => void;
  onClose: () => void;
}

export default function FilterSortDialog({
  sortOption,
  filterTaskName,
  filterStatus,
  onSortChange,
  onFilterTaskNameChange,
  onFilterStatusChange,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">フィルタ・並び替え</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
            >
              <option value="createdAt">作成日時（新しい順）</option>
              <option value="taskName">作業名（あいうえお順）</option>
              <option value="status">状態（前→途中→済）</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterTaskName" className="block text-sm font-medium text-gray-700 mb-2">
              作業名でフィルタ
            </label>
            <input
              type="text"
              id="filterTaskName"
              value={filterTaskName}
              onChange={(e) => onFilterTaskNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="作業名を入力"
            />
          </div>
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
              状態でフィルタ
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value as WorkProgressStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
            >
              <option value="all">すべて</option>
              <option value="pending">前（未着手）</option>
              <option value="in_progress">途中</option>
              <option value="completed">済（完了）</option>
            </select>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] min-w-[44px]"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

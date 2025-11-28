'use client';

import React from 'react';
import type { WorkProgress, WorkProgressStatus } from '@/types';
import { progressPercentage, remainingAmount, formatAmount, extractUnit } from '@/lib/workProgress';
import { HiPencil, HiArchive, HiOutlineCollection, HiChevronDown, HiChevronUp, HiPlus } from 'react-icons/hi';

interface Props {
  workProgress: WorkProgress;
  onEdit: () => void;
  onAddProgress: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onStatusChange: (status: WorkProgressStatus) => void;
  isHistoryOpen: boolean;
  toggleHistory: () => void;
}

export default function WorkProgressCard({
  workProgress,
  onEdit,
  onAddProgress,
  onArchive,
  onUnarchive,
  onStatusChange,
  isHistoryOpen,
  toggleHistory,
}: Props) {
  const isTarget = workProgress.goal.mode === 'target';
  const unit = workProgress.goal.unit || extractUnit(workProgress.weight);
  const percent = progressPercentage(workProgress);
  const remaining = remainingAmount(workProgress);

  const statusLabel = (status: WorkProgressStatus) => {
    switch (status) {
      case 'pending':
        return '前';
      case 'in_progress':
        return '途中';
      case 'completed':
        return '済';
    }
  };

  const statusClass = (status: WorkProgressStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-300';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-400';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">{workProgress.groupName || 'グループ未設定'}</p>
          <h3 className="text-lg font-semibold text-gray-900 break-words">{workProgress.taskName || '無題の作業'}</h3>
          {workProgress.memo && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{workProgress.memo}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 text-sm rounded-full border ${statusClass(workProgress.status)}`}>
            {statusLabel(workProgress.status)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-gray-100 min-h-[40px] min-w-[40px]"
              aria-label="編集"
            >
              <HiPencil className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={onAddProgress}
              className="p-2 rounded-full hover:bg-gray-100 min-h-[40px] min-w-[40px]"
              aria-label="進捗を追加"
            >
              <HiPlus className="h-5 w-5 text-amber-700" />
            </button>
            {workProgress.archivedAt ? (
              <button
                onClick={onUnarchive}
                className="p-2 rounded-full hover:bg-gray-100 min-h-[40px] min-w-[40px]"
                aria-label="アーカイブ解除"
              >
                <HiOutlineCollection className="h-5 w-5 text-gray-700" />
              </button>
            ) : (
              <button
                onClick={onArchive}
                className="p-2 rounded-full hover:bg-gray-100 min-h-[40px] min-w-[40px]"
                aria-label="アーカイブ"
              >
                <HiArchive className="h-5 w-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isTarget ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>
              {formatAmount(workProgress.progress.currentAmount || 0, unit)}{unit} / {formatAmount(workProgress.goal.targetAmount || 0, unit)}{unit}
            </span>
            {remaining !== null && <span className="text-gray-500">残り {formatAmount(Math.max(remaining, 0), unit)}{unit}</span>}
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${percent >= 90 ? 'bg-green-600' : percent >= 50 ? 'bg-amber-600' : 'bg-gray-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          完了数: {formatAmount(workProgress.progress.completedCount || 0, unit)}{unit}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        <button
          onClick={() => onStatusChange('pending')}
          className={`px-2 py-1 rounded border ${workProgress.status === 'pending' ? 'border-amber-400 text-amber-700' : 'border-gray-200'}`}
        >
          前へ戻す
        </button>
        <button
          onClick={() => onStatusChange('in_progress')}
          className={`px-2 py-1 rounded border ${workProgress.status === 'in_progress' ? 'border-amber-400 text-amber-700' : 'border-gray-200'}`}
        >
          途中にする
        </button>
        <button
          onClick={() => onStatusChange('completed')}
          className={`px-2 py-1 rounded border ${workProgress.status === 'completed' ? 'border-amber-400 text-amber-700' : 'border-gray-200'}`}
        >
          完了にする
        </button>
      </div>

      {workProgress.progress.history && workProgress.progress.history.length > 0 && (
        <div className="border-t border-gray-100 pt-2">
          <button
            onClick={toggleHistory}
            className="flex items-center gap-1 text-sm text-gray-700"
          >
            {isHistoryOpen ? <HiChevronUp /> : <HiChevronDown />}
            履歴を{isHistoryOpen ? '隠す' : '表示'}
          </button>
          {isHistoryOpen && (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {workProgress.progress.history
                ?.slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((h) => (
                  <li key={h.id} className="flex justify-between">
                    <span>{new Date(h.date).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-medium">{h.amount > 0 ? '+' : ''}{h.amount}{unit}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

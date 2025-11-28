'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { WorkProgress, WorkProgressStatus } from '@/types';
import { WorkProgressDraft } from '@/lib/workProgressRepository';
import { extractTargetAmount, extractUnit } from '@/lib/workProgress';
import { HiX } from 'react-icons/hi';

interface Props {
  workProgress?: WorkProgress;
  initialGroupName?: string;
  existingGroups?: string[];
  onSave: (draft: WorkProgressDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

type ProgressType = 'target' | 'count' | 'unset';

const AVAILABLE_UNITS = ['kg', '個', '枚', '本', '箱', '袋', 'パック', 'セット'];

export default function WorkProgressForm({
  workProgress,
  initialGroupName,
  existingGroups = [],
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const [groupName, setGroupName] = useState(workProgress?.groupName || initialGroupName || '');
  const [taskName, setTaskName] = useState(workProgress?.taskName || '');
  const [status, setStatus] = useState<WorkProgressStatus>(workProgress?.status || 'pending');
  const [memo, setMemo] = useState(workProgress?.memo || '');
  const [progressType, setProgressType] = useState<ProgressType>(workProgress?.goal.mode || 'unset');
  const [weightAmount, setWeightAmount] = useState(() => {
    if (workProgress?.goal.mode === 'target' && workProgress.goal.targetAmount !== undefined) {
      return workProgress.goal.targetAmount.toString();
    }
    const derived = extractTargetAmount(workProgress?.weight);
    return derived !== undefined ? derived.toString() : '';
  });
  const [weightUnit, setWeightUnit] = useState(() => workProgress?.goal.unit || extractUnit(workProgress?.weight) || 'kg');
  const [completedCount, setCompletedCount] = useState(() =>
    workProgress?.progress.completedCount !== undefined ? workProgress.progress.completedCount.toString() : ''
  );
  const [completedUnit, setCompletedUnit] = useState(() => workProgress?.goal.unit || extractUnit(workProgress?.weight) || '個');

  useEffect(() => {
    if (workProgress) {
      setProgressType(workProgress.goal.mode);
    }
  }, [workProgress]);

  const availableGroups = useMemo(() => {
    const set = new Set(existingGroups.filter(Boolean));
    if (workProgress?.groupName) set.add(workProgress.groupName);
    if (initialGroupName) set.add(initialGroupName);
    return Array.from(set);
  }, [existingGroups, workProgress?.groupName, initialGroupName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const draft: WorkProgressDraft = {
      groupName: groupName.trim() || undefined,
      taskName: taskName.trim(),
      memo: memo.trim() || undefined,
      status,
      weight: undefined,
      goal: { mode: progressType },
      progress: {},
    };

    if (progressType === 'target') {
      const amountNum = parseFloat(weightAmount);
      if (!Number.isNaN(amountNum) && amountNum >= 0) {
        draft.goal = {
          mode: 'target',
          targetAmount: amountNum,
          unit: weightUnit,
        };
        draft.progress = { currentAmount: workProgress?.progress.currentAmount ?? 0 };
        draft.weight = `${amountNum}${weightUnit}`;
      }
    } else if (progressType === 'count') {
      const countNum = parseFloat(completedCount || '0');
      if (!Number.isNaN(countNum) && countNum >= 0) {
        draft.goal = {
          mode: 'count',
          unit: completedUnit,
        };
        draft.progress = { completedCount: countNum };
        draft.weight = `${countNum}${completedUnit}`;
      }
    } else {
      draft.goal = { mode: 'unset' };
      draft.progress = {};
      draft.weight = undefined;
    }

    onSave(draft);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {workProgress ? '作業を編集' : '作業を追加'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">グループ名（任意）</label>
            <input
              list="group-suggestions"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="例: 梱包"
            />
            <datalist id="group-suggestions">
              {availableGroups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作業名<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 min-h-[44px] text-gray-900 border-gray-300 focus:ring-amber-500"
              placeholder="例: シール貼り"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">進捗管理方式</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="progressType"
                  value="unset"
                  checked={progressType === 'unset'}
                  onChange={() => setProgressType('unset')}
                  className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">未選択（状態のみ管理）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="progressType"
                  value="target"
                  checked={progressType === 'target'}
                  onChange={() => setProgressType('target')}
                  className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">目標量で管理（進捗バー表示）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="progressType"
                  value="count"
                  checked={progressType === 'count'}
                  onChange={() => setProgressType('count')}
                  className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">完了数で管理</span>
              </label>
            </div>
          </div>

          {progressType === 'target' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">数量（目標量）</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weightAmount}
                  onChange={(e) => setWeightAmount(e.target.value)}
                  step="0.1"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
                  placeholder="例: 200"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
                >
                  {AVAILABLE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {progressType === 'count' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">完了数（初期値）</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={completedCount}
                  onChange={(e) => setCompletedCount(e.target.value)}
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
                  placeholder="例: 0"
                />
                <select
                  value={completedUnit}
                  onChange={(e) => setCompletedUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
                >
                  {AVAILABLE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状態</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkProgressStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
            >
              <option value="pending">前（未着手）</option>
              <option value="in_progress">途中</option>
              <option value="completed">済（完了）</option>
            </select>
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

          <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
            {workProgress && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors min-h-[44px] min-w-[44px]"
              >
                削除
              </button>
            )}
            <div className="flex gap-3 ml-auto">
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
                {workProgress ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

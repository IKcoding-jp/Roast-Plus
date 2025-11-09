'use client';

import { useState, useEffect } from 'react';
import type { TaskLabel, AppData } from '@/types';
import {
  addTaskLabel,
  updateTaskLabel,
  deleteTaskLabel,
  getTaskLabels,
} from '@/lib/firestore';

type TaskLabelManagementProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

export default function TaskLabelManagement({
  data,
  onUpdate,
}: TaskLabelManagementProps) {
  const taskLabels = getTaskLabels(data);

  // 既存のラベルを表示用のstateに反映
  const [labelInputs, setLabelInputs] = useState<
    Array<{ id: string; leftLabel: string; rightLabel: string }>
  >([]);

  useEffect(() => {
    // 初回マウント時のみ既存のラベルを入力欄に反映
    if (labelInputs.length === 0 && taskLabels.length > 0) {
      setLabelInputs(
        taskLabels.map((label) => ({
          id: label.id,
          leftLabel: label.leftLabel,
          rightLabel: label.rightLabel || '',
        }))
      );
    }
    // ラベルが追加された場合のみ追加
    else if (taskLabels.length > labelInputs.length) {
      const currentIds = new Set(labelInputs.map((input) => input.id));
      const newLabels = taskLabels
        .filter((label) => !currentIds.has(label.id))
        .map((label) => ({
          id: label.id,
          leftLabel: label.leftLabel,
          rightLabel: label.rightLabel || '',
        }));

      if (newLabels.length > 0) {
        setLabelInputs((prev) => [...prev, ...newLabels]);
      }
    }
  }, [taskLabels.length]); // ラベルの数が変わった時のみ更新

  const handleAddInputRow = () => {
    // 新しい入力欄を追加（空のラベルを作成）
    const newLabelId = crypto.randomUUID();
    const newLabel: TaskLabel = {
      id: newLabelId,
      leftLabel: '',
      rightLabel: null,
    };

    const updated = addTaskLabel(data, newLabel);
    onUpdate(updated);

    // 入力欄を追加
    setLabelInputs((prev) => [
      ...prev,
      { id: newLabelId, leftLabel: '', rightLabel: '' },
    ]);
  };

  const handleInputChange = (
    labelId: string,
    field: 'leftLabel' | 'rightLabel',
    value: string
  ) => {
    // 入力欄のstateを更新
    setLabelInputs((prev) =>
      prev.map((input) =>
        input.id === labelId ? { ...input, [field]: value } : input
      )
    );
  };

  const handleInputBlur = (labelId: string) => {
    const input = labelInputs.find((input) => input.id === labelId);
    if (!input) return;

    // 左ラベルが空の場合は何もしない（削除は明示的な削除ボタンでのみ）
    if (!input.leftLabel.trim()) {
      return;
    }

    // ラベルを更新
    const updated = updateTaskLabel(data, labelId, {
      leftLabel: input.leftLabel.trim(),
      rightLabel: input.rightLabel.trim() || null,
    });
    onUpdate(updated);
  };

  const handleDelete = (labelId: string) => {
    if (!confirm('この作業ラベルを削除しますか？')) return;

    const updated = deleteTaskLabel(data, labelId);
    onUpdate(updated);
    setLabelInputs((prev) => prev.filter((input) => input.id !== labelId));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">作業ラベル管理</h2>
      </div>

      <div className="space-y-3 mb-4">
        {labelInputs.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">作業ラベルがありません。「入力欄を追加」ボタンで追加してください。</p>
        ) : (
          labelInputs.map((input) => (
            <div
              key={input.id}
              className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200"
            >
              <input
                type="text"
                value={input.leftLabel}
                onChange={(e) =>
                  handleInputChange(input.id, 'leftLabel', e.target.value)
                }
                onBlur={() => handleInputBlur(input.id)}
                placeholder="左ラベル（例：掃除機）"
                className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={input.rightLabel}
                onChange={(e) =>
                  handleInputChange(input.id, 'rightLabel', e.target.value)
                }
                onBlur={() => handleInputBlur(input.id)}
                placeholder="右ラベル（任意、例：ロースト）"
                className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => handleDelete(input.id)}
                className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleAddInputRow}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white text-sm sm:text-base rounded hover:bg-amber-700 transition-colors"
        >
          入力欄を追加
        </button>
      </div>
    </div>
  );
}

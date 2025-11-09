'use client';

import { useState, useEffect } from 'react';
import type { AppData, TaskLabel } from '@/types';

interface TaskLabelManagementProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
}

export function TaskLabelManagement({ data, onUpdate }: TaskLabelManagementProps) {
  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const taskLabels = data.taskLabels;
  const [localLabels, setLocalLabels] = useState<
    Array<{ id: string; leftLabel: string; rightLabel: string }>
  >([]);

  useEffect(() => {
    if (localLabels.length === 0 && taskLabels.length > 0) {
      setLocalLabels(
        taskLabels.map((l) => ({
          id: l.id,
          leftLabel: l.leftLabel,
          rightLabel: l.rightLabel || '',
        }))
      );
    } else if (taskLabels.length > localLabels.length) {
      const existingIds = new Set(localLabels.map((l) => l.id));
      const newLabels = taskLabels
        .filter((l) => !existingIds.has(l.id))
        .map((l) => ({
          id: l.id,
          leftLabel: l.leftLabel,
          rightLabel: l.rightLabel || '',
        }));
      if (newLabels.length > 0) {
        setLocalLabels((prev) => [...prev, ...newLabels]);
      }
    }
  }, [taskLabels.length]);

  const updateLabel = (labelId: string, field: 'leftLabel' | 'rightLabel', value: string) => {
    setLocalLabels((prev) =>
      prev.map((l) => (l.id === labelId ? { ...l, [field]: value } : l))
    );
  };

  const saveLabel = (labelId: string) => {
    const label = localLabels.find((l) => l.id === labelId);
    if (label && label.leftLabel.trim()) {
      const updatedData: AppData = {
        ...data,
        taskLabels: data.taskLabels.map((l) =>
          l.id === labelId
            ? {
                ...l,
                leftLabel: label.leftLabel.trim(),
                rightLabel: label.rightLabel.trim() || null,
              }
            : l
        ),
      };
      onUpdate(updatedData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">作業ラベル管理</h2>
      </div>
      <div className="space-y-3 mb-4">
        {localLabels.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            作業ラベルがありません。「入力欄を追加」ボタンで追加してください。
          </p>
        ) : (
          localLabels.map((label) => (
            <div
              key={label.id}
              className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200"
            >
              <input
                type="text"
                value={label.leftLabel}
                onChange={(e) => updateLabel(label.id, 'leftLabel', e.target.value)}
                onBlur={() => saveLabel(label.id)}
                placeholder="左ラベル（例：掃除機）"
                className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={label.rightLabel}
                onChange={(e) => updateLabel(label.id, 'rightLabel', e.target.value)}
                onBlur={() => saveLabel(label.id)}
                placeholder="右ラベル（任意、例：ロースト）"
                className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => {
                  if (confirm('この作業ラベルを削除しますか？')) {
                    const updatedData: AppData = {
                      ...data,
                      taskLabels: data.taskLabels.filter((l) => l.id !== label.id),
                      assignments: data.assignments.filter((a) => a.taskLabelId !== label.id),
                      assignmentHistory: data.assignmentHistory.filter(
                        (a) => a.taskLabelId !== label.id
                      ),
                    };
                    onUpdate(updatedData);
                    setLocalLabels((prev) => prev.filter((l) => l.id !== label.id));
                  }
                }}
                className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={() => {
            const newLabel: TaskLabel = {
              id: crypto.randomUUID(),
              leftLabel: '',
              rightLabel: null,
            };
            const updatedData: AppData = {
              ...data,
              taskLabels: [...data.taskLabels, newLabel],
            };
            onUpdate(updatedData);
            setLocalLabels((prev) => [
              ...prev,
              {
                id: newLabel.id,
                leftLabel: '',
                rightLabel: '',
              },
            ]);
          }}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white text-sm sm:text-base rounded hover:bg-amber-700 transition-colors flex items-center justify-center"
        >
          入力欄を追加
        </button>
      </div>
    </div>
  );
}

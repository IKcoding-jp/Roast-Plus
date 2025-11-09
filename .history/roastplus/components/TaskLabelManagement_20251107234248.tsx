'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { addTaskLabel, updateTaskLabel, deleteTaskLabel } from '@/lib/firestore';
import type { AppData, TaskLabel } from '@/types';

interface TaskLabelManagementProps {
  data: AppData | null;
}

export function TaskLabelManagement({ data }: TaskLabelManagementProps) {
  const { user } = useAuth();
  const [leftLabelNames, setLeftLabelNames] = useState<{ [labelId: string]: string }>({});
  const [rightLabelNames, setRightLabelNames] = useState<{ [labelId: string]: string }>({});

  const handleAddLabel = async () => {
    if (!user || !data) return;
    
    const newLabel: TaskLabel = {
      id: `label-${Date.now()}`,
      leftLabel: '', // 空文字列で開始
      rightLabel: undefined, // 空の場合はundefined
      order: data.taskLabels.length,
    };
    
    await addTaskLabel(user.uid, newLabel);
  };

  const handleUpdateLeftLabel = async (labelId: string, leftLabel: string) => {
    if (!user) return;
    await updateTaskLabel(user.uid, labelId, { leftLabel });
  };

  const handleUpdateRightLabel = async (labelId: string, rightLabel: string) => {
    if (!user) return;
    await updateTaskLabel(user.uid, labelId, { rightLabel: rightLabel.trim() || undefined });
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!user) return;
    if (confirm('このラベルを削除しますか？')) {
      await deleteTaskLabel(user.uid, labelId);
    }
  };

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const labels = [...data.taskLabels].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h2 className="mb-4 text-lg font-bold text-gray-800">作業ラベル管理</h2>
      <div className="space-y-3">
        {labels.map(label => (
          <div key={label.id} className="flex items-center gap-2">
            {/* 左ラベル入力 */}
            <input
              type="text"
              placeholder="左ラベル"
              value={leftLabelNames[label.id] ?? label.leftLabel ?? ''}
              onChange={(e) => {
                setLeftLabelNames({ ...leftLabelNames, [label.id]: e.target.value });
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleUpdateLeftLabel(label.id, e.target.value.trim());
                }
              }}
              className="w-1/2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#F97316] focus:outline-none"
            />
            
            {/* 右ラベル入力 */}
            <input
              type="text"
              placeholder="右ラベル (任意、例:ロースト)"
              value={rightLabelNames[label.id] ?? label.rightLabel ?? ''}
              onChange={(e) => {
                setRightLabelNames({ ...rightLabelNames, [label.id]: e.target.value });
              }}
              onBlur={(e) => {
                handleUpdateRightLabel(label.id, e.target.value);
              }}
              className="w-1/2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#F97316] focus:outline-none"
            />
            
            {/* 削除ボタン */}
            <button
              onClick={() => handleDeleteLabel(label.id)}
              className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 whitespace-nowrap"
            >
              削除
            </button>
          </div>
        ))}
        <button
          onClick={handleAddLabel}
          className="w-full rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white hover:bg-[#EA580C]"
        >
          入力欄を追加
        </button>
      </div>
    </div>
  );
}


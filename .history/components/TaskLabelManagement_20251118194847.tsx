'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [headerTextLeft, setHeaderTextLeft] = useState(
    data.userSettings?.taskLabelHeaderTextLeft || '作業ラベル'
  );
  const [headerTextRight, setHeaderTextRight] = useState(
    data.userSettings?.taskLabelHeaderTextRight || '作業ラベル'
  );

  // 入力中かどうかを追跡するフラグ
  const [isEditingLeft, setIsEditingLeft] = useState(false);
  const [isEditingRight, setIsEditingRight] = useState(false);

  // デバウンス用のタイマー
  const saveTimeoutLeftRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRightRef = useRef<NodeJS.Timeout | null>(null);

  // ヘッダーテキストを保存する関数（最新のdataを参照するため、useCallbackを使わない）
  const saveHeaderTextLeft = (value: string) => {
    // 最新のdataを参照するため、関数内でdataを参照
    const currentData = data;
    const updatedData: AppData = {
      ...currentData,
      userSettings: {
        ...currentData.userSettings,
        taskLabelHeaderTextLeft: value.trim() || undefined,
      },
    };
    onUpdate(updatedData);
  };

  const saveHeaderTextRight = (value: string) => {
    // 最新のdataを参照するため、関数内でdataを参照
    const currentData = data;
    const updatedData: AppData = {
      ...currentData,
      userSettings: {
        ...currentData.userSettings,
        taskLabelHeaderTextRight: value.trim() || undefined,
      },
    };
    onUpdate(updatedData);
  };

  // userSettingsの変更を反映（入力中でない場合のみ）
  useEffect(() => {
    if (!isEditingLeft) {
      const newHeaderTextLeft = data.userSettings?.taskLabelHeaderTextLeft || '作業ラベル';
      setHeaderTextLeft(newHeaderTextLeft);
    }
  }, [data.userSettings?.taskLabelHeaderTextLeft, isEditingLeft]);

  useEffect(() => {
    if (!isEditingRight) {
      const newHeaderTextRight = data.userSettings?.taskLabelHeaderTextRight || '作業ラベル';
      setHeaderTextRight(newHeaderTextRight);
    }
  }, [data.userSettings?.taskLabelHeaderTextRight, isEditingRight]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (saveTimeoutLeftRef.current) {
        clearTimeout(saveTimeoutLeftRef.current);
      }
      if (saveTimeoutRightRef.current) {
        clearTimeout(saveTimeoutRightRef.current);
      }
    };
  }, []);

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
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="mb-4">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
            担当表のヘッダー表記
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                左側のヘッダー
              </label>
              <input
                type="text"
                value={headerTextLeft}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setHeaderTextLeft(newValue);
                  setIsEditingLeft(true);
                  // 既存のタイマーをクリア
                  if (saveTimeoutLeftRef.current) {
                    clearTimeout(saveTimeoutLeftRef.current);
                  }
                  // デバウンス付きで保存（500ms後）
                  saveTimeoutLeftRef.current = setTimeout(() => {
                    saveHeaderTextLeft(newValue);
                  }, 500);
                }}
                onBlur={() => {
                  setIsEditingLeft(false);
                  // 既存のタイマーをクリアして即座に保存
                  if (saveTimeoutLeftRef.current) {
                    clearTimeout(saveTimeoutLeftRef.current);
                    saveTimeoutLeftRef.current = null;
                  }
                  saveHeaderTextLeft(headerTextLeft);
                }}
                placeholder="作業ラベル"
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                右側のヘッダー
              </label>
              <input
                type="text"
                value={headerTextRight}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setHeaderTextRight(newValue);
                  setIsEditingRight(true);
                  // 既存のタイマーをクリア
                  if (saveTimeoutRightRef.current) {
                    clearTimeout(saveTimeoutRightRef.current);
                  }
                  // デバウンス付きで保存（500ms後）
                  saveTimeoutRightRef.current = setTimeout(() => {
                    saveHeaderTextRight(newValue);
                  }, 500);
                }}
                onBlur={() => {
                  setIsEditingRight(false);
                  // 既存のタイマーをクリアして即座に保存
                  if (saveTimeoutRightRef.current) {
                    clearTimeout(saveTimeoutRightRef.current);
                    saveTimeoutRightRef.current = null;
                  }
                  saveHeaderTextRight(headerTextRight);
                }}
                placeholder="作業ラベル"
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            担当表の「作業ラベル」という表記を左と右で個別に変更できます。空欄の場合は「作業ラベル」が表示されます。
          </p>
        </div>
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
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={label.rightLabel}
                onChange={(e) => updateLabel(label.id, 'rightLabel', e.target.value)}
                onBlur={() => saveLabel(label.id)}
                placeholder="右ラベル（任意、例：ロースト）"
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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

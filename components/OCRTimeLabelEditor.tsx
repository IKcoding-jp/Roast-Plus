'use client';

import { useState } from 'react';
import type { TimeLabel } from '@/types';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

interface OCRTimeLabelEditorProps {
  timeLabels: TimeLabel[];
  onUpdate: (timeLabels: TimeLabel[]) => void;
  onDelete: (id: string) => void;
}

export function OCRTimeLabelEditor({
  timeLabels,
  onUpdate,
  onDelete,
}: OCRTimeLabelEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<{ hour: string; minute: string }>({ hour: '', minute: '' });
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingMemo, setEditingMemo] = useState<string>('');

  const handleEdit = (label: TimeLabel) => {
    setEditingId(label.id);
    const [hour, minute] = (label.time || '').split(':');
    setEditingTime({ hour: hour || '', minute: minute || '' });
    setEditingContent(label.content || '');
    setEditingMemo(label.memo || '');
  };

  const handleSave = (id: string) => {
    if (!editingTime.hour) return;

    const formattedHour = editingTime.hour.padStart(2, '0');
    const formattedMinute = editingTime.minute ? editingTime.minute.padStart(2, '0') : '00';
    const newTime = `${formattedHour}:${formattedMinute}`;

    const updated = timeLabels.map((label) =>
      label.id === id
        ? {
            ...label,
            time: newTime,
            content: editingContent,
            memo: editingMemo,
          }
        : label
    );

    onUpdate(updated);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleAdd = () => {
    const newLabel: TimeLabel = {
      id: `ocr-time-${Date.now()}`,
      time: '',
      content: '',
      memo: '',
      order: timeLabels.length,
    };
    onUpdate([...timeLabels, newLabel]);
    handleEdit(newLabel);
  };

  // 時間順にソート
  const sortedLabels = [...timeLabels].sort((a, b) => {
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });

  return (
    <div className="space-y-3">
      {sortedLabels.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>スケジュールがありません</p>
        </div>
      ) : (
        sortedLabels.map((label) => {
          const isEditing = editingId === label.id;

          return (
            <div
              key={label.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              {isEditing ? (
                <div className="space-y-3">
                  {/* 時間編集 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      時間 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editingTime.hour}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                            setEditingTime({ ...editingTime, hour: value });
                          }
                        }}
                        min="0"
                        max="23"
                        required
                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="時"
                      />
                      <span className="text-gray-600">:</span>
                      <input
                        type="number"
                        value={editingTime.minute}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                            setEditingTime({ ...editingTime, minute: value });
                          }
                        }}
                        min="0"
                        max="59"
                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="分"
                      />
                    </div>
                  </div>

                  {/* 内容編集 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内容
                    </label>
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="内容を入力"
                    />
                  </div>

                  {/* メモ編集 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メモ
                    </label>
                    <textarea
                      value={editingMemo}
                      onChange={(e) => setEditingMemo(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      placeholder="メモを入力"
                    />
                  </div>

                  {/* 編集ボタン */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium min-h-[44px]"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleSave(label.id)}
                      disabled={!editingTime.hour}
                      className="px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {label.time || '--:--'}
                      </span>
                      {label.content && (
                        <span className="text-base text-gray-700">{label.content}</span>
                      )}
                    </div>
                    {label.memo && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{label.memo}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(label)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="編集"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(label.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="削除"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* 追加ボタン */}
      <button
        onClick={handleAdd}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
      >
        <HiPlus className="h-5 w-5" />
        <span>スケジュールを追加</span>
      </button>
    </div>
  );
}


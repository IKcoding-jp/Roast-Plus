'use client';

import { useState } from 'react';
import { HiX } from 'react-icons/hi';
import type { TimeLabel } from '@/types';

interface TimeEditDialogProps {
  initialHour: string;
  initialMinute: string;
  onSave: (hour: string, minute: string) => void;
  onCancel: () => void;
  labels: TimeLabel[];
  onDeleteLabel: (id: string) => void;
}

export function TimeEditDialog({
  initialHour,
  initialMinute,
  onSave,
  onCancel,
  labels,
  onDeleteLabel,
}: TimeEditDialogProps) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hour) return;
    onSave(hour, minute);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100] p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-gray-300" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-5 flex items-center justify-between">
          <h3 className="text-2xl md:text-2xl font-semibold text-gray-800">時間を編集</h3>
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-200 p-1.5 md:p-2.5 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-3 md:space-y-5 max-w-md mx-auto">
            {/* 時間選択 */}
            <div>
              <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700 text-center">
                時間 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <input
                  type="number"
                  value={hour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                      setHour(value);
                    }
                  }}
                  min="0"
                  max="23"
                  required
                  className="w-16 md:w-24 rounded-md border border-gray-300 px-2 md:px-4 py-1.5 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="時"
                />
                <span className="text-gray-600 text-base md:text-xl">:</span>
                <input
                  type="number"
                  value={minute}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setMinute(value);
                    }
                  }}
                  min="0"
                  max="59"
                  className="w-16 md:w-24 rounded-md border border-gray-300 px-2 md:px-4 py-1.5 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="分"
                />
              </div>
            </div>

            {/* この時間のラベル一覧（個別削除） */}
            {labels.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h4 className="text-base md:text-lg font-medium text-gray-800">この時間のラベル</h4>
                <div className="space-y-2">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center gap-2 md:gap-3 rounded-md border border-gray-200 px-3 py-2 bg-gray-50"
                    >
                      <div className="flex-1 text-sm md:text-base text-gray-800 truncate">
                        {label.content || '内容なし'}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteLabel(label.id)}
                        className="px-2 md:px-3 py-1 md:py-1.5 text-sm md:text-sm bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors min-h-[36px]"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="flex gap-2 md:gap-4 pt-3 md:pt-5 border-t border-gray-200 justify-center">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 md:px-5 py-1.5 md:py-2.5 text-base md:text-lg text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!hour}
                className="px-4 md:px-6 py-1.5 md:py-2.5 text-base md:text-lg bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

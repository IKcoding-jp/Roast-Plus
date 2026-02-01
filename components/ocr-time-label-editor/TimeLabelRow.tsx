'use client';

import type { TimeLabel } from '@/types';
import { HiPlus, HiTrash, HiPencil, HiUser, HiArrowDown } from 'react-icons/hi';
import type { useOCRTimeLabelEditor } from './useOCRTimeLabelEditor';

interface TimeLabelRowProps {
  label: TimeLabel;
  isEditing: boolean;
  editor: ReturnType<typeof useOCRTimeLabelEditor>;
  onDelete: (id: string) => void;
}

export function TimeLabelRow({ label, isEditing, editor, onDelete }: TimeLabelRowProps) {
  const {
    editingTime,
    setEditingTime,
    editingContent,
    setEditingContent,
    editingMemo,
    setEditingMemo,
    editingAssignee,
    setEditingAssignee,
    editingSubTasks,
    editingContinuesUntil,
    setEditingContinuesUntil,
    handleEdit,
    handleSave,
    handleCancel,
    handleAddSubTask,
    handleDeleteSubTask,
    handleUpdateSubTask,
  } = editor;

  return (
    <div
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

          {/* 担当者編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1.5">
                <HiUser className="h-4 w-4" />
                担当者
              </span>
            </label>
            <input
              type="text"
              value={editingAssignee}
              onChange={(e) => setEditingAssignee(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="例：浅田さん、小山さん"
            />
          </div>

          {/* 継続終了時間編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              継続終了時間（時間経過タスクの場合）
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">〜</span>
              <input
                type="number"
                value={editingContinuesUntil.hour}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                    setEditingContinuesUntil({ ...editingContinuesUntil, hour: value });
                  }
                }}
                min="0"
                max="23"
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="時"
              />
              <span className="text-gray-600">:</span>
              <input
                type="number"
                value={editingContinuesUntil.minute}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                    setEditingContinuesUntil({ ...editingContinuesUntil, minute: value });
                  }
                }}
                min="0"
                max="59"
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="分"
              />
              <span className="text-gray-500 text-sm">まで</span>
              {editingContinuesUntil.hour && (
                <button
                  type="button"
                  onClick={() => setEditingContinuesUntil({ hour: '', minute: '' })}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="継続終了時間をクリア"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* サブタスク編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <HiArrowDown className="h-4 w-4" />
                連続タスク（サブタスク）
              </span>
            </label>
            <div className="space-y-2 ml-4">
              {editingSubTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-400 text-sm mt-2">↓</span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={subTask.content}
                      onChange={(e) => handleUpdateSubTask(subTask.id, { content: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="タスク内容"
                    />
                    <input
                      type="text"
                      value={subTask.assignee || ''}
                      onChange={(e) => handleUpdateSubTask(subTask.id, { assignee: e.target.value || undefined })}
                      className="w-full rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="担当者（任意）"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubTask(subTask.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
                    aria-label="サブタスクを削除"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSubTask}
                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors py-1"
              >
                <HiPlus className="h-4 w-4" />
                サブタスクを追加
              </button>
            </div>
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
              {/* 継続終了時間 */}
              {label.continuesUntil && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  〜{label.continuesUntil}まで
                </span>
              )}
            </div>
            {/* 担当者表示 */}
            {label.assignee && (
              <div className="flex items-center gap-1.5 mb-2">
                <HiUser className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {label.assignee}
                </span>
              </div>
            )}
            {label.memo && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{label.memo}</p>
            )}
            {/* サブタスク表示 */}
            {label.subTasks && label.subTasks.length > 0 && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
                {label.subTasks
                  .sort((a, b) => a.order - b.order)
                  .map((subTask) => (
                    <div key={subTask.id} className="flex items-center gap-2">
                      <HiArrowDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{subTask.content}</span>
                      {subTask.assignee && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {subTask.assignee}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
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
}

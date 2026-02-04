'use client';

import type { TimeLabel } from '@/types';
import { HiPlus, HiTrash, HiPencil, HiUser, HiArrowDown } from 'react-icons/hi';
import type { useOCRTimeLabelEditor } from './useOCRTimeLabelEditor';
import { Button, IconButton } from '@/components/ui';

interface TimeLabelRowProps {
  label: TimeLabel;
  isEditing: boolean;
  editor: ReturnType<typeof useOCRTimeLabelEditor>;
  onDelete: (id: string) => void;
  isChristmasMode?: boolean;
}

export function TimeLabelRow({ label, isEditing, editor, onDelete, isChristmasMode = false }: TimeLabelRowProps) {
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

  // クリスマスモード用のスタイル定義
  const labelClass = `block text-sm font-medium mb-1 ${
    isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
  }`;
  const inputClass = `w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;
  const timeInputClass = `w-20 rounded-md border px-3 py-2 text-base text-center focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;

  return (
    <div
      className={`border rounded-lg p-4 transition-colors ${
        isChristmasMode
          ? 'border-[#d4af37]/30 bg-[#0a2f1a] hover:bg-[#0a2f1a]/80'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          {/* 時間編集 */}
          <div>
            <label className={labelClass}>
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
                className={timeInputClass}
                placeholder="時"
              />
              <span className={isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}>:</span>
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
                className={timeInputClass}
                placeholder="分"
              />
            </div>
          </div>

          {/* 内容編集 */}
          <div>
            <label className={labelClass}>内容</label>
            <input
              type="text"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className={inputClass}
              placeholder="内容を入力"
            />
          </div>

          {/* メモ編集 */}
          <div>
            <label className={labelClass}>メモ</label>
            <textarea
              value={editingMemo}
              onChange={(e) => setEditingMemo(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="メモを入力"
            />
          </div>

          {/* 担当者編集 */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <HiUser className="h-4 w-4" />
                担当者
              </span>
            </label>
            <input
              type="text"
              value={editingAssignee}
              onChange={(e) => setEditingAssignee(e.target.value)}
              className={inputClass}
              placeholder="例：浅田さん、小山さん"
            />
          </div>

          {/* 継続終了時間編集 */}
          <div>
            <label className={labelClass}>
              継続終了時間（時間経過タスクの場合）
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>〜</span>
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
                className={timeInputClass}
                placeholder="時"
              />
              <span className={isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}>:</span>
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
                className={timeInputClass}
                placeholder="分"
              />
              <span className={`text-sm ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>まで</span>
              {editingContinuesUntil.hour && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingContinuesUntil({ hour: '', minute: '' })}
                  isChristmasMode={isChristmasMode}
                  aria-label="継続終了時間をクリア"
                >
                  <HiTrash className="h-4 w-4" />
                </IconButton>
              )}
            </div>
          </div>

          {/* サブタスク編集 */}
          <div>
            <label className={`${labelClass} mb-2`}>
              <span className="flex items-center gap-1.5">
                <HiArrowDown className="h-4 w-4" />
                連続タスク（サブタスク）
              </span>
            </label>
            <div className="space-y-2 ml-4">
              {editingSubTasks.map((subTask) => (
                <div key={subTask.id} className={`flex items-start gap-2 p-2 rounded-md ${
                  isChristmasMode ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <span className={`text-sm mt-2 ${isChristmasMode ? 'text-[#f8f1e7]/40' : 'text-gray-400'}`}>↓</span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={subTask.content}
                      onChange={(e) => handleUpdateSubTask(subTask.id, { content: e.target.value })}
                      className={`w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${
                        isChristmasMode
                          ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
                          : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
                      }`}
                      placeholder="タスク内容"
                    />
                    <input
                      type="text"
                      value={subTask.assignee || ''}
                      onChange={(e) => handleUpdateSubTask(subTask.id, { assignee: e.target.value || undefined })}
                      className={`w-full rounded-md border px-3 py-1 text-xs focus:outline-none focus:ring-2 ${
                        isChristmasMode
                          ? 'border-[#d4af37]/30 bg-white/5 text-[#f8f1e7]/70 placeholder:text-[#f8f1e7]/30 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
                          : 'border-gray-200 text-gray-700 focus:border-amber-500 focus:ring-amber-500'
                      }`}
                      placeholder="担当者（任意）"
                    />
                  </div>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubTask(subTask.id)}
                    isChristmasMode={isChristmasMode}
                    className="text-red-500 mt-1"
                    aria-label="サブタスクを削除"
                  >
                    <HiTrash className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddSubTask}
                isChristmasMode={isChristmasMode}
              >
                <HiPlus className="h-4 w-4" />
                サブタスクを追加
              </Button>
            </div>
          </div>

          {/* 編集ボタン */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              isChristmasMode={isChristmasMode}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave(label.id)}
              disabled={!editingTime.hour}
              isChristmasMode={isChristmasMode}
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-lg font-semibold ${
                isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'
              }`}>
                {label.time || '--:--'}
              </span>
              {label.content && (
                <span className={`text-base ${
                  isChristmasMode ? 'text-[#f8f1e7]/80' : 'text-gray-700'
                }`}>{label.content}</span>
              )}
              {/* 継続終了時間 */}
              {label.continuesUntil && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isChristmasMode
                    ? 'text-[#d4af37] bg-[#d4af37]/20'
                    : 'text-amber-600 bg-amber-50'
                }`}>
                  〜{label.continuesUntil}まで
                </span>
              )}
            </div>
            {/* 担当者表示 */}
            {label.assignee && (
              <div className="flex items-center gap-1.5 mb-2">
                <HiUser className={`h-3.5 w-3.5 ${
                  isChristmasMode ? 'text-[#f8f1e7]/40' : 'text-gray-400'
                }`} />
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  isChristmasMode
                    ? 'text-[#f8f1e7]/70 bg-white/10'
                    : 'text-gray-500 bg-gray-100'
                }`}>
                  {label.assignee}
                </span>
              </div>
            )}
            {label.memo && (
              <p className={`text-sm whitespace-pre-wrap mb-2 ${
                isChristmasMode ? 'text-[#f8f1e7]/60' : 'text-gray-600'
              }`}>{label.memo}</p>
            )}
            {/* サブタスク表示 */}
            {label.subTasks && label.subTasks.length > 0 && (
              <div className={`ml-4 space-y-1 border-l-2 pl-3 ${
                isChristmasMode ? 'border-[#d4af37]/30' : 'border-gray-200'
              }`}>
                {label.subTasks
                  .sort((a, b) => a.order - b.order)
                  .map((subTask) => (
                    <div key={subTask.id} className="flex items-center gap-2">
                      <HiArrowDown className={`h-3.5 w-3.5 flex-shrink-0 ${
                        isChristmasMode ? 'text-[#f8f1e7]/40' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm ${
                        isChristmasMode ? 'text-[#f8f1e7]/80' : 'text-gray-700'
                      }`}>{subTask.content}</span>
                      {subTask.assignee && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isChristmasMode
                            ? 'text-[#f8f1e7]/60 bg-white/10'
                            : 'text-gray-500 bg-gray-100'
                        }`}>
                          {subTask.assignee}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <IconButton
              variant="ghost"
              size="md"
              onClick={() => handleEdit(label)}
              isChristmasMode={isChristmasMode}
              aria-label="編集"
            >
              <HiPencil className="h-5 w-5" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="md"
              onClick={() => onDelete(label.id)}
              isChristmasMode={isChristmasMode}
              className="text-red-500"
              aria-label="削除"
            >
              <HiTrash className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}

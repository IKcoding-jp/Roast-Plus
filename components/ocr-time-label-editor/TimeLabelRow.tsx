'use client';

import type { TimeLabel } from '@/types';
import { HiPlus, HiTrash, HiPencil, HiUser, HiArrowDown } from 'react-icons/hi';
import type { useOCRTimeLabelEditor } from './useOCRTimeLabelEditor';
import { Button, IconButton, Input, NumberInput, Textarea } from '@/components/ui';

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

  const labelClass = 'block text-sm font-medium mb-1 text-ink-sub';

  return (
    <div className="border rounded-lg p-4 transition-colors border-edge bg-surface hover:bg-ground">
      {isEditing ? (
        <div className="space-y-3">
          {/* 時間編集 */}
          <div>
            <label className={labelClass}>
              時間 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <NumberInput
                value={editingTime.hour}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                    setEditingTime(prev => ({ ...prev, hour: value }));
                  }
                }}
                min={0}
                max={23}
                required
                placeholder="時"
                className="w-20 text-center"
              />
              <span className="text-ink-sub">:</span>
              <NumberInput
                value={editingTime.minute}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                    setEditingTime(prev => ({ ...prev, minute: value }));
                  }
                }}
                min={0}
                max={59}
                placeholder="分"
                className="w-20 text-center"
              />
            </div>
          </div>

          {/* 内容編集 */}
          <div>
            <Input
              label="内容"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="内容を入力"
            />
          </div>

          {/* メモ編集 */}
          <div>
            <Textarea
              label="メモ"
              value={editingMemo}
              onChange={(e) => setEditingMemo(e.target.value)}
              rows={2}
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
            <Input
              value={editingAssignee}
              onChange={(e) => setEditingAssignee(e.target.value)}
              placeholder="例：浅田さん、小山さん"
            />
          </div>

          {/* 継続終了時間編集 */}
          <div>
            <label className={labelClass}>
              継続終了時間（時間経過タスクの場合）
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">〜</span>
              <NumberInput
                value={editingContinuesUntil.hour}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                    setEditingContinuesUntil(prev => ({ ...prev, hour: value }));
                  }
                }}
                min={0}
                max={23}
                placeholder="時"
                className="w-20 text-center"
              />
              <span className="text-ink-sub">:</span>
              <NumberInput
                value={editingContinuesUntil.minute}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                    setEditingContinuesUntil(prev => ({ ...prev, minute: value }));
                  }
                }}
                min={0}
                max={59}
                placeholder="分"
                className="w-20 text-center"
              />
              <span className="text-sm text-ink-muted">まで</span>
              {editingContinuesUntil.hour && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingContinuesUntil({ hour: '', minute: '' })}
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
                <div key={subTask.id} className="flex items-start gap-2 p-2 rounded-md bg-ground">
                  <span className="text-sm mt-2 text-ink-muted">↓</span>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={subTask.content}
                      onChange={(e) => handleUpdateSubTask(subTask.id, { content: e.target.value })}
                      placeholder="タスク内容"
                      className="!py-1.5 !text-sm"
                    />
                    <Input
                      value={subTask.assignee || ''}
                      onChange={(e) => handleUpdateSubTask(subTask.id, { assignee: e.target.value || undefined })}
                      placeholder="担当者（任意）"
                      className="!py-1 !text-xs"
                    />
                  </div>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubTask(subTask.id)}
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
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave(label.id)}
              disabled={!editingTime.hour}
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-ink">
                {label.time || '--:--'}
              </span>
              {label.content && (
                <span className="text-base text-ink-sub">{label.content}</span>
              )}
              {/* 継続終了時間 */}
              {label.continuesUntil && (
                <span className="text-xs px-2 py-0.5 rounded-full text-spot bg-spot-subtle">
                  〜{label.continuesUntil}まで
                </span>
              )}
            </div>
            {/* 担当者表示 */}
            {label.assignee && (
              <div className="flex items-center gap-1.5 mb-2">
                <HiUser className="h-3.5 w-3.5 text-ink-muted" />
                <span className="text-sm px-2 py-0.5 rounded-full text-ink-sub bg-ground">
                  {label.assignee}
                </span>
              </div>
            )}
            {label.memo && (
              <p className="text-sm whitespace-pre-wrap mb-2 text-ink-sub">{label.memo}</p>
            )}
            {/* サブタスク表示 */}
            {label.subTasks && label.subTasks.length > 0 && (
              <div className="ml-4 space-y-1 border-l-2 pl-3 border-edge">
                {label.subTasks
                  .sort((a, b) => a.order - b.order)
                  .map((subTask) => (
                    <div key={subTask.id} className="flex items-center gap-2">
                      <HiArrowDown className="h-3.5 w-3.5 flex-shrink-0 text-ink-muted" />
                      <span className="text-sm text-ink-sub">{subTask.content}</span>
                      {subTask.assignee && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full text-ink-muted bg-ground">
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
              aria-label="編集"
            >
              <HiPencil className="h-5 w-5" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="md"
              onClick={() => onDelete(label.id)}
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

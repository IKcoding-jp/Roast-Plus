import { useState } from 'react';
import type { TimeLabel, SubTask } from '@/types';

interface UseOCRTimeLabelEditorProps {
  timeLabels: TimeLabel[];
  onUpdate: (timeLabels: TimeLabel[]) => void;
}

export function useOCRTimeLabelEditor({ timeLabels, onUpdate }: UseOCRTimeLabelEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<{ hour: string; minute: string }>({ hour: '', minute: '' });
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingMemo, setEditingMemo] = useState<string>('');
  // 新フィールド用の状態
  const [editingAssignee, setEditingAssignee] = useState<string>('');
  const [editingSubTasks, setEditingSubTasks] = useState<SubTask[]>([]);
  const [editingContinuesUntil, setEditingContinuesUntil] = useState<{ hour: string; minute: string }>({ hour: '', minute: '' });

  const handleEdit = (label: TimeLabel) => {
    setEditingId(label.id);
    const [hour, minute] = (label.time || '').split(':');
    setEditingTime({ hour: hour || '', minute: minute || '' });
    setEditingContent(label.content || '');
    setEditingMemo(label.memo || '');
    // 新フィールド
    setEditingAssignee(label.assignee || '');
    setEditingSubTasks(label.subTasks || []);
    const [continuesHour, continuesMinute] = (label.continuesUntil || '').split(':');
    setEditingContinuesUntil({ hour: continuesHour || '', minute: continuesMinute || '' });
  };

  const handleSave = (id: string) => {
    if (!editingTime.hour) return;

    const formattedHour = editingTime.hour.padStart(2, '0');
    const formattedMinute = editingTime.minute ? editingTime.minute.padStart(2, '0') : '00';
    const newTime = `${formattedHour}:${formattedMinute}`;

    // continuesUntilのフォーマット
    let continuesUntilTime: string | undefined;
    if (editingContinuesUntil.hour) {
      const continuesHour = editingContinuesUntil.hour.padStart(2, '0');
      const continuesMinute = editingContinuesUntil.minute ? editingContinuesUntil.minute.padStart(2, '0') : '00';
      continuesUntilTime = `${continuesHour}:${continuesMinute}`;
    }

    const updated = timeLabels.map((label) =>
      label.id === id
        ? {
            ...label,
            time: newTime,
            content: editingContent,
            memo: editingMemo,
            // 新フィールド
            assignee: editingAssignee || undefined,
            subTasks: editingSubTasks.length > 0 ? editingSubTasks : undefined,
            continuesUntil: continuesUntilTime,
          }
        : label
    );

    onUpdate(updated);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // サブタスク追加
  const handleAddSubTask = () => {
    const newSubTask: SubTask = {
      id: `subtask-${Date.now()}`,
      content: '',
      order: editingSubTasks.length,
    };
    setEditingSubTasks([...editingSubTasks, newSubTask]);
  };

  // サブタスク削除
  const handleDeleteSubTask = (subTaskId: string) => {
    setEditingSubTasks(editingSubTasks.filter((st) => st.id !== subTaskId));
  };

  // サブタスク更新
  const handleUpdateSubTask = (subTaskId: string, updates: Partial<SubTask>) => {
    setEditingSubTasks(
      editingSubTasks.map((st) =>
        st.id === subTaskId ? { ...st, ...updates } : st
      )
    );
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

  return {
    editingId,
    editingTime,
    setEditingTime,
    editingContent,
    setEditingContent,
    editingMemo,
    setEditingMemo,
    editingAssignee,
    setEditingAssignee,
    editingSubTasks,
    setEditingSubTasks,
    editingContinuesUntil,
    setEditingContinuesUntil,
    handleEdit,
    handleSave,
    handleCancel,
    handleAddSubTask,
    handleDeleteSubTask,
    handleUpdateSubTask,
    handleAdd,
    sortedLabels,
  };
}

'use client';

import type { TimeLabel } from '@/types';
import { HiPlus } from 'react-icons/hi';
import { useOCRTimeLabelEditor } from './useOCRTimeLabelEditor';
import { TimeLabelRow } from './TimeLabelRow';

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
  const editor = useOCRTimeLabelEditor({ timeLabels, onUpdate });

  return (
    <div className="space-y-3">
      {editor.sortedLabels.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>スケジュールがありません</p>
        </div>
      ) : (
        editor.sortedLabels.map((label) => (
          <TimeLabelRow
            key={label.id}
            label={label}
            isEditing={editor.editingId === label.id}
            editor={editor}
            onDelete={onDelete}
          />
        ))
      )}

      {/* 追加ボタン */}
      <button
        onClick={editor.handleAdd}
        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-md"
      >
        <HiPlus className="h-5 w-5" />
        <span>スケジュールを追加</span>
      </button>
    </div>
  );
}

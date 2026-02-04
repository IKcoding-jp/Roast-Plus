'use client';

import { useState } from 'react';
import type { RoastSchedule } from '@/types';
import { HiPlus, HiTrash, HiPencil, HiFire } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { RoastScheduleMemoDialog } from './RoastScheduleMemoDialog';
import { Button, IconButton } from '@/components/ui';

interface OCRRoastScheduleEditorProps {
  roastSchedules: RoastSchedule[];
  selectedDate: string;
  onUpdate: (roastSchedules: RoastSchedule[]) => void;
  onDelete: (id: string) => void;
  isChristmasMode?: boolean;
}

export function OCRRoastScheduleEditor({
  roastSchedules,
  selectedDate,
  onUpdate,
  onDelete,
  isChristmasMode = false,
}: OCRRoastScheduleEditorProps) {
  const [editingSchedule, setEditingSchedule] = useState<RoastSchedule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (schedule: RoastSchedule) => {
    setEditingSchedule(schedule);
    setIsAdding(false);
  };

  const handleAdd = () => {
    const newSchedule: RoastSchedule = {
      id: `ocr-roast-${Date.now()}`,
      date: selectedDate,
      time: '',
      order: roastSchedules.length,
    };
    setEditingSchedule(newSchedule);
    setIsAdding(true);
  };

  const handleSave = (schedule: RoastSchedule) => {
    if (isAdding) {
      onUpdate([...roastSchedules, schedule]);
    } else {
      onUpdate(
        roastSchedules.map((s) => (s.id === schedule.id ? schedule : s))
      );
    }
    setEditingSchedule(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingSchedule(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  // 時間順にソート（アフターパージで時間が空の場合は前のローストの時間を参照）
  const sortedSchedules = [...roastSchedules].sort((a, b) => {
    // orderプロパティがある場合はそれを使用
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;

    // アフターパージで時間が空の場合の処理
    const timeA = a.time || '';
    const timeB = b.time || '';

    // 両方とも時間がある場合は通常のソート
    if (timeA && timeB) {
      return timeA.localeCompare(timeB);
    }

    // 時間が空のアフターパージは、時間がある項目の後に配置
    if (!timeA && timeB) {
      return 1;
    }
    if (timeA && !timeB) {
      return -1;
    }

    // 両方とも時間なしの場合は順序を保持
    return 0;
  });

  // スケジュールタイプの表示
  const getScheduleTypeLabel = (schedule: RoastSchedule): string => {
    if (schedule.isRoasterOn) return '焙煎機予熱';
    if (schedule.isRoast) return 'ロースト';
    if (schedule.isAfterPurge) return 'アフターパージ';
    if (schedule.isChaffCleaning) return 'チャフのお掃除';
    return 'その他';
  };

  const getScheduleTypeIcon = (schedule: RoastSchedule) => {
    const iconColor = isChristmasMode ? 'text-[#d4af37]' : '';
    if (schedule.isRoasterOn) return <HiFire className={`h-5 w-5 ${iconColor || 'text-orange-600'}`} />;
    if (schedule.isRoast) return <PiCoffeeBeanFill className={`h-5 w-5 ${iconColor || 'text-amber-600'}`} />;
    if (schedule.isAfterPurge) return <FaSnowflake className={`h-5 w-5 ${iconColor || 'text-blue-600'}`} />;
    if (schedule.isChaffCleaning) return <FaBroom className={`h-5 w-5 ${iconColor || 'text-gray-600'}`} />;
    return null;
  };

  return (
    <>
      <div className="space-y-3">
        {sortedSchedules.length === 0 ? (
          <div className={`text-center py-8 ${
            isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'
          }`}>
            <p>ローストスケジュールがありません</p>
          </div>
        ) : (
          sortedSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`border rounded-lg p-4 transition-colors ${
                isChristmasMode
                  ? 'border-[#d4af37]/30 bg-[#0a2f1a] hover:bg-[#0a2f1a]/80'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getScheduleTypeIcon(schedule)}
                    <span className={`text-sm font-medium ${
                      isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'
                    }`}>
                      {getScheduleTypeLabel(schedule)}
                    </span>
                    {schedule.time && (
                      <span className={`text-lg font-semibold ${
                        isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'
                      }`}>
                        {schedule.time}
                      </span>
                    )}
                  </div>

                  {/* 豆の情報 */}
                  {schedule.beanName && (
                    <div className={`text-sm mb-1 ${
                      isChristmasMode ? 'text-[#f8f1e7]/80' : 'text-gray-700'
                    }`}>
                      <span className="font-medium">豆:</span> {schedule.beanName}
                      {schedule.beanName2 && schedule.blendRatio && (
                        <span> + {schedule.beanName2} ({schedule.blendRatio})</span>
                      )}
                    </div>
                  )}

                  {/* 重さと焙煎度合い */}
                  {(schedule.weight || schedule.roastLevel) && (
                    <div className={`text-sm mb-1 ${
                      isChristmasMode ? 'text-[#f8f1e7]/80' : 'text-gray-700'
                    }`}>
                      {schedule.weight && <span>{schedule.weight}g</span>}
                      {schedule.weight && schedule.roastLevel && <span> / </span>}
                      {schedule.roastLevel && <span>{schedule.roastLevel}</span>}
                    </div>
                  )}

                  {/* ロースト回数と袋数 */}
                  {schedule.isRoast && (schedule.roastCount || schedule.bagCount) && (
                    <div className={`text-sm ${
                      isChristmasMode ? 'text-[#f8f1e7]/80' : 'text-gray-700'
                    }`}>
                      {schedule.roastCount && <span>{schedule.roastCount}回目</span>}
                      {schedule.roastCount && schedule.bagCount && <span> / </span>}
                      {schedule.bagCount && <span>{schedule.bagCount}袋</span>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <IconButton
                    variant="ghost"
                    size="md"
                    onClick={() => handleEdit(schedule)}
                    isChristmasMode={isChristmasMode}
                    aria-label="編集"
                  >
                    <HiPencil className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="md"
                    onClick={() => handleDelete(schedule.id)}
                    isChristmasMode={isChristmasMode}
                    className="text-red-500"
                    aria-label="削除"
                  >
                    <HiTrash className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>
            </div>
          ))
        )}

        {/* 追加ボタン */}
        <Button
          onClick={handleAdd}
          variant="primary"
          size="lg"
          className="w-full"
          isChristmasMode={isChristmasMode}
        >
          <HiPlus className="h-5 w-5" />
          <span>ローストスケジュールを追加</span>
        </Button>
      </div>

      {/* 編集ダイアログ */}
      {editingSchedule && (
        <RoastScheduleMemoDialog
          schedule={editingSchedule}
          selectedDate={selectedDate}
          onSave={handleSave}
          onDelete={isAdding ? undefined : () => handleDelete(editingSchedule.id)}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}


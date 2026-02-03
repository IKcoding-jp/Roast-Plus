'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { AppData, RoastSchedule } from '@/types';
import { HiPlus, HiCalendar } from 'react-icons/hi';
import { RoastScheduleMemoDialog } from './RoastScheduleMemoDialog';
import { ScheduleCard } from './roast-scheduler/ScheduleCard';

interface RoastSchedulerTabProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
  selectedDate: string; // YYYY-MM-DD形式
  isToday: boolean; // 選択日が今日かどうか
}

export function RoastSchedulerTab({ data, onUpdate, selectedDate, isToday: _isToday }: RoastSchedulerTabProps) {
  const [editingSchedule, setEditingSchedule] = useState<RoastSchedule | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // 選択日のスケジュールのみをフィルタリング
  const roastSchedules = (data?.roastSchedules || []).filter((s) => s.date === selectedDate);

  // 時間順にソート（orderが設定されている場合はorder順、設定されていない場合は時間順）
  const sortedSchedules = useMemo(() => {
    return [...roastSchedules].sort((a, b) => {
      // 両方orderがある場合はorder順
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }

      // 片方だけorderがある場合
      if (a.order !== undefined && b.order === undefined) {
        // orderがある方が後ろ（アフターパージ、チャフのお掃除やそれら後に追加されたスケジュール）
        return 1;
      }
      if (a.order === undefined && b.order !== undefined) {
        return -1;
      }

      // 両方orderがない場合は時間順
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [roastSchedules]);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: RoastSchedule) => {
    setEditingSchedule(schedule);
    setIsAdding(false);
  };

  const handleSave = (schedule: RoastSchedule) => {
    if (!data) return;
    // 全スケジュールを取得（選択日でフィルタリングする前）
    const allSchedules = data.roastSchedules || [];
    const updatedSchedules = [...allSchedules];
    
    // 選択日のスケジュールのみを対象にする
    const schedulesForSelectedDate = updatedSchedules.filter((s) => s.date === selectedDate);
    const existingIndex = schedulesForSelectedDate.findIndex((s) => s.id === schedule.id);
    const existingIndexInAll = updatedSchedules.findIndex((s) => s.id === schedule.id);

    if (existingIndex >= 0 && existingIndexInAll >= 0) {
      // 既存のスケジュールを更新（日付も更新）
      updatedSchedules[existingIndexInAll] = {
        ...schedule,
        date: selectedDate,
      };
    } else {
      // 新しいスケジュールを追加
      // アフターパージやチャフのお掃除が存在する場合、最後のアフターパージの直後に追加
      if (!schedule.isAfterPurge && !schedule.isChaffCleaning) {
        // 選択日のスケジュール内で最後のアフターパージのインデックスとorder値を探す
        let lastAfterPurgeIndex = -1;
        let maxAfterPurgeOrder = -1;
        for (let i = schedulesForSelectedDate.length - 1; i >= 0; i--) {
          if (schedulesForSelectedDate[i].isAfterPurge) {
            lastAfterPurgeIndex = i;
            const order = schedulesForSelectedDate[i].order ?? 0;
            if (order > maxAfterPurgeOrder) {
              maxAfterPurgeOrder = order;
            }
          }
        }
        
        if (lastAfterPurgeIndex >= 0) {
          // アフターパージの後に追加するため、orderに大きな値を設定
          const newSchedule: RoastSchedule = {
            ...schedule,
            date: selectedDate,
            order: maxAfterPurgeOrder + 1000, // アフターパージより後になるように大きな値を設定
          };
          updatedSchedules.push(newSchedule);
        } else {
          // アフターパージが存在しない場合、orderを設定せずに追加（時間順でソートされる）
          updatedSchedules.push({
            ...schedule,
            date: selectedDate,
          });
        }
      } else if (schedule.isAfterPurge) {
        // 追加するのがアフターパージの場合は、orderに大きな値を設定して末尾に追加
        const newSchedule: RoastSchedule = {
          ...schedule,
          date: selectedDate,
          order: (updatedSchedules.length + 1) * 1000, // 末尾になるように大きな値を設定
        };
        updatedSchedules.push(newSchedule);
      } else if (schedule.isChaffCleaning) {
        // 追加するのがチャフのお掃除の場合は、選択日のスケジュール内で最後のアフターパージの直後に追加
        let maxAfterPurgeOrder = -1;
        for (let i = schedulesForSelectedDate.length - 1; i >= 0; i--) {
          if (schedulesForSelectedDate[i].isAfterPurge) {
            const order = schedulesForSelectedDate[i].order ?? 0;
            if (order > maxAfterPurgeOrder) {
              maxAfterPurgeOrder = order;
            }
          }
        }
        
        const newSchedule: RoastSchedule = {
          ...schedule,
          date: selectedDate,
          order: maxAfterPurgeOrder >= 0 ? maxAfterPurgeOrder + 500 : (schedulesForSelectedDate.length + 1) * 1000,
        };
        updatedSchedules.push(newSchedule);
      }
    }

    const updatedData: AppData = {
      ...data,
      roastSchedules: updatedSchedules,
    };

    onUpdate(updatedData);
    setIsAdding(false);
    setEditingSchedule(null);
  };

  const handleDelete = (id: string) => {
    if (!data) return;
    // 全スケジュールから削除（選択日でフィルタリングする前）
    const allSchedules = data.roastSchedules || [];
    const updatedSchedules = allSchedules.filter((s) => s.id !== id);
    const updatedData: AppData = {
      ...data,
      roastSchedules: updatedSchedules,
    };
    onUpdate(updatedData);
    if (editingSchedule?.id === id) {
      setEditingSchedule(null);
    }
  };

  const handleDialogCancel = () => {
    setIsAdding(false);
    setEditingSchedule(null);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!data || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = sortedSchedules.findIndex((s) => s.id === draggedId);
    const targetIndex = sortedSchedules.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // 順序を更新（選択日のスケジュールのみを対象）
    const allSchedules = data?.roastSchedules || [];
    const updatedSchedules = [...allSchedules];
    const draggedSchedule = updatedSchedules.find((s) => s.id === draggedId);
    const targetSchedule = updatedSchedules.find((s) => s.id === targetId);

    if (!draggedSchedule || !targetSchedule) {
      setDraggedId(null);
      return;
    }

    // order値を更新
    // ドラッグ元とドロップ先の間のorder値を計算
    const schedulesWithOrder = sortedSchedules.map((s, index) => ({
      ...s,
      order: s.order ?? index * 10,
    }));

    const targetOrder = schedulesWithOrder[targetIndex].order!;

    // 新しいorder値を計算
    let newOrder: number;
    if (draggedIndex < targetIndex) {
      // 下に移動
      const nextOrder = targetIndex < schedulesWithOrder.length - 1
        ? schedulesWithOrder[targetIndex + 1].order!
        : targetOrder + 1000;
      newOrder = (targetOrder + nextOrder) / 2;
    } else {
      // 上に移動
      const prevOrder = targetIndex > 0
        ? schedulesWithOrder[targetIndex - 1].order!
        : targetOrder - 1000;
      newOrder = (prevOrder + targetOrder) / 2;
    }

    // 更新
    const updatedDraggedSchedule = {
      ...draggedSchedule,
      order: newOrder,
    };

    const scheduleIndex = updatedSchedules.findIndex((s) => s.id === draggedId);
    if (scheduleIndex !== -1) {
      updatedSchedules[scheduleIndex] = updatedDraggedSchedule;
    }

    const updatedData: AppData = {
      ...data,
      roastSchedules: updatedSchedules,
    };

    onUpdate(updatedData);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-xl border-2 border-gray-300">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-2xl bg-white p-4 md:p-6 shadow-xl border-2 border-gray-300 h-full flex flex-col backdrop-blur-sm"
      data-is-today={_isToday}
    >
      {/* デスクトップ版：タイトルと追加ボタンを横並び */}
      <div className="mb-3 md:mb-4 hidden lg:flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold text-gray-800">
          ローストスケジュール
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 md:gap-1.5 rounded-md bg-primary px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white transition-colors hover:bg-primary-dark shadow-md"
          aria-label="スケジュールを追加"
        >
          <HiPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>追加</span>
        </button>
      </div>

      {sortedSchedules.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
          <div>
            <div className="mb-3 md:mb-5 flex justify-center">
              <HiCalendar className="h-12 w-12 md:h-20 md:w-20 text-gray-300" />
            </div>
            <p className="text-sm md:text-lg font-medium">スケジュールがありません</p>
            <p className="mt-1.5 md:mt-3 text-xs md:text-base text-gray-400">ボタンから新しいスケジュールを作成してください</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2 md:space-y-1">
            {sortedSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={() => handleEdit(schedule)}
                isDragging={draggedId === schedule.id}
                isDragOver={dragOverId === schedule.id}
                onDragStart={() => handleDragStart(schedule.id)}
                onDragOver={(e) => handleDragOver(e, schedule.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, schedule.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
            {/* モバイル版：追加ボタンを一番下に表示 */}
            <div className="mt-4 flex lg:hidden items-center justify-center pb-2">
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-primary px-3 md:px-4 py-2 md:py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-primary-dark shadow-md min-w-[44px] min-h-[44px]"
                aria-label="スケジュールを追加"
              >
                <HiPlus className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:inline">追加</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* モバイル版：追加ボタンを一番下に表示（空の場合） */}
      {sortedSchedules.length === 0 && (
        <div className="mt-4 flex lg:hidden items-center justify-center">
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-primary px-3 md:px-4 py-2 md:py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-primary-dark shadow-md min-w-[44px] min-h-[44px]"
            aria-label="スケジュールを追加"
          >
            <HiPlus className="h-4 w-4 md:h-4 md:w-4" />
            <span className="hidden sm:inline">追加</span>
          </button>
        </div>
      )}

      {/* モーダルダイアログ */}
      {typeof window !== 'undefined' && (isAdding || editingSchedule) && createPortal(
        <RoastScheduleMemoDialog
          schedule={editingSchedule}
          selectedDate={selectedDate}
          onSave={handleSave}
          onDelete={editingSchedule ? () => handleDelete(editingSchedule.id) : undefined}
          onCancel={handleDialogCancel}
        />,
        document.body
      )}
    </div>
  );
}

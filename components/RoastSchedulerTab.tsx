'use client';

import { useState, useMemo } from 'react';
import type { AppData, RoastSchedule } from '@/types';
import { HiPlus, HiTrash, HiFire } from 'react-icons/hi';
import { FaCoffee, FaSnowflake } from 'react-icons/fa';
import { RoastScheduleMemoDialog } from './RoastScheduleMemoDialog';

interface RoastSchedulerTabProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
}

export function RoastSchedulerTab({ data, onUpdate }: RoastSchedulerTabProps) {
  const [editingSchedule, setEditingSchedule] = useState<RoastSchedule | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const roastSchedules = data.roastSchedules || [];

  // 時間順にソート（orderが設定されている場合はorder順、設定されていない場合は時間順）
  const sortedSchedules = useMemo(() => {
    return [...roastSchedules].sort((a, b) => {
      // 両方orderがある場合はorder順
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      
      // 片方だけorderがある場合
      if (a.order !== undefined && b.order === undefined) {
        // orderがある方が後ろ（アフターパージやアフターパージ後に追加されたスケジュール）
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

  // 焙煎度ごとの色分け
  const getRoastLevelColor = (roastLevel?: string) => {
    if (!roastLevel) return 'bg-gray-100 text-gray-800';
    
    if (roastLevel === '浅煎り') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (roastLevel === '中煎り') {
      return 'bg-orange-100 text-orange-800';
    }
    if (roastLevel === '中深煎り') {
      return 'bg-amber-600 text-white';
    }
    if (roastLevel === '深煎り') {
      return 'bg-amber-900 text-white';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: RoastSchedule) => {
    setEditingSchedule(schedule);
    setIsAdding(false);
  };

  const handleSave = (schedule: RoastSchedule) => {
    const updatedSchedules = [...roastSchedules];
    const existingIndex = updatedSchedules.findIndex((s) => s.id === schedule.id);

    if (existingIndex >= 0) {
      // 既存のスケジュールを更新
      updatedSchedules[existingIndex] = schedule;
    } else {
      // 新しいスケジュールを追加
      // アフターパージが存在する場合、最後のアフターパージの直後に追加
      if (!schedule.isAfterPurge) {
        // 最後のアフターパージのインデックスとorder値を探す
        let lastAfterPurgeIndex = -1;
        let maxAfterPurgeOrder = -1;
        for (let i = updatedSchedules.length - 1; i >= 0; i--) {
          if (updatedSchedules[i].isAfterPurge) {
            lastAfterPurgeIndex = i;
            const order = updatedSchedules[i].order ?? 0;
            if (order > maxAfterPurgeOrder) {
              maxAfterPurgeOrder = order;
            }
          }
        }
        
        if (lastAfterPurgeIndex >= 0) {
          // アフターパージの後に追加するため、orderに大きな値を設定
          const newSchedule: RoastSchedule = {
            ...schedule,
            order: maxAfterPurgeOrder + 1000, // アフターパージより後になるように大きな値を設定
          };
          updatedSchedules.push(newSchedule);
        } else {
          // アフターパージが存在しない場合、orderを設定せずに追加（時間順でソートされる）
          updatedSchedules.push(schedule);
        }
      } else {
        // 追加するのがアフターパージの場合は、orderに大きな値を設定して末尾に追加
        const newSchedule: RoastSchedule = {
          ...schedule,
          order: (updatedSchedules.length + 1) * 1000, // 末尾になるように大きな値を設定
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
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      const updatedSchedules = roastSchedules.filter((s) => s.id !== deleteConfirmId);
      const updatedData: AppData = {
        ...data,
        roastSchedules: updatedSchedules,
      };
      onUpdate(updatedData);
      setDeleteConfirmId(null);
      if (editingSchedule?.id === deleteConfirmId) {
        setEditingSchedule(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
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

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = sortedSchedules.findIndex((s) => s.id === draggedId);
    const targetIndex = sortedSchedules.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // 順序を更新
    const updatedSchedules = [...roastSchedules];
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

    const draggedOrder = schedulesWithOrder[draggedIndex].order!;
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

  return (
    <div className="relative rounded-lg bg-white p-4 sm:p-6 shadow-md h-full flex flex-col">
      {/* デスクトップ版：タイトルと追加ボタンを横並び */}
      <div className="mb-4 hidden lg:flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          ローストスケジュール
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 sm:gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
          aria-label="メモを追加"
        >
          <HiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">追加</span>
        </button>
      </div>

      {sortedSchedules.length === 0 ? (
        <div className="flex-1 flex items-start justify-center pt-12 text-center text-gray-500">
          <div>
            <div className="mb-4 flex justify-center">
              <div className="text-6xl text-gray-300">📄</div>
            </div>
            <p className="text-base font-medium">メモがありません</p>
            <p className="mt-2 text-sm">ボタンから新しいメモを作成してください</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            {sortedSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={() => handleEdit(schedule)}
                onDelete={() => handleDelete(schedule.id)}
                getRoastLevelColor={getRoastLevelColor}
                isDragging={draggedId === schedule.id}
                isDragOver={dragOverId === schedule.id}
                onDragStart={() => handleDragStart(schedule.id)}
                onDragOver={(e) => handleDragOver(e, schedule.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, schedule.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      )}

      {/* モバイル版：追加ボタンを一番下に表示 */}
      <div className="mt-4 flex lg:hidden items-center justify-center">
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 sm:gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
          aria-label="メモを追加"
        >
          <HiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">追加</span>
        </button>
      </div>

      {/* モーダルダイアログ */}
      {(isAdding || editingSchedule) && (
        <RoastScheduleMemoDialog
          schedule={editingSchedule}
          onSave={handleSave}
          onDelete={editingSchedule ? handleDelete : undefined}
          onCancel={handleDialogCancel}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={handleDeleteCancel}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">メモを削除</h3>
            <p className="text-gray-600 mb-6">
              このメモを削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px]"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ScheduleCardProps {
  schedule: RoastSchedule;
  onEdit: () => void;
  onDelete: () => void;
  getRoastLevelColor: (roastLevel?: string) => string;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  getRoastLevelColor,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: ScheduleCardProps) {
  // メモタイプの判定
  const isRoasterOn = schedule.isRoasterOn;
  const isRoast = schedule.isRoast;
  const isAfterPurge = schedule.isAfterPurge;

  // アイコンの取得
  const getIcon = () => {
    if (isRoasterOn) return <HiFire className="text-lg text-orange-500" />;
    if (isRoast) return <FaCoffee className="text-lg text-amber-700" />;
    if (isAfterPurge) return <FaSnowflake className="text-lg text-blue-500" />;
    return null;
  };

  // メモ内容の取得
  const getMemoContent = () => {
    if (isRoasterOn) {
      const beanText = schedule.beanName || '';
      const modeText = schedule.roastMachineMode || '';
      const weightText = schedule.weight ? `${schedule.weight}g` : '';
      // 焙煎度合いは別途バッジで表示するため、secondLineから除外
      const secondLine = [beanText, modeText ? `(${modeText})` : '', weightText]
        .filter(Boolean)
        .join(' ');
      return {
        firstLine: '焙煎機予熱',
        secondLine,
      };
    }
    if (isRoast) {
      const countText = schedule.roastCount ? `${schedule.roastCount}回目` : '';
      const bagText = schedule.bagCount ? `${schedule.bagCount}袋` : '';
      return {
        firstLine: `ロースト${countText}、${bagText}`,
        secondLine: '',
      };
    }
    if (isAfterPurge) {
      return {
        firstLine: 'アフターパージ',
        secondLine: '',
      };
    }
    return { firstLine: '', secondLine: '' };
  };

  const memoContent = getMemoContent();
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  const handleCardDragStart = () => {
    setIsDraggingCard(true);
    onDragStart();
  };

  const handleCardClick = () => {
    // ドラッグ中でない場合のみ編集ダイアログを開く
    if (!isDraggingCard) {
      onEdit();
    }
    setIsDraggingCard(false);
  };

  return (
    <div
      draggable
      onDragStart={handleCardDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={() => {
        setIsDraggingCard(false);
        onDragEnd();
      }}
      onClick={handleCardClick}
      className={`rounded-lg border border-gray-200 bg-white p-2 sm:p-3 cursor-move hover:shadow-sm hover:border-amber-300 transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOver ? 'border-amber-500 border-2 bg-amber-50' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        {/* 左側：時間バッジまたはアイコン */}
        {isAfterPurge ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="text-sm sm:text-base font-medium text-gray-800 select-none min-w-[50px]">
              {/* スペーサーとして空のdivを使用 */}
            </div>
            {getIcon()}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="text-sm sm:text-base font-medium text-gray-800 select-none min-w-[50px]">
              {schedule.time || ''}
            </div>
            {getIcon()}
          </div>
        )}

        {/* 中央：メモ内容 */}
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <div className="text-sm font-medium text-gray-800">
            {memoContent.firstLine}
          </div>
          {memoContent.secondLine && (
            <div className="text-xs text-gray-500">{memoContent.secondLine}</div>
          )}
          {schedule.roastLevel && (
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${getRoastLevelColor(
                schedule.roastLevel
              )}`}
            >
              {schedule.roastLevel}
            </span>
          )}
        </div>

        {/* 右側：削除ボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md bg-red-50 p-1.5 sm:p-2 text-red-600 transition-colors hover:bg-red-100 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center flex-shrink-0"
          aria-label="削除"
        >
          <HiTrash className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}

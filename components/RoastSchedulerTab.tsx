'use client';

import { useState, useMemo, useRef } from 'react';
import type { AppData, RoastSchedule } from '@/types';
import { HiPlus, HiFire, HiCalendar } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { RoastScheduleMemoDialog } from './RoastScheduleMemoDialog';
import { CountryFlagEmoji } from './CountryFlagEmoji';

interface RoastSchedulerTabProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
}

export function RoastSchedulerTab({ data, onUpdate }: RoastSchedulerTabProps) {
  const [editingSchedule, setEditingSchedule] = useState<RoastSchedule | null>(null);
  const [isAdding, setIsAdding] = useState(false);
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

  // 焙煎度ごとの色分け（コーヒー豆の色に合わせる）
  const getRoastLevelColor = (roastLevel?: string) => {
    if (!roastLevel) return 'bg-gray-100 text-gray-800';
    
    if (roastLevel === '浅煎り') {
      // ライト・ロースト / シナモン・ロースト: 黄味がかった小麦色 / シナモン色
      return 'text-yellow-900';
    }
    if (roastLevel === '中煎り') {
      // ミディアム・ロースト: 栗色
      return 'text-white';
    }
    if (roastLevel === '中深煎り') {
      // ハイ・ロースト: 濃い茶色
      return 'text-white';
    }
    if (roastLevel === '深煎り') {
      // シティ・ロースト以降: 非常に濃い茶色から黒色
      return 'text-white';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Gモードごとの色分け
  const getModeColor = (mode?: string) => {
    if (!mode) return 'bg-gray-100 text-gray-800';
    
    if (mode === 'G1') {
      return 'bg-blue-100 text-blue-800';
    }
    if (mode === 'G2') {
      return 'bg-yellow-100 text-yellow-900';
    }
    if (mode === 'G3') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // 重さごとの色分け
  const getWeightColor = (weight?: string) => {
    if (!weight) return 'bg-gray-100 text-gray-800';
    
    if (weight === '200g') {
      // 水色または落ち着いた緑（バランス・標準・穏やかさ）
      return 'bg-sky-100 text-sky-800';
    }
    if (weight === '300g') {
      // 明るい緑または明るい黄色（軽さ・新鮮さ）
      return 'bg-lime-100 text-lime-900';
    }
    if (weight === '500g') {
      // 暖色系（オレンジ、茶色）または赤
      return 'bg-orange-200 text-orange-900';
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
      // アフターパージやチャフのお掃除が存在する場合、最後のアフターパージの直後に追加
      if (!schedule.isAfterPurge && !schedule.isChaffCleaning) {
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
      } else if (schedule.isAfterPurge) {
        // 追加するのがアフターパージの場合は、orderに大きな値を設定して末尾に追加
        const newSchedule: RoastSchedule = {
          ...schedule,
          order: (updatedSchedules.length + 1) * 1000, // 末尾になるように大きな値を設定
        };
        updatedSchedules.push(newSchedule);
      } else if (schedule.isChaffCleaning) {
        // 追加するのがチャフのお掃除の場合は、最後のアフターパージの直後に追加
        let maxAfterPurgeOrder = -1;
        for (let i = updatedSchedules.length - 1; i >= 0; i--) {
          if (updatedSchedules[i].isAfterPurge) {
            const order = updatedSchedules[i].order ?? 0;
            if (order > maxAfterPurgeOrder) {
              maxAfterPurgeOrder = order;
            }
          }
        }
        
        const newSchedule: RoastSchedule = {
          ...schedule,
          order: maxAfterPurgeOrder >= 0 ? maxAfterPurgeOrder + 500 : (updatedSchedules.length + 1) * 1000,
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
    const updatedSchedules = roastSchedules.filter((s) => s.id !== id);
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
    <div className="relative rounded-lg bg-white p-3 md:p-4 lg:p-6 shadow-md h-full flex flex-col">
      {/* デスクトップ版：タイトルと追加ボタンを横並び */}
      <div className="mb-3 md:mb-4 hidden lg:flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold text-gray-800">
          ローストスケジュール
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 md:gap-1.5 rounded-md bg-amber-600 px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white transition-colors hover:bg-amber-700"
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
                getRoastLevelColor={getRoastLevelColor}
                getModeColor={getModeColor}
                getWeightColor={getWeightColor}
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
                className="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-amber-600 px-3 md:px-4 py-2 md:py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px]"
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
            className="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-amber-600 px-3 md:px-4 py-2 md:py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px]"
            aria-label="スケジュールを追加"
          >
            <HiPlus className="h-4 w-4 md:h-4 md:w-4" />
            <span className="hidden sm:inline">追加</span>
          </button>
        </div>
      )}

      {/* モーダルダイアログ */}
      {(isAdding || editingSchedule) && (
        <RoastScheduleMemoDialog
          schedule={editingSchedule}
          onSave={handleSave}
          onDelete={editingSchedule ? () => handleDelete(editingSchedule.id) : undefined}
          onCancel={handleDialogCancel}
        />
      )}
    </div>
  );
}

interface ScheduleCardProps {
  schedule: RoastSchedule;
  onEdit: () => void;
  getRoastLevelColor: (roastLevel?: string) => string;
  getModeColor: (mode?: string) => string;
  getWeightColor: (weight?: string) => string;
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
  getRoastLevelColor,
  getModeColor,
  getWeightColor,
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
  const isChaffCleaning = schedule.isChaffCleaning;

  // アイコンの取得
  const getIcon = () => {
    if (isRoasterOn) return <HiFire className="text-xl md:text-xl text-orange-500 flex-shrink-0" />;
    if (isRoast) return <PiCoffeeBeanFill className="text-xl md:text-xl text-amber-700 flex-shrink-0" />;
    if (isAfterPurge) return <FaSnowflake className="text-xl md:text-xl text-blue-500 flex-shrink-0" />;
    if (isChaffCleaning) return <FaBroom className="text-xl md:text-xl text-gray-600 flex-shrink-0" />;
    return null;
  };

  // メモ内容の取得
  const getMemoContent = () => {
    if (isRoasterOn) {
      const beanText = schedule.beanName || '';
      const beanText2 = schedule.beanName2 || '';
      const blendRatioText = schedule.blendRatio || '';
      const modeText = schedule.roastMachineMode || '';
      const weightText = schedule.weight ? `${schedule.weight}g` : '';
      const roastLevelText = schedule.roastLevel || '';
      return {
        firstLine: '焙煎機予熱',
        beanName: beanText,
        beanName2: beanText2,
        blendRatio: blendRatioText,
        mode: modeText,
        weight: weightText,
        roastLevel: roastLevelText,
      };
    }
    if (isRoast) {
      const countText = schedule.roastCount ? `${schedule.roastCount}回目` : '';
      const bagText = schedule.bagCount ? `${schedule.bagCount}袋` : '';
      if (bagText) {
        return {
          firstLine: `ロースト${countText}・${bagText}`,
          beanName: '',
          beanName2: '',
          blendRatio: '',
          mode: '',
          weight: '',
          roastLevel: '',
        };
      } else {
        return {
          firstLine: `ロースト${countText}`,
          beanName: '',
          beanName2: '',
          blendRatio: '',
          mode: '',
          weight: '',
          roastLevel: '',
        };
      }
    }
    if (isAfterPurge) {
      return {
        firstLine: 'アフターパージ',
        beanName: '',
        beanName2: '',
        blendRatio: '',
        mode: '',
        weight: '',
        roastLevel: '',
      };
    }
    if (isChaffCleaning) {
      return {
        firstLine: 'チャフのお掃除',
        beanName: '',
        beanName2: '',
        blendRatio: '',
        mode: '',
        weight: '',
        roastLevel: '',
      };
    }
    return { firstLine: '', beanName: '', beanName2: '', blendRatio: '', mode: '', weight: '', roastLevel: '' };
  };

  const memoContent = getMemoContent();
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

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

  // タッチイベントハンドラー（iPad対応）
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // 一定の距離と時間を超えたらドラッグ開始とみなす
    if ((deltaX > 10 || deltaY > 10) && deltaTime > 100) {
      if (!isDraggingCard) {
        handleCardDragStart();
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
      className={`rounded-md border border-gray-200 bg-white p-3 md:p-2.5 cursor-move hover:shadow-sm hover:border-amber-300 transition-all select-none touch-none ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOver ? 'border-amber-500 border-2 bg-amber-50' : ''}`}
    >
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* 左側：時間バッジまたはアイコン */}
        {isAfterPurge ? (
          <div className="flex items-center gap-1.5 md:gap-1.5 flex-shrink-0">
            <div className="text-base md:text-base font-medium text-gray-600 select-none min-w-[48px] md:min-w-[48px]">
              {/* スペーサーとして空のdivを使用 */}
            </div>
            {getIcon()}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 md:gap-1.5 flex-shrink-0">
            <div className="text-base md:text-base font-medium text-gray-700 select-none min-w-[48px] md:min-w-[48px] tabular-nums">
              {schedule.time || ''}
            </div>
            {getIcon()}
          </div>
        )}

        {/* 中央：メモ内容 */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 md:gap-0.5">
          <div className="text-base md:text-base font-medium text-gray-800 flex items-center gap-1.5 md:gap-1.5 flex-wrap">
            <span className="whitespace-nowrap">{memoContent.firstLine}</span>
            {memoContent.beanName && (
              <span className="inline-flex items-center rounded px-1.5 md:px-2 py-0.5 md:py-1 text-sm md:text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap">
                {memoContent.beanName2 && memoContent.blendRatio ? (
                  <>
                    <span className="whitespace-nowrap">{memoContent.beanName}</span>
                    {' '}
                    <CountryFlagEmoji countryName={memoContent.beanName} />
                    <span className="mx-0.5 md:mx-1 text-gray-400">×</span>
                    <span className="whitespace-nowrap">{memoContent.beanName2}</span>
                    {' '}
                    <CountryFlagEmoji countryName={memoContent.beanName2} />
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">{memoContent.beanName}</span>
                    {' '}
                    <CountryFlagEmoji countryName={memoContent.beanName} />
                  </>
                )}
              </span>
            )}
          </div>
          {(memoContent.mode || memoContent.weight || memoContent.roastLevel) && (
            <div className="text-sm md:text-xs flex items-center gap-1 md:gap-1 flex-wrap">
              {memoContent.mode && (
                <span className={`inline-block rounded px-2 md:px-2 py-1 md:py-0.5 text-sm md:text-xs font-medium ${getModeColor(memoContent.mode)} whitespace-nowrap`}>
                  {memoContent.mode}
                </span>
              )}
              {memoContent.weight && (
                <span className={`inline-block rounded px-2 md:px-2 py-1 md:py-0.5 text-sm md:text-xs font-medium ${getWeightColor(memoContent.weight)} whitespace-nowrap`}>
                  {memoContent.weight}
                </span>
              )}
              {memoContent.roastLevel && (
                <span 
                  className={`inline-block rounded px-2 md:px-2 py-1 md:py-0.5 text-sm md:text-xs font-medium ${getRoastLevelColor(memoContent.roastLevel)} whitespace-nowrap`}
                  style={
                    memoContent.roastLevel === '深煎り' 
                      ? { backgroundColor: '#120C0A' }
                      : memoContent.roastLevel === '中深煎り'
                      ? { backgroundColor: '#4E3526' }
                      : memoContent.roastLevel === '中煎り'
                      ? { backgroundColor: '#745138' }
                      : memoContent.roastLevel === '浅煎り'
                      ? { backgroundColor: '#C78F5D' }
                      : undefined
                  }
                >
                  {memoContent.roastLevel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

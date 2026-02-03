'use client';

import { useState, useRef } from 'react';
import type { RoastSchedule } from '@/types';
import { HiFire } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { CountryFlagEmoji } from '../CountryFlagEmoji';
import { getRoastLevelColor, getModeColor, getWeightColor } from '@/lib/roastScheduleColors';

interface ScheduleCardProps {
  schedule: RoastSchedule;
  onEdit: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function ScheduleCard({
  schedule,
  onEdit,
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
      className={`rounded-md border border-gray-200 bg-gray-50 hover:bg-amber-50 p-3 md:p-2.5 cursor-move hover:shadow-sm hover:border-amber-300 transition-all select-none touch-none ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOver ? 'border-amber-500 border-2 bg-amber-50' : ''}`}
    >
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* 左側：時間バッジまたはアイコン */}
        <div className="flex items-center gap-1.5 md:gap-1.5 flex-shrink-0">
          {schedule.time ? (
            <div className="flex-shrink-0 w-16 md:w-18 text-center px-2 py-1 bg-white rounded-md text-sm md:text-base font-semibold text-gray-800 tabular-nums shadow-sm">
              {schedule.time}
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 md:w-18"></div>
          )}
          {getIcon()}
        </div>

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

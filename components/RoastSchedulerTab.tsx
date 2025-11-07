'use client';

import { useState, useEffect, useMemo } from 'react';
import type { AppData, RoastSchedule } from '@/types';
import { HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { FiThermometer, FiWind, FiCoffee } from 'react-icons/fi';

interface RoastSchedulerTabProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
}

export function RoastSchedulerTab({ data, onUpdate }: RoastSchedulerTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const roastSchedules = data.roastSchedules || [];

  // 時間順にソート
  const sortedSchedules = useMemo(() => {
    return [...roastSchedules].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [roastSchedules]);

  // 焙煎度ごとの色分け
  const getRoastLevelColor = (roastLevel?: string) => {
    if (!roastLevel) return 'bg-gray-100 text-gray-800';
    
    const level = roastLevel.toLowerCase();
    if (level.includes('浅煎り') || level.includes('ライト')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (level.includes('中煎り') || level.includes('ミディアム')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (level.includes('深煎り') || level.includes('ダーク')) {
      return 'bg-amber-800 text-white';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const addSchedule = () => {
    setIsAdding(true);
    setEditingId(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
  };

  const saveSchedule = (schedule: RoastSchedule) => {
    const updatedSchedules = [...roastSchedules];
    const existingIndex = updatedSchedules.findIndex((s) => s.id === schedule.id);

    if (existingIndex >= 0) {
      updatedSchedules[existingIndex] = schedule;
    } else {
      updatedSchedules.push(schedule);
    }

    const updatedData: AppData = {
      ...data,
      roastSchedules: updatedSchedules,
    };

    onUpdate(updatedData);
    setIsAdding(false);
    setEditingId(null);
  };

  const deleteSchedule = (id: string) => {
    const updatedSchedules = roastSchedules.filter((s) => s.id !== id);
    const updatedData: AppData = {
      ...data,
      roastSchedules: updatedSchedules,
    };
    onUpdate(updatedData);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">ローストスケジュール</h2>
        {!isAdding && (
          <button
            onClick={addSchedule}
            className="flex items-center gap-1 sm:gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            aria-label="スケジュールを追加"
          >
            <HiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">追加</span>
          </button>
        )}
      </div>

      {isAdding && (
        <ScheduleForm
          schedule={null}
          onSave={saveSchedule}
          onCancel={cancelAdd}
          getRoastLevelColor={getRoastLevelColor}
        />
      )}

      {sortedSchedules.length === 0 && !isAdding ? (
        <div className="py-8 text-center text-gray-500">
          <p>ローストスケジュールがありません</p>
          <p className="mt-2 text-sm">「追加」ボタンからスケジュールを追加してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSchedules.map((schedule) => (
            <div key={schedule.id}>
              {editingId === schedule.id ? (
                <ScheduleForm
                  schedule={schedule}
                  onSave={saveSchedule}
                  onCancel={cancelEdit}
                  getRoastLevelColor={getRoastLevelColor}
                />
              ) : (
                <ScheduleCard
                  schedule={schedule}
                  onEdit={() => startEdit(schedule.id)}
                  onDelete={() => deleteSchedule(schedule.id)}
                  getRoastLevelColor={getRoastLevelColor}
                />
              )}
            </div>
          ))}
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
}

function ScheduleCard({ schedule, onEdit, onDelete, getRoastLevelColor }: ScheduleCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl font-semibold text-gray-800">{schedule.time}</span>
          {schedule.roastLevel && (
            <span
              className={`rounded-full px-2 py-1 text-xs sm:text-sm font-medium ${getRoastLevelColor(
                schedule.roastLevel
              )}`}
            >
              {schedule.roastLevel}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="rounded-md bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="編集"
          >
            <HiPencil className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="削除"
          >
            <HiTrash className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
          <span className="font-medium">豆:</span>
          <span>{schedule.bean || '-'}</span>
        </div>

        {schedule.settings && (
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <span className="font-medium">設定:</span>
            <span>{schedule.settings}</span>
          </div>
        )}

        {schedule.bagCount !== undefined && schedule.bagCount !== null && (
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <span className="font-medium">袋数:</span>
            <span>{schedule.bagCount}袋</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {schedule.flags?.preheat && (
            <div className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs sm:text-sm text-blue-800">
              <FiThermometer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>予熱</span>
            </div>
          )}
          {schedule.flags?.afterPurge && (
            <div className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs sm:text-sm text-green-800">
              <FiWind className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>アフターパージ</span>
            </div>
          )}
          {schedule.flags?.roast && (
            <div className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs sm:text-sm text-amber-800">
              <FiCoffee className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>ロースト</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScheduleFormProps {
  schedule: RoastSchedule | null;
  onSave: (schedule: RoastSchedule) => void;
  onCancel: () => void;
  getRoastLevelColor: (roastLevel?: string) => string;
}

function ScheduleForm({ schedule, onSave, onCancel, getRoastLevelColor }: ScheduleFormProps) {
  const [time, setTime] = useState(schedule?.time || '');
  const [bean, setBean] = useState(schedule?.bean || '');
  const [settings, setSettings] = useState(schedule?.settings || '');
  const [roastLevel, setRoastLevel] = useState(schedule?.roastLevel || '');
  const [bagCount, setBagCount] = useState(schedule?.bagCount?.toString() || '');
  const [flags, setFlags] = useState({
    preheat: schedule?.flags?.preheat || false,
    afterPurge: schedule?.flags?.afterPurge || false,
    roast: schedule?.flags?.roast || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule: RoastSchedule = {
      id: schedule?.id || `roast-${Date.now()}`,
      time,
      bean,
      settings: settings || undefined,
      roastLevel: roastLevel || undefined,
      bagCount: bagCount ? parseInt(bagCount, 10) : undefined,
      flags,
      order: schedule?.order,
    };
    onSave(newSchedule);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          {schedule ? '編集' : '新規追加'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="キャンセル"
        >
          <HiX className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">時間 *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">豆 *</label>
          <input
            type="text"
            value={bean}
            onChange={(e) => setBean(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="豆の種類"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">設定</label>
          <input
            type="text"
            value={settings}
            onChange={(e) => setSettings(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="設定"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">焙煎度</label>
          <input
            type="text"
            value={roastLevel}
            onChange={(e) => setRoastLevel(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="例: 浅煎り、中煎り、深煎り"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">袋数</label>
          <input
            type="number"
            value={bagCount}
            onChange={(e) => setBagCount(e.target.value)}
            min="0"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="袋数"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">フラグ</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={flags.preheat}
                onChange={(e) => setFlags({ ...flags, preheat: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">予熱</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={flags.afterPurge}
                onChange={(e) => setFlags({ ...flags, afterPurge: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">アフターパージ</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={flags.roast}
                onChange={(e) => setFlags({ ...flags, roast: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">ロースト</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:bg-amber-700 min-h-[44px]"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-300 min-h-[44px]"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  );
}


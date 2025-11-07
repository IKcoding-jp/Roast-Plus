'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { AppData, TodaySchedule, TimeLabel } from '@/types';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

interface TodayScheduleProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
}

export function TodaySchedule({ data, onUpdate }: TodayScheduleProps) {
  const [isComposing, setIsComposing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  const dataRef = useRef<AppData | null>(data);
  const todayScheduleIdRef = useRef<string>('');
  const originalTimeLabelsRef = useRef<TimeLabel[]>([]);
  const onUpdateRef = useRef(onUpdate);

  // 最新の参照を保持
  useEffect(() => {
    dataRef.current = data;
    onUpdateRef.current = onUpdate;
  }, [data, onUpdate]);

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = data.todaySchedules?.find((s) => s.date === today) || {
    id: `schedule-${today}`,
    date: today,
    timeLabels: [],
  };

  const [localTimeLabels, setLocalTimeLabels] = useState<TimeLabel[]>([]);
  const [newHour, setNewHour] = useState<string>('');
  const [newMinute, setNewMinute] = useState<string>('');
  const lastDataRef = useRef<string>('');
  const localTimeLabelsRef = useRef<TimeLabel[]>([]);

  // データが読み込まれたときにローカル状態を初期化・同期
  useEffect(() => {
    if (!data) return;

    const currentSchedule = data.todaySchedules?.find((s) => s.date === today);
    const newTimeLabels = currentSchedule?.timeLabels || [];
    const newTimeLabelsStr = JSON.stringify(newTimeLabels);
    
    // 前回のデータと同じ場合は何もしない（無限ループ防止）
    if (lastDataRef.current === newTimeLabelsStr) {
      return;
    }
    
    // 外部からの更新の場合のみ同期（ローカル更新中は同期しない）
    if (!isUpdatingRef.current) {
      // originalTimeLabelsRefと比較して、異なる場合のみ更新
      const originalStr = JSON.stringify(originalTimeLabelsRef.current);
      if (originalStr !== newTimeLabelsStr) {
        setLocalTimeLabels(newTimeLabels);
        localTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
        originalTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
        todayScheduleIdRef.current = currentSchedule?.id || `schedule-${today}`;
        lastDataRef.current = newTimeLabelsStr;
      }
    } else {
      // ローカル更新後、Firestoreからの更新が来た場合は、originalTimeLabelsRefを更新
      originalTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
      todayScheduleIdRef.current = currentSchedule?.id || `schedule-${today}`;
      lastDataRef.current = newTimeLabelsStr;
    }
  }, [data?.todaySchedules, today]);

  // デバウンス保存関数
  const debouncedSave = useCallback(
    (newTimeLabels: TimeLabel[]) => {
      if (isComposing) {
        return; // IME変換中は保存しない
      }

      // 既存のタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // 新しいタイマーを設定（500ms後に保存）
      debounceTimerRef.current = setTimeout(() => {
        const currentData = dataRef.current;
        if (!currentData) return;

        // 保存する値がoriginalTimeLabelsRefと同じ場合は保存しない（無限ループ防止）
        const newTimeLabelsStr = JSON.stringify(newTimeLabels);
        const originalStr = JSON.stringify(originalTimeLabelsRef.current);
        if (originalStr === newTimeLabelsStr) {
          return;
        }

        isUpdatingRef.current = true;
        const updatedSchedules = [...(currentData.todaySchedules || [])];
        const existingIndex = updatedSchedules.findIndex((s) => s.date === today);

        const updatedSchedule: TodaySchedule = {
          id: todayScheduleIdRef.current || `schedule-${today}`,
          date: today,
          timeLabels: newTimeLabels,
        };

        if (existingIndex >= 0) {
          updatedSchedules[existingIndex] = updatedSchedule;
        } else {
          updatedSchedules.push(updatedSchedule);
        }

        const updatedData: AppData = {
          ...currentData,
          todaySchedules: updatedSchedules,
        };

        // originalTimeLabelsRefを更新
        originalTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
        localTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
        todayScheduleIdRef.current = updatedSchedule.id;
        lastDataRef.current = newTimeLabelsStr;

        onUpdateRef.current(updatedData);
        
        // 更新フラグをリセット（FirestoreのonSnapshotが発火する前に）
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 500);
      }, 500);
    },
    [today, isComposing]
  );

  // ローカル状態が変更されたらデバウンス保存
  useEffect(() => {
    if (isUpdatingRef.current) {
      return; // 更新中は保存しない
    }

    // localTimeLabelsRefを更新
    localTimeLabelsRef.current = JSON.parse(JSON.stringify(localTimeLabels));

    const originalTimeLabels = originalTimeLabelsRef.current;
    
    // 長さが異なる場合
    if (localTimeLabels.length !== originalTimeLabels.length) {
      debouncedSave(localTimeLabels);
      return;
    }

    // 内容が変更されているかチェック
    const hasChanges = localTimeLabels.some((label, index) => {
      const original = originalTimeLabels[index];
      return (
        !original ||
        label.id !== original.id ||
        label.time !== original.time ||
        label.content !== original.content ||
        label.memo !== original.memo
      );
    });

    if (hasChanges) {
      debouncedSave(localTimeLabels);
    }
  }, [localTimeLabels, debouncedSave]);

  // クリーンアップ（アンマウント時に未保存の変更を保存）
  useEffect(() => {
    return () => {
      // 未保存の変更がある場合は保存
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      // 未保存の変更を即座に保存（変更がある場合のみ）
      if (!isUpdatingRef.current) {
        const currentTimeLabels = localTimeLabelsRef.current;
        const originalTimeLabels = originalTimeLabelsRef.current;
        const hasChanges = currentTimeLabels.length !== originalTimeLabels.length ||
          currentTimeLabels.some((label, index) => {
            const original = originalTimeLabels[index];
            return (
              !original ||
              label.id !== original.id ||
              label.time !== original.time ||
              label.content !== original.content ||
              label.memo !== original.memo
            );
          });

        if (hasChanges) {
          const currentData = dataRef.current;
          if (currentData) {
            const currentToday = new Date().toISOString().split('T')[0];
            const updatedSchedules = [...(currentData.todaySchedules || [])];
            const existingIndex = updatedSchedules.findIndex((s) => s.date === currentToday);

            const updatedSchedule: TodaySchedule = {
              id: todayScheduleIdRef.current || `schedule-${currentToday}`,
              date: currentToday,
              timeLabels: currentTimeLabels,
            };

            if (existingIndex >= 0) {
              updatedSchedules[existingIndex] = updatedSchedule;
            } else {
              updatedSchedules.push(updatedSchedule);
            }

            const updatedData: AppData = {
              ...currentData,
              todaySchedules: updatedSchedules,
            };

            onUpdateRef.current(updatedData);
          }
        }
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const addTimeLabel = () => {
    const hour = newHour.padStart(2, '0');
    const minute = newMinute.padStart(2, '0');
    const time = `${hour}:${minute}`;
    
    if (!newHour || !newMinute) return;
    
    const newLabel: TimeLabel = {
      id: `time-${Date.now()}`,
      time: time,
      content: '',
      memo: '',
      order: localTimeLabels.length,
    };
    setLocalTimeLabels([...localTimeLabels, newLabel]);
    setNewHour(''); // 入力欄をクリア
    setNewMinute(''); // 入力欄をクリア
  };

  const deleteTimeLabel = (id: string) => {
    setLocalTimeLabels(localTimeLabels.filter((label) => label.id !== id));
  };

  const updateTimeLabel = (id: string, updates: Partial<TimeLabel>) => {
    setLocalTimeLabels(
      localTimeLabels.map((label) => (label.id === id ? { ...label, ...updates } : label))
    );
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    // IME変換終了後、少し遅延してから保存
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(localTimeLabels);
    }, 300);
  };

  // 時間順にソート
  const sortedTimeLabels = useMemo(() => {
    return [...localTimeLabels].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [localTimeLabels]);

  return (
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-md">
      {/* デスクトップ版：タイトルと時間入力欄を横並び */}
      <div className="mb-4 hidden lg:flex flex-row items-center justify-between gap-2">
        <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 whitespace-nowrap">本日のスケジュール</h2>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={newHour}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                  setNewHour(value);
                }
              }}
              min="0"
              max="23"
              className="w-16 rounded-md border border-gray-300 px-2 py-2 text-sm sm:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="時"
            />
            <span className="text-gray-600">:</span>
            <input
              type="number"
              value={newMinute}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                  setNewMinute(value);
                }
              }}
              min="0"
              max="59"
              className="w-16 rounded-md border border-gray-300 px-2 py-2 text-sm sm:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="分"
            />
          </div>
          <button
            onClick={addTimeLabel}
            disabled={!newHour || !newMinute}
            className="flex items-center gap-1 sm:gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]"
            aria-label="時間ラベルを追加"
          >
            <HiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">追加</span>
          </button>
        </div>
      </div>

      {localTimeLabels.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>時間ラベルがありません</p>
          <p className="mt-2 text-sm">時間を入力して「追加」ボタンから時間ラベルを追加してください</p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto">
          <div className="space-y-2">
            {sortedTimeLabels.slice(0, 10).map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-1 py-2 border-b border-gray-200 last:border-b-0"
              >
                {/* 時間表示 */}
                <div className="w-14 sm:w-16 flex-shrink-0">
                  <div className="text-sm sm:text-base font-medium text-gray-800 select-none">
                    {label.time || '--:--'}
                  </div>
                </div>

                {/* 内容入力（下線付き） */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={label.content}
                    onChange={(e) => updateTimeLabel(label.id, { content: e.target.value })}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    className="w-full bg-transparent border-0 border-b-2 border-gray-300 px-0 py-1 text-sm sm:text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-0"
                    placeholder="内容を入力"
                  />
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTimeLabel(label.id)}
                  className="flex-shrink-0 rounded-md bg-red-100 p-1.5 sm:p-2 text-red-700 transition-colors hover:bg-red-200 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                  aria-label="削除"
                >
                  <HiTrash className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            ))}
            {sortedTimeLabels.length > 10 && (
              <div className="py-2 text-center text-sm text-gray-500">
                最大10個まで表示しています（全{sortedTimeLabels.length}個）
              </div>
            )}
          </div>
        </div>
      )}

      {/* モバイル版：時間入力欄をスケジュールの下に表示 */}
      <div className="mt-4 flex lg:hidden items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={newHour}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                setNewHour(value);
              }
            }}
            min="0"
            max="23"
            className="w-12 rounded-md border border-gray-300 px-1 py-1.5 text-sm text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="時"
          />
          <span className="text-gray-600 text-xs">:</span>
          <input
            type="number"
            value={newMinute}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                setNewMinute(value);
              }
            }}
            min="0"
            max="59"
            className="w-12 rounded-md border border-gray-300 px-1 py-1.5 text-sm text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="分"
          />
        </div>
        <button
          onClick={addTimeLabel}
          disabled={!newHour || !newMinute}
          className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[36px] min-h-[36px]"
          aria-label="時間ラベルを追加"
        >
          <HiPlus className="h-3 w-3" />
          <span className="hidden sm:inline">追加</span>
        </button>
      </div>
    </div>
  );
}


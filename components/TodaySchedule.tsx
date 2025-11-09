'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { AppData, TodaySchedule, TimeLabel } from '@/types';
import { HiPlus, HiX, HiClock } from 'react-icons/hi';

interface TodayScheduleProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
}

export function TodaySchedule({ data, onUpdate }: TodayScheduleProps) {
  const [isComposing, setIsComposing] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // refを先に宣言（useStateの初期化関数で使用するため）
  const lastDataRef = useRef<string>('');
  const localTimeLabelsRef = useRef<TimeLabel[]>(todaySchedule.timeLabels || []);
  const lastTodaySchedulesStrRef = useRef<string>('');
  const isInitializedRef = useRef<boolean>(false);
  const localTimeLabelsLengthRef = useRef<number>(todaySchedule.timeLabels?.length || 0);

  // 初期値をdataから取得（useStateの初期化関数を使用して初回レンダリング時のみ評価）
  const [localTimeLabels, setLocalTimeLabels] = useState<TimeLabel[]>(() => {
    const initialLabels = todaySchedule.timeLabels || [];
    // 初期化時にrefも設定
    if (initialLabels.length > 0) {
      originalTimeLabelsRef.current = JSON.parse(JSON.stringify(initialLabels));
      localTimeLabelsRef.current = JSON.parse(JSON.stringify(initialLabels));
      lastDataRef.current = JSON.stringify(initialLabels);
      localTimeLabelsLengthRef.current = initialLabels.length;
    }
    return initialLabels;
  });
  const [newHour, setNewHour] = useState<string>('');
  const [newMinute, setNewMinute] = useState<string>('');

  // localTimeLabelsの長さを追跡
  useEffect(() => {
    localTimeLabelsLengthRef.current = localTimeLabels.length;
  }, [localTimeLabels.length]);


  // データが読み込まれたときにローカル状態を初期化・同期
  useEffect(() => {
    if (!data) return;

    const currentSchedule = data.todaySchedules?.find((s) => s.date === today);
    const newTimeLabels = currentSchedule?.timeLabels || [];
    const newTimeLabelsStr = JSON.stringify(newTimeLabels);
    
    // 初期化されていない場合、またはローカル状態が空でデータがある場合は即座に初期化
    if (!isInitializedRef.current || (localTimeLabelsLengthRef.current === 0 && newTimeLabels.length > 0)) {
      setLocalTimeLabels(newTimeLabels);
      localTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
      originalTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
      todayScheduleIdRef.current = currentSchedule?.id || `schedule-${today}`;
      lastDataRef.current = newTimeLabelsStr;
      lastTodaySchedulesStrRef.current = JSON.stringify(data.todaySchedules || []);
      isInitializedRef.current = true;
      localTimeLabelsLengthRef.current = newTimeLabels.length;
      return;
    }
    
    // 前回のデータと同じ場合は何もしない（無限ループ防止）
    if (lastDataRef.current === newTimeLabelsStr) {
      return;
    }
    
    // todaySchedules全体のJSON文字列を計算
    const todaySchedulesStr = JSON.stringify(data.todaySchedules || []);
    
    // 前回のtodaySchedulesと同じ場合は何もしない（不要な実行を防止）
    if (lastTodaySchedulesStrRef.current === todaySchedulesStr && lastDataRef.current !== '') {
      return;
    }
    
    lastTodaySchedulesStrRef.current = todaySchedulesStr;
    
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
  }, [data, today]);

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
      
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const addTimeLabel = () => {
    if (!newHour) {
      setAddError('数字を入力してください');
      
      // 既存のタイマーをクリア
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // 3秒後にエラーを自動的にクリア
      errorTimeoutRef.current = setTimeout(() => {
        setAddError('');
        errorTimeoutRef.current = null;
      }, 3000);
      
      return;
    }
    
    // エラーをクリア（タイマーもクリア）
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setAddError('');
    
    const hour = newHour.padStart(2, '0');
    const minute = newMinute ? newMinute.padStart(2, '0') : '00'; // 分が未入力の場合は00
    const time = `${hour}:${minute}`;
    
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

  const handleEditLabel = (id: string) => {
    setEditingLabelId(id);
  };

  const handleEditCancel = () => {
    setEditingLabelId(null);
  };

  const handleEditSave = (id: string, hour: string, minute: string) => {
    if (!hour) return; // 時が入力されていない場合は保存しない
    
    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute ? minute.padStart(2, '0') : '00';
    const newTime = `${formattedHour}:${formattedMinute}`;
    
    updateTimeLabel(id, { time: newTime });
    setEditingLabelId(null);
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
    <div className="rounded-lg bg-white p-3 md:p-4 lg:p-6 shadow-md h-full flex flex-col">
      {/* デスクトップ版：タイトルと時間入力欄を横並び */}
      <div className="mb-3 md:mb-4 hidden lg:flex flex-row items-center justify-between gap-2">
        <h2 className="hidden lg:block text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">本日のスケジュール</h2>
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 md:gap-1.5">
            <input
              type="number"
              value={newHour}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                  setNewHour(value);
                  // エラーをクリア（タイマーもクリア）
                  if (addError) {
                    if (errorTimeoutRef.current) {
                      clearTimeout(errorTimeoutRef.current);
                      errorTimeoutRef.current = null;
                    }
                    setAddError('');
                  }
                }
              }}
              min="0"
              max="23"
              className={`w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                addError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
              }`}
              placeholder="時"
            />
            <span className="text-gray-600 text-base md:text-base">:</span>
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
              className="w-12 md:w-14 rounded-md border border-gray-300 px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="分"
            />
          </div>
          <button
            onClick={addTimeLabel}
            className="flex items-center gap-1 md:gap-1.5 rounded-md bg-amber-600 px-2 md:px-3 py-1 md:py-1.5 text-base md:text-base font-medium text-white transition-colors hover:bg-amber-700"
            aria-label="時間ラベルを追加"
          >
            <HiPlus className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span>追加</span>
          </button>
        </div>
      </div>

      {localTimeLabels.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
          <div>
            <div className="mb-3 md:mb-5 flex justify-center">
              <HiClock className="h-12 w-12 md:h-20 md:w-20 text-gray-300" />
            </div>
            <p className="text-base md:text-lg font-medium">時間ラベルがありません</p>
            <p className="mt-1.5 md:mt-3 text-base md:text-base text-gray-400">時間を入力して「追加」ボタンから時間ラベルを追加してください</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2 md:space-y-1">
            {sortedTimeLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 md:gap-2.5 py-2 md:py-1.5"
              >
                {/* 時間表示 */}
                <div className="w-14 md:w-14 flex-shrink-0">
                  <div 
                    onClick={() => handleEditLabel(label.id)}
                    className="text-base md:text-base font-medium text-gray-700 select-none cursor-pointer hover:text-amber-600 transition-colors tabular-nums"
                  >
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
                    className="w-full bg-transparent border-0 border-b-2 border-gray-300 px-0 py-1 md:py-1 text-base md:text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-0"
                    placeholder="内容を入力"
                  />
                </div>
              </div>
            ))}
            {/* モバイル版：時間入力欄をスケジュールの下に表示 */}
            <div className="mt-3 md:mt-4 flex lg:hidden items-center justify-center gap-1.5 md:gap-2 pb-2">
              <div className="flex items-center gap-1 md:gap-1.5">
                <input
                  type="number"
                  value={newHour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                      setNewHour(value);
                      // エラーをクリア（タイマーもクリア）
                      if (addError) {
                        if (errorTimeoutRef.current) {
                          clearTimeout(errorTimeoutRef.current);
                          errorTimeoutRef.current = null;
                        }
                        setAddError('');
                      }
                    }
                  }}
                  min="0"
                  max="23"
                  className={`w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-sm md:text-base text-gray-900 text-center focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    addError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                  placeholder="時"
                />
                <span className="text-gray-600 text-base md:text-base">:</span>
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
                  className="w-12 md:w-14 rounded-md border border-gray-300 px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="分"
                />
              </div>
              <button
                onClick={addTimeLabel}
                className="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-amber-600 px-2 md:px-3 py-1 md:py-1.5 text-base md:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px]"
                aria-label="時間ラベルを追加"
              >
                <HiPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">追加</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* モバイル版：時間入力欄をスケジュールの下に表示 */}
      {localTimeLabels.length === 0 && (
        <div className="mt-3 md:mt-4 flex lg:hidden items-center justify-center gap-1.5 md:gap-2">
          <div className="flex items-center gap-1 md:gap-1.5">
            <input
              type="number"
              value={newHour}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                  setNewHour(value);
                  // エラーをクリア（タイマーもクリア）
                  if (addError) {
                    if (errorTimeoutRef.current) {
                      clearTimeout(errorTimeoutRef.current);
                      errorTimeoutRef.current = null;
                    }
                    setAddError('');
                  }
                }
              }}
              min="0"
              max="23"
              className={`w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                addError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
              }`}
              placeholder="時"
            />
            <span className="text-gray-600 text-base md:text-base">:</span>
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
              className="w-12 md:w-14 rounded-md border border-gray-300 px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="分"
            />
          </div>
          <button
            onClick={addTimeLabel}
            className="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-amber-600 px-2 md:px-3 py-1 md:py-1.5 text-sm md:text-base font-medium text-white transition-colors hover:bg-amber-700 min-w-[44px] min-h-[44px]"
            aria-label="時間ラベルを追加"
          >
            <HiPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">追加</span>
          </button>
        </div>
      )}

      {/* 時間編集ダイアログ */}
      {editingLabelId && (() => {
        const editingLabel = localTimeLabels.find((label) => label.id === editingLabelId);
        if (!editingLabel) return null;
        
        const parseTime = (timeStr: string) => {
          if (!timeStr) return { hour: '', minute: '' };
          const [hour, minute] = timeStr.split(':');
          return { hour: hour || '', minute: minute || '' };
        };
        
        const initialTime = parseTime(editingLabel.time);
        
        return (
          <TimeEditDialog
            initialHour={initialTime.hour}
            initialMinute={initialTime.minute}
            onSave={(hour, minute) => handleEditSave(editingLabelId, hour, minute)}
            onDelete={() => deleteTimeLabel(editingLabelId)}
            onCancel={handleEditCancel}
          />
        );
      })()}
    </div>
  );
}

interface TimeEditDialogProps {
  initialHour: string;
  initialMinute: string;
  onSave: (hour: string, minute: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function TimeEditDialog({
  initialHour,
  initialMinute,
  onSave,
  onDelete,
  onCancel,
}: TimeEditDialogProps) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  // initialHour/initialMinuteが変更されたときにstateを更新
  useEffect(() => {
    setHour(initialHour);
    setMinute(initialMinute);
  }, [initialHour, initialMinute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hour) return;
    onSave(hour, minute);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-gray-300" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-5 flex items-center justify-between">
          <h3 className="text-2xl md:text-2xl font-semibold text-gray-800">時間を編集</h3>
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-200 p-1.5 md:p-2.5 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-3 md:space-y-5 max-w-md mx-auto">
            {/* 時間選択 */}
            <div>
              <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700 text-center">
                時間 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <input
                  type="number"
                  value={hour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                      setHour(value);
                    }
                  }}
                  min="0"
                  max="23"
                  required
                  className="w-16 md:w-24 rounded-md border border-gray-300 px-2 md:px-4 py-1.5 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="時"
                />
                <span className="text-gray-600 text-base md:text-xl">:</span>
                <input
                  type="number"
                  value={minute}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setMinute(value);
                    }
                  }}
                  min="0"
                  max="59"
                  className="w-16 md:w-24 rounded-md border border-gray-300 px-2 md:px-4 py-1.5 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="分"
                />
              </div>
            </div>

            {/* フッター */}
            <div className="flex gap-2 md:gap-4 pt-3 md:pt-5 border-t border-gray-200 justify-center">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 md:px-5 py-1.5 md:py-2.5 text-base md:text-lg text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onCancel();
                }}
                className="px-3 md:px-5 py-1.5 md:py-2.5 text-base md:text-lg bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors min-h-[44px]"
              >
                削除
              </button>
              <button
                type="submit"
                disabled={!hour}
                className="px-4 md:px-6 py-1.5 md:py-2.5 text-base md:text-lg bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium min-h-[44px] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


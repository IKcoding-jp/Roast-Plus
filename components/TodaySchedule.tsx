'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { AppData, TodaySchedule, TimeLabel } from '@/types';
import { HiPlus, HiX, HiClock, HiUser, HiArrowDown } from 'react-icons/hi';

interface TodayScheduleProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
  selectedDate: string; // YYYY-MM-DD形式
  isToday: boolean; // 選択日が今日かどうか
}

interface TodayScheduleInnerProps extends TodayScheduleProps {
  currentSchedule: TodaySchedule;
}

export function TodaySchedule(props: TodayScheduleProps) {
  const { data, selectedDate } = props;
  const todaySchedules = data?.todaySchedules ?? [];
  const currentSchedule =
    todaySchedules.find((s) => s.date === selectedDate) || {
      id: `schedule-${selectedDate}`,
      date: selectedDate,
      timeLabels: [],
    };
  const scheduleKey = `${selectedDate}-${todaySchedules
    .map((s) => `${s.id}:${s.timeLabels?.length ?? 0}`)
    .join('|')}`;

  return <TodayScheduleInner key={scheduleKey} {...props} currentSchedule={currentSchedule} />;
}

function TodayScheduleInner({ data, onUpdate, selectedDate, currentSchedule }: TodayScheduleInnerProps) {
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

  const lastDataRef = useRef<string>('');
  const lastSelectedDateRef = useRef<string>(selectedDate);
  const localTimeLabelsRef = useRef<TimeLabel[]>(currentSchedule.timeLabels || []);

  // 初期値をdataから取得
  const [localTimeLabels, setLocalTimeLabels] = useState<TimeLabel[]>(currentSchedule.timeLabels || []);
  const [newHour, setNewHour] = useState<string>('');
  const [newMinute, setNewMinute] = useState<string>('');

  const clearAddError = useCallback(() => {
    if (addError) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      setAddError('');
    }
  }, [addError]);

  const handleHourInputChange = useCallback(
    (value: string) => {
      const hour = parseInt(value, 10);
      if (value === '' || (!Number.isNaN(hour) && hour >= 0 && hour <= 23)) {
        setNewHour(value);
        clearAddError();
      }
    },
    [clearAddError]
  );

  const handleMinuteInputChange = useCallback((value: string) => {
    const minute = parseInt(value, 10);
    if (value === '' || (!Number.isNaN(minute) && minute >= 0 && minute <= 59)) {
      setNewMinute(value);
    }
  }, []);

  useEffect(() => {
    lastSelectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    const initialLabels = currentSchedule.timeLabels || [];
    originalTimeLabelsRef.current = JSON.parse(JSON.stringify(initialLabels));
    localTimeLabelsRef.current = JSON.parse(JSON.stringify(initialLabels));
    todayScheduleIdRef.current = currentSchedule.id;
    lastDataRef.current = JSON.stringify(initialLabels);
  }, [currentSchedule]);

  // デバウンス保存関数
  const debouncedSave = useCallback(
    (newTimeLabels: TimeLabel[], targetDate: string) => {
      if (isComposing) {
        return; // IME変換中は保存しない
      }

      // 選択日が変わった場合は保存しない（古い日付のデータを保存しないようにする）
      if (targetDate !== selectedDate) {
        return;
      }

      // 既存のタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // 新しいタイマーを設定（500ms後に保存）
      debounceTimerRef.current = setTimeout(() => {
        // 再度選択日をチェック（タイマー実行時にも選択日が変わっていないか確認）
        if (targetDate !== selectedDate) {
          return;
        }

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
        const existingIndex = updatedSchedules.findIndex((s) => s.date === targetDate);

        const updatedSchedule: TodaySchedule = {
          id: todayScheduleIdRef.current || `schedule-${targetDate}`,
          date: targetDate,
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
        // useAppData.tsとタイミングを整合させるため100msに設定
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }, 500);
    },
    [selectedDate, isComposing]
  );

  // ローカル状態が変更されたらデバウンス保存
  useEffect(() => {
    if (isUpdatingRef.current) {
      return; // 更新中は保存しない
    }

    // 選択日が変わった場合は保存しない
    if (lastSelectedDateRef.current !== selectedDate) {
      return;
    }

    // localTimeLabelsRefを更新
    localTimeLabelsRef.current = JSON.parse(JSON.stringify(localTimeLabels));

    const originalTimeLabels = originalTimeLabelsRef.current;

    // 長さが異なる場合
    if (localTimeLabels.length !== originalTimeLabels.length) {
      debouncedSave(localTimeLabels, selectedDate);
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
      debouncedSave(localTimeLabels, selectedDate);
    }
  }, [localTimeLabels, debouncedSave, selectedDate]);

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
        const currentSelectedDate = lastSelectedDateRef.current;

        // 選択日が変わっている場合は保存しない
        if (currentSelectedDate !== selectedDate) {
          return;
        }

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
            const updatedSchedules = [...(currentData.todaySchedules || [])];
            const existingIndex = updatedSchedules.findIndex((s) => s.date === currentSelectedDate);

            const updatedSchedule: TodaySchedule = {
              id: todayScheduleIdRef.current || `schedule-${currentSelectedDate}`,
              date: currentSelectedDate,
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
  }, [selectedDate]);

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

  const handleEditCancel = () => {
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
      debouncedSave(localTimeLabels, selectedDate);
    }, 300);
  };

  // 時間順にソートしてグループ化
  const groupedTimeLabels = useMemo(() => {
    const groups: { time: string; labels: TimeLabel[] }[] = [];

    // まず時間順にソート
    const sorted = [...localTimeLabels].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });

    // グループ化
    sorted.forEach((label) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.time === label.time) {
        lastGroup.labels.push(label);
      } else {
        groups.push({
          time: label.time,
          labels: [label],
        });
      }
    });

    return groups;
  }, [localTimeLabels]);

  // グループ単位での編集・削除用
  const handleEditGroup = (time: string) => {
    // その時間の最初のラベルのIDを使って編集ダイアログを開く（保存時にtimeを使って一括更新する）
    const label = localTimeLabels.find(l => l.time === time);
    if (label) {
      setEditingLabelId(label.id); // IDはダイアログ表示のトリガーとしてのみ使用
    }
  };

  const handleEditGroupSave = (oldTime: string, newHour: string, newMinute: string) => {
    if (!newHour) return;

    const formattedHour = newHour.padStart(2, '0');
    const formattedMinute = newMinute ? newMinute.padStart(2, '0') : '00';
    const newTime = `${formattedHour}:${formattedMinute}`;

    // 同じ時間のラベルを全て更新
    setLocalTimeLabels(
      localTimeLabels.map((label) =>
        label.time === oldTime ? { ...label, time: newTime } : label
      )
    );
    setEditingLabelId(null);
  };

  const handleDeleteLabel = (id: string) => {
    const target = localTimeLabels.find((label) => label.id === id);
    setLocalTimeLabels((prev) => {
      const next = prev.filter((label) => label.id !== id);
      if (target) {
        const sameTimeRemaining = next.filter((label) => label.time === target.time);
        setEditingLabelId(sameTimeRemaining[0]?.id ?? null);
      } else {
        setEditingLabelId(null);
      }
      return next;
    });
  };

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 md:p-6 shadow-xl border-2 border-gray-300 h-full flex flex-col backdrop-blur-sm">
      {/* デスクトップ版：タイトルと時間入力欄を横並び */}
      <div className="mb-3 md:mb-4 hidden lg:flex flex-row items-center justify-between gap-2">
        <h2 className="hidden lg:block text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">本日のスケジュール</h2>
        <TimeInputRow
          newHour={newHour}
          newMinute={newMinute}
          addError={addError}
          onHourChange={handleHourInputChange}
          onMinuteChange={handleMinuteInputChange}
          onAdd={addTimeLabel}
          wrapperClassName="flex items-center gap-1.5 md:gap-2 flex-shrink-0"
          buttonClassName="flex items-center gap-1 md:gap-1.5 rounded-md bg-primary px-2 md:px-3 py-1 md:py-1.5 text-base md:text-base font-medium text-white transition-colors hover:bg-primary-dark shadow-md"
        />
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
          <div className="space-y-2 md:space-y-1.5">
            {groupedTimeLabels.map((group) => (
              <div
                key={group.time}
                className="group flex items-baseline gap-3 md:gap-4 py-2.5 md:py-2 px-3 md:px-2.5 rounded-lg bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 transition-all duration-200"
              >
                {/* 時間表示（グループ共通） */}
                <div
                  onClick={() => handleEditGroup(group.time)}
                  className="flex-shrink-0 w-16 md:w-18 text-center px-2 py-1 bg-white rounded-md text-sm md:text-base font-semibold text-gray-800 group-hover:text-amber-700 group-hover:bg-amber-100 cursor-pointer transition-colors tabular-nums shadow-sm"
                >
                  {group.time || '--:--'}
                </div>

                {/* 内容入力（複数） */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {group.labels.map((label) => (
                    <div key={label.id} className={`w-full ${label.continuesUntil ? 'border-l-2 border-dashed border-amber-400 pl-3' : ''}`}>
                      {/* メインコンテンツ行 */}
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="text"
                          value={label.content}
                          onChange={(e) => updateTimeLabel(label.id, { content: e.target.value })}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd}
                          className="flex-1 min-w-0 bg-transparent border-0 border-b border-transparent focus:border-amber-400 text-base md:text-base text-gray-900 focus:outline-none placeholder:text-gray-400 transition-colors py-1"
                          placeholder="内容を入力"
                        />
                        {/* 時間経過終了時間の表示 */}
                        {label.continuesUntil && (
                          <span className="flex-shrink-0 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            〜{label.continuesUntil}まで
                          </span>
                        )}
                      </div>
                      
                      {/* 担当者表示 */}
                      {label.assignee && (
                        <div className="flex items-center gap-1.5 mt-1 ml-1">
                          <HiUser className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {label.assignee}
                          </span>
                        </div>
                      )}
                      
                      {/* サブタスク表示 */}
                      {label.subTasks && label.subTasks.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1.5">
                          {label.subTasks
                            .sort((a, b) => a.order - b.order)
                            .map((subTask) => (
                              <div key={subTask.id} className="flex items-start gap-2">
                                <HiArrowDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-sm text-gray-700">{subTask.content}</span>
                                  {subTask.assignee && (
                                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                      {subTask.assignee}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* モバイル版：時間入力欄をスケジュールの下に表示 */}
            <TimeInputRow
              newHour={newHour}
              newMinute={newMinute}
              addError={addError}
              onHourChange={handleHourInputChange}
              onMinuteChange={handleMinuteInputChange}
              onAdd={addTimeLabel}
              wrapperClassName="mt-3 md:mt-4 flex lg:hidden items-center justify-center gap-1.5 md:gap-2 pb-2"
              buttonClassName="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-primary px-2 md:px-3 py-1 md:py-1.5 text-base md:text-base font-medium text-white transition-colors hover:bg-primary-dark shadow-md min-w-[44px] min-h-[44px]"
              labelClassName="hidden sm:inline"
            />
          </div>
        </div>
      )}

      {/* モバイル版：時間入力欄をスケジュールの下に表示 */}
      {localTimeLabels.length === 0 && (
        <TimeInputRow
          newHour={newHour}
          newMinute={newMinute}
          addError={addError}
          onHourChange={handleHourInputChange}
          onMinuteChange={handleMinuteInputChange}
          onAdd={addTimeLabel}
          wrapperClassName="mt-3 md:mt-4 flex lg:hidden items-center justify-center gap-1.5 md:gap-2"
          buttonClassName="flex items-center justify-center gap-1 md:gap-1.5 rounded-md bg-primary px-2 md:px-3 py-1 md:py-1.5 text-sm md:text-base font-medium text-white transition-colors hover:bg-primary-dark shadow-md min-w-[44px] min-h-[44px]"
          labelClassName="hidden sm:inline"
        />
      )}


      {/* 時間編集ダイアログ */}
      {editingLabelId && typeof window !== 'undefined' && (() => {
        const editingLabel = localTimeLabels.find((label) => label.id === editingLabelId);
        if (!editingLabel) return null;

        const parseTime = (timeStr: string) => {
          if (!timeStr) return { hour: '', minute: '' };
          const [hour, minute] = timeStr.split(':');
          return { hour: hour || '', minute: minute || '' };
        };

        const initialTime = parseTime(editingLabel.time);

        const labelsForTime = localTimeLabels.filter((label) => label.time === editingLabel.time);
        return createPortal(
          <TimeEditDialog
            key={editingLabel.id}
            initialHour={initialTime.hour}
            initialMinute={initialTime.minute}
            onSave={(hour, minute) => handleEditGroupSave(editingLabel.time, hour, minute)}
            labels={labelsForTime}
            onDeleteLabel={handleDeleteLabel}
            onCancel={handleEditCancel}
          />,
          document.body
        );
      })()}
    </div>
  );
}

type TimeInputRowProps = {
  newHour: string;
  newMinute: string;
  addError: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onAdd: () => void;
  wrapperClassName: string;
  buttonClassName: string;
  labelClassName?: string;
};

function TimeInputRow({
  newHour,
  newMinute,
  addError,
  onHourChange,
  onMinuteChange,
  onAdd,
  wrapperClassName,
  buttonClassName,
  labelClassName,
}: TimeInputRowProps) {
  const hourInputClass = `w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    addError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
  }`;
  const minuteInputClass =
    'w-12 md:w-14 rounded-md border border-gray-300 px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

  return (
    <div className={wrapperClassName}>
      <div className="flex items-center gap-1 md:gap-1.5">
        <input
          type="number"
          value={newHour}
          onChange={(e) => onHourChange(e.target.value)}
          min="0"
          max="23"
          className={hourInputClass}
          placeholder="時"
        />
        <span className="text-gray-600 text-base md:text-base">:</span>
        <input
          type="number"
          value={newMinute}
          onChange={(e) => onMinuteChange(e.target.value)}
          min="0"
          max="59"
          className={minuteInputClass}
          placeholder="分"
        />
      </div>
      <button
        onClick={onAdd}
        className={buttonClassName}
        aria-label="時間ラベルを追加"
      >
        <HiPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className={labelClassName}>追加</span>
      </button>
    </div>
  );
}

interface TimeEditDialogProps {
  initialHour: string;
  initialMinute: string;
  onSave: (hour: string, minute: string) => void;
  onCancel: () => void;
  labels: TimeLabel[];
  onDeleteLabel: (id: string) => void;
}

function TimeEditDialog({
  initialHour,
  initialMinute,
  onSave,
  onCancel,
  labels,
  onDeleteLabel,
}: TimeEditDialogProps) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hour) return;
    onSave(hour, minute);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100] p-4" onClick={onCancel}>
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

            {/* この時間のラベル一覧（個別削除） */}
            {labels.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h4 className="text-base md:text-lg font-medium text-gray-800">この時間のラベル</h4>
                <div className="space-y-2">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center gap-2 md:gap-3 rounded-md border border-gray-200 px-3 py-2 bg-gray-50"
                    >
                      <div className="flex-1 text-sm md:text-base text-gray-800 truncate">
                        {label.content || '内容なし'}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteLabel(label.id)}
                        className="px-2 md:px-3 py-1 md:py-1.5 text-sm md:text-sm bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors min-h-[36px]"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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


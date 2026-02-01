'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { AppData, TodaySchedule as TodayScheduleType, TimeLabel } from '@/types';
import { HiClock, HiUser, HiArrowDown } from 'react-icons/hi';
import { useTodayScheduleSync } from '@/hooks/useTodayScheduleSync';
import { TimeInputRow } from '@/components/today-schedule/TimeInputRow';
import { TimeEditDialog } from '@/components/today-schedule/TimeEditDialog';

interface TodayScheduleProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
  selectedDate: string;
  isToday: boolean;
}

interface TodayScheduleInnerProps extends TodayScheduleProps {
  currentSchedule: TodayScheduleType;
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
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);

  const {
    localTimeLabels,
    setLocalTimeLabels,
    newHour,
    newMinute,
    addError,
    handleHourInputChange,
    handleMinuteInputChange,
    handleCompositionStart,
    handleCompositionEnd,
    addTimeLabel,
    updateTimeLabel,
  } = useTodayScheduleSync({ data, onUpdate, selectedDate, currentSchedule });

  // 時間順にソートしてグループ化
  const groupedTimeLabels = useMemo(() => {
    const groups: { time: string; labels: TimeLabel[] }[] = [];
    const sorted = [...localTimeLabels].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

    sorted.forEach((label) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.time === label.time) {
        lastGroup.labels.push(label);
      } else {
        groups.push({ time: label.time, labels: [label] });
      }
    });

    return groups;
  }, [localTimeLabels]);

  const handleEditGroup = (time: string) => {
    const label = localTimeLabels.find(l => l.time === time);
    if (label) setEditingLabelId(label.id);
  };

  const handleEditGroupSave = (oldTime: string, newHourVal: string, newMinuteVal: string) => {
    if (!newHourVal) return;
    const formattedHour = newHourVal.padStart(2, '0');
    const formattedMinute = newMinuteVal ? newMinuteVal.padStart(2, '0') : '00';
    const newTime = `${formattedHour}:${formattedMinute}`;

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
                {/* 時間表示 */}
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
                        {label.continuesUntil && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            〜{label.continuesUntil}まで
                          </span>
                        )}
                      </div>

                      {label.assignee && (
                        <div className="flex items-center gap-1.5 mt-1 ml-1">
                          <HiUser className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {label.assignee}
                          </span>
                        </div>
                      )}

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

      {/* モバイル版：空状態用の時間入力 */}
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
            onCancel={() => setEditingLabelId(null)}
          />,
          document.body
        );
      })()}
    </div>
  );
}

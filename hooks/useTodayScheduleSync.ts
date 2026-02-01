import { useState, useEffect, useRef, useCallback } from 'react';
import type { AppData, TodaySchedule, TimeLabel } from '@/types';

interface UseTodayScheduleSyncOptions {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
  selectedDate: string;
  currentSchedule: TodaySchedule;
}

export function useTodayScheduleSync({
  data,
  onUpdate,
  selectedDate,
  currentSchedule,
}: UseTodayScheduleSyncOptions) {
  const [isComposing, setIsComposing] = useState(false);
  const [localTimeLabels, setLocalTimeLabels] = useState<TimeLabel[]>(currentSchedule.timeLabels || []);
  const [newHour, setNewHour] = useState<string>('');
  const [newMinute, setNewMinute] = useState<string>('');
  const [addError, setAddError] = useState<string>('');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  const dataRef = useRef<AppData | null>(data);
  const todayScheduleIdRef = useRef<string>('');
  const originalTimeLabelsRef = useRef<TimeLabel[]>([]);
  const onUpdateRef = useRef(onUpdate);
  const lastDataRef = useRef<string>('');
  const lastSelectedDateRef = useRef<string>(selectedDate);
  const localTimeLabelsRef = useRef<TimeLabel[]>(currentSchedule.timeLabels || []);

  // 最新の参照を保持
  useEffect(() => {
    dataRef.current = data;
    onUpdateRef.current = onUpdate;
  }, [data, onUpdate]);

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

  // デバウンス保存関数
  const debouncedSave = useCallback(
    (newTimeLabels: TimeLabel[], targetDate: string) => {
      if (isComposing) return;
      if (targetDate !== selectedDate) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      debounceTimerRef.current = setTimeout(() => {
        if (targetDate !== selectedDate) return;

        const currentData = dataRef.current;
        if (!currentData) return;

        const newTimeLabelsStr = JSON.stringify(newTimeLabels);
        const originalStr = JSON.stringify(originalTimeLabelsRef.current);
        if (originalStr === newTimeLabelsStr) return;

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

        originalTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
        localTimeLabelsRef.current = JSON.parse(JSON.stringify(newTimeLabels));
        todayScheduleIdRef.current = updatedSchedule.id;
        lastDataRef.current = newTimeLabelsStr;

        onUpdateRef.current(updatedData);

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }, 500);
    },
    [selectedDate, isComposing]
  );

  // ローカル状態が変更されたらデバウンス保存
  useEffect(() => {
    if (isUpdatingRef.current) return;
    if (lastSelectedDateRef.current !== selectedDate) return;

    localTimeLabelsRef.current = JSON.parse(JSON.stringify(localTimeLabels));

    const originalTimeLabels = originalTimeLabelsRef.current;

    if (localTimeLabels.length !== originalTimeLabels.length) {
      debouncedSave(localTimeLabels, selectedDate);
      return;
    }

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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (!isUpdatingRef.current) {
        const currentTimeLabels = localTimeLabelsRef.current;
        const originalTimeLabels = originalTimeLabelsRef.current;
        const currentSelectedDate = lastSelectedDateRef.current;

        if (currentSelectedDate !== selectedDate) return;

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

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(localTimeLabels, selectedDate);
    }, 300);
  };

  const addTimeLabel = () => {
    if (!newHour) {
      setAddError('数字を入力してください');

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      errorTimeoutRef.current = setTimeout(() => {
        setAddError('');
        errorTimeoutRef.current = null;
      }, 3000);

      return;
    }

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setAddError('');

    const hour = newHour.padStart(2, '0');
    const minute = newMinute ? newMinute.padStart(2, '0') : '00';
    const time = `${hour}:${minute}`;

    const newLabel: TimeLabel = {
      id: `time-${Date.now()}`,
      time: time,
      content: '',
      memo: '',
      order: localTimeLabels.length,
    };
    setLocalTimeLabels([...localTimeLabels, newLabel]);
    setNewHour('');
    setNewMinute('');
  };

  const updateTimeLabel = (id: string, updates: Partial<TimeLabel>) => {
    setLocalTimeLabels(
      localTimeLabels.map((label) => (label.id === id ? { ...label, ...updates } : label))
    );
  };

  return {
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
  };
}

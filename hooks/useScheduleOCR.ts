import { useCallback } from 'react';
import type { AppData, TimeLabel, RoastSchedule } from '@/types';
import { useToastContext } from '@/components/Toast';

interface UseScheduleOCRProps {
  data: AppData | null;
  selectedDate: string;
  updateData: (data: AppData) => void;
}

export function useScheduleOCR({ data, selectedDate, updateData }: UseScheduleOCRProps) {
  const { showToast } = useToastContext();

  const handleOCRSuccess = useCallback(
    (mode: 'replace' | 'add', timeLabels: TimeLabel[], roastSchedules: RoastSchedule[]) => {
      if (!data) return;

      // 既存のデータとマージするか確認
      const existingTodaySchedule = data.todaySchedules?.find((s) => s.date === selectedDate);

      if (mode === 'replace') {
        // 置き換え
        const updatedTodaySchedules = [...(data.todaySchedules || [])];
        const existingTodayIndex = updatedTodaySchedules.findIndex((s) => s.date === selectedDate);
        const newTodaySchedule = {
          id: existingTodaySchedule?.id || `schedule-${selectedDate}`,
          date: selectedDate,
          timeLabels,
        };

        if (existingTodayIndex >= 0) {
          updatedTodaySchedules[existingTodayIndex] = newTodaySchedule;
        } else {
          updatedTodaySchedules.push(newTodaySchedule);
        }

        // ローストスケジュールを置き換え
        const updatedRoastSchedules = [
          ...(data.roastSchedules || []).filter((s) => s.date !== selectedDate),
          ...roastSchedules,
        ];

        updateData({
          ...data,
          todaySchedules: updatedTodaySchedules,
          roastSchedules: updatedRoastSchedules,
        });
      } else {
        // 追加（既存のスケジュールに追加）
        const updatedTodaySchedules = [...(data.todaySchedules || [])];
        const existingTodayIndex = updatedTodaySchedules.findIndex((s) => s.date === selectedDate);

        if (existingTodayIndex >= 0) {
          // 既存のスケジュールに追加（重複を避ける）
          const existingTimeLabels = updatedTodaySchedules[existingTodayIndex].timeLabels || [];
          const mergedTimeLabels = [...existingTimeLabels];

          timeLabels.forEach((newLabel) => {
            // 同じ時間のラベルが既に存在するかチェック
            const exists = existingTimeLabels.some((label) => label.time === newLabel.time);
            if (!exists) {
              mergedTimeLabels.push(newLabel);
            }
          });

          // 時間順にソート
          mergedTimeLabels.sort((a, b) => a.time.localeCompare(b.time));
          mergedTimeLabels.forEach((label, index) => {
            label.order = index;
          });

          updatedTodaySchedules[existingTodayIndex] = {
            ...updatedTodaySchedules[existingTodayIndex],
            timeLabels: mergedTimeLabels,
          };
        } else {
          updatedTodaySchedules.push({
            id: `schedule-${selectedDate}`,
            date: selectedDate,
            timeLabels,
          });
        }

        // ローストスケジュールを追加
        const updatedRoastSchedules = [...(data.roastSchedules || []), ...roastSchedules];

        updateData({
          ...data,
          todaySchedules: updatedTodaySchedules,
          roastSchedules: updatedRoastSchedules,
        });
      }

      showToast('スケジュールを読み取りました。', 'success');
    },
    [data, selectedDate, updateData, showToast]
  );

  return { handleOCRSuccess };
}

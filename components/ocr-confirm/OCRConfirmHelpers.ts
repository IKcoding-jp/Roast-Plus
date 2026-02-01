import type { TimeLabel, RoastSchedule } from '@/types';

export type TabType = 'timeLabels' | 'roastSchedules';

export const sortTimeLabels = (labels: TimeLabel[]) => {
  const sorted = [...labels].sort((a, b) => {
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });
  return sorted.map((label, index) => ({ ...label, order: index }));
};

export const sortRoastSchedules = (schedules: RoastSchedule[]) => {
  const sortedRoastSchedules = [...schedules];

  sortedRoastSchedules.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

  const schedulesWithSortTime: Array<{ schedule: RoastSchedule; sortTime: string }> = [];
  let lastRoastTime = '00:00';

  for (const schedule of sortedRoastSchedules) {
    let sortTime = schedule.time || '';

    if (schedule.isAfterPurge && !sortTime) {
      sortTime = lastRoastTime;
    } else if (sortTime) {
      lastRoastTime = sortTime;
    } else {
      sortTime = '99:99';
    }

    schedulesWithSortTime.push({ schedule, sortTime });
  }

  schedulesWithSortTime.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
  return schedulesWithSortTime.map(({ schedule }, index) => ({ ...schedule, order: index }));
};

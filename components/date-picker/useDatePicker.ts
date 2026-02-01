import { useState, useMemo } from 'react';

export type ViewMode = 'calendar' | 'year' | 'month';

interface UseDatePickerProps {
  selectedDate: string;
  isWeekend: (dateString: string) => boolean;
  getTodayString: () => string;
}

export function useDatePicker({ selectedDate, isWeekend, getTodayString }: UseDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate + 'T00:00:00');
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  });

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const today = getTodayString();
  const todayDate = new Date(today + 'T00:00:00');
  const currentYear = todayDate.getFullYear();

  // 翌日の日付を取得
  const getTomorrowString = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 次の平日を取得する関数
  const getNextWeekday = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrow = getTomorrowString();
  // 翌日（土日なら次の平日）が最大選択可能日
  const maxSelectableDate = isWeekend(tomorrow) ? getNextWeekday(today) : tomorrow;
  const maxSelectableDateObj = useMemo(
    () => new Date(maxSelectableDate + 'T00:00:00'),
    [maxSelectableDate]
  );

  // 日付文字列フォーマット関数
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.year;
    const month = currentMonth.month;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; dateString: string }> = [];

    // 前月の日付（カレンダー表示用）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        dateString: formatDateString(date),
      });
    }

    // 今月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        dateString: formatDateString(date),
      });
    }

    // 次月の日付（カレンダー表示用、42日分になるように）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        dateString: formatDateString(date),
      });
    }

    return days;
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    const nextMonth = currentMonth.month === 11
      ? { year: currentMonth.year + 1, month: 0 }
      : { year: currentMonth.year, month: currentMonth.month + 1 };
    const nextMonthFirstDay = new Date(nextMonth.year, nextMonth.month, 1);

    // 最大選択可能日より未来の月には進めない
    if (nextMonthFirstDay > maxSelectableDateObj) {
      return;
    }

    setCurrentMonth(nextMonth);
  };

  const handleYearMonthClick = () => {
    setViewMode('year');
    setSelectedYear(null);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setViewMode('month');
  };

  const handleMonthSelect = (month: number) => {
    setCurrentMonth({ year: selectedYear!, month });
    setViewMode('calendar');
    setSelectedYear(null);
  };

  const canGoToNextMonth = useMemo(() => {
    const nextMonth = currentMonth.month === 11
      ? { year: currentMonth.year + 1, month: 0 }
      : { year: currentMonth.year, month: currentMonth.month + 1 };
    const nextMonthFirstDay = new Date(nextMonth.year, nextMonth.month, 1);
    return nextMonthFirstDay <= maxSelectableDateObj;
  }, [currentMonth, maxSelectableDateObj]);

  const handleDateClick = (dateString: string, onSelect: (date: string) => void) => {
    // 土日は選択不可
    if (isWeekend(dateString)) {
      return;
    }

    // 最大選択可能日より先は選択不可
    if (dateString > maxSelectableDate) {
      return;
    }

    onSelect(dateString);
  };

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ];

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // 年リストを生成（現在の年から10年前まで）
  const yearList = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i <= 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  return {
    currentMonth,
    viewMode,
    setViewMode,
    selectedYear,
    setSelectedYear,
    today,
    todayDate,
    currentYear,
    maxSelectableDate,
    calendarDays,
    canGoToNextMonth,
    yearList,
    monthNames,
    weekdays,
    handlePreviousMonth,
    handleNextMonth,
    handleYearMonthClick,
    handleYearSelect,
    handleMonthSelect,
    handleDateClick,
  };
}

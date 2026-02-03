import { useState, useCallback, useEffect } from 'react';

export function useScheduleDateNavigation() {
  // 今日の日付を取得（YYYY-MM-DD形式）
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 翌日の日付を取得
  const getTomorrowString = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 土日判定関数（0=日曜、6=土曜）
  const isWeekend = useCallback((dateString: string): boolean => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }, []);

  // 前の平日を取得する関数
  const getPreviousWeekday = useCallback((dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() - 1);

    // 土日をスキップ
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 次の平日を取得する関数
  const getNextWeekday = useCallback((dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() + 1);

    // 土日をスキップ
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 初期日付を取得（今日が土日の場合は前の平日）
  const getInitialDate = useCallback((): string => {
    const today = getTodayString();
    if (isWeekend(today)) {
      return getPreviousWeekday(today);
    }
    return today;
  }, [isWeekend, getPreviousWeekday]);

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 日付と時刻のフォーマット関数
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    return `${year}年${month}月${day}日（${weekday}）`;
  };

  const formatDateString = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return formatDate(date);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  // 日付移動関数
  const moveToPreviousDay = () => {
    const previousWeekday = getPreviousWeekday(selectedDate);
    setSelectedDate(previousWeekday);
  };

  const moveToNextDay = useCallback(() => {
    const today = getTodayString();
    const tomorrow = getTomorrowString();
    const nextWeekday = getNextWeekday(selectedDate);

    // 翌日まで移動可能にする
    // 翌日が土日の場合は、次の平日まで移動可能
    const maxDate = isWeekend(tomorrow) ? getNextWeekday(today) : tomorrow;
    if (nextWeekday <= maxDate) {
      setSelectedDate(nextWeekday);
    }
  }, [selectedDate, getNextWeekday, isWeekend]);

  // 選択日が今日かどうか（実際の今日の日付と比較）
  const today = getTodayString();
  const tomorrow = getTomorrowString();
  const isToday = selectedDate === today;
  // 翌日（土日なら次の平日）が最大選択可能日
  const maxSelectableDate = isWeekend(tomorrow) ? getNextWeekday(today) : tomorrow;
  const isMaxDate = selectedDate >= maxSelectableDate;

  return {
    selectedDate,
    setSelectedDate,
    currentTime,
    isToday,
    isMaxDate,
    isWeekend,
    getTodayString,
    formatDate,
    formatDateString,
    formatTime,
    moveToPreviousDay,
    moveToNextDay,
  };
}

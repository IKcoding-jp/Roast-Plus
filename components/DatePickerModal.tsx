'use client';

import { useState, useMemo } from 'react';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface DatePickerModalProps {
  selectedDate: string; // YYYY-MM-DD形式
  onSelect: (date: string) => void;
  onCancel: () => void;
  isWeekend: (dateString: string) => boolean;
  getTodayString: () => string;
}

type ViewMode = 'calendar' | 'year' | 'month';

export function DatePickerModal({
  selectedDate,
  onSelect,
  onCancel,
  isWeekend,
  getTodayString,
}: DatePickerModalProps) {
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

  const handleDateClick = (dateString: string) => {
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

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-5 flex items-center justify-between">
          {viewMode === 'calendar' && (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePreviousMonth}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                  aria-label="前月"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleYearMonthClick}
                  className="text-xl md:text-2xl font-semibold text-gray-800 hover:text-amber-600 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-gray-50"
                  aria-label="年月を選択"
                >
                  {currentMonth.year}年{monthNames[currentMonth.month]}
                </button>
                <button
                  onClick={handleNextMonth}
                  disabled={!canGoToNextMonth}
                  className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md transition-colors ${
                    !canGoToNextMonth
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="次月"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
          {viewMode === 'year' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('calendar')}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                aria-label="戻る"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">年を選択</h3>
            </div>
          )}
          {viewMode === 'month' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setViewMode('year');
                  setSelectedYear(null);
                }}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                aria-label="戻る"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                {selectedYear}年の月を選択
              </h3>
            </div>
          )}
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-200 p-1.5 md:p-2.5 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 md:p-6">
          {viewMode === 'calendar' && (
            <>
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekdays.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isSelected = day.dateString === selectedDate;
                  const isWeekendDay = isWeekend(day.dateString);
                  const isFuture = day.dateString > maxSelectableDate;
                  const isToday = day.dateString === today;
                  const isSelectable = !isWeekendDay && !isFuture && day.isCurrentMonth;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day.dateString)}
                      disabled={!isSelectable}
                      className={`
                        min-h-[44px] rounded-md text-sm md:text-base transition-colors
                        ${
                          isSelected
                            ? 'bg-amber-600 text-white font-semibold'
                            : isToday
                            ? 'bg-amber-100 text-amber-900 font-semibold'
                            : isSelectable
                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }
                        ${!day.isCurrentMonth ? 'opacity-40' : ''}
                      `}
                      aria-label={`${day.dateString}を選択`}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'year' && (
            <div className="grid grid-cols-4 gap-2">
              {yearList.map((year) => {
                const isCurrentYear = year === currentYear;
                const isSelectedYear = year === currentMonth.year;
                const isFuture = year > currentYear;

                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    disabled={isFuture}
                    className={`
                      min-h-[60px] rounded-md text-base md:text-lg font-medium transition-colors
                      ${
                        isSelectedYear
                          ? 'bg-amber-600 text-white'
                          : isCurrentYear
                          ? 'bg-amber-100 text-amber-900'
                          : isFuture
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-900 hover:bg-gray-100'
                      }
                    `}
                    aria-label={`${year}年を選択`}
                  >
                    {year}年
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'month' && selectedYear !== null && (
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((monthName, index) => {
                const month = index;
                const monthDate = new Date(selectedYear, month, 1);
                const isCurrentMonth = selectedYear === currentMonth.year && month === currentMonth.month;
                const isFuture = monthDate > todayDate;
                const isSelectable = !isFuture;

                return (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(month)}
                    disabled={!isSelectable}
                    className={`
                      min-h-[60px] rounded-md text-base md:text-lg font-medium transition-colors
                      ${
                        isCurrentMonth
                          ? 'bg-amber-600 text-white'
                          : isSelectable
                          ? 'bg-white text-gray-900 hover:bg-gray-100'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }
                    `}
                    aria-label={`${selectedYear}年${monthName}を選択`}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


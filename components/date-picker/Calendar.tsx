'use client';

import type { ViewMode } from './useDatePicker';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dateString: string;
}

interface CalendarProps {
  viewMode: ViewMode;
  selectedDate: string;
  today: string;
  todayDate: Date;
  currentYear: number;
  currentMonth: { year: number; month: number };
  maxSelectableDate: string;
  calendarDays: CalendarDay[];
  yearList: number[];
  selectedYear: number | null;
  monthNames: string[];
  weekdays: string[];
  isWeekend: (dateString: string) => boolean;
  onDateClick: (dateString: string) => void;
  onYearSelect: (year: number) => void;
  onMonthSelect: (month: number) => void;
}

export function Calendar({
  viewMode,
  selectedDate,
  today,
  todayDate,
  currentYear,
  currentMonth,
  maxSelectableDate,
  calendarDays,
  yearList,
  selectedYear,
  monthNames,
  weekdays,
  isWeekend,
  onDateClick,
  onYearSelect,
  onMonthSelect,
}: CalendarProps) {
  return (
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
                  onClick={() => onDateClick(day.dateString)}
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
                onClick={() => onYearSelect(year)}
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
                onClick={() => onMonthSelect(month)}
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
  );
}

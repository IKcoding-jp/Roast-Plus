'use client';

import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useDatePicker } from './useDatePicker';
import { Calendar } from './Calendar';
import { IconButton, Button } from '@/components/ui';

interface DatePickerModalProps {
  selectedDate: string; // YYYY-MM-DD形式
  onSelect: (date: string) => void;
  onCancel: () => void;
  isWeekend: (dateString: string) => boolean;
  getTodayString: () => string;
}

export function DatePickerModal({
  selectedDate,
  onSelect,
  onCancel,
  isWeekend,
  getTodayString,
}: DatePickerModalProps) {
  const {
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
  } = useDatePicker({ selectedDate, isWeekend, getTodayString });

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
                <IconButton
                  onClick={handlePreviousMonth}
                  className="min-w-[44px] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="前月"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </IconButton>
                <Button
                  variant="ghost"
                  onClick={handleYearMonthClick}
                  className="!min-h-0 !px-2 !py-1 !text-xl md:!text-2xl !font-semibold text-gray-800 hover:text-amber-600 hover:bg-gray-50"
                  aria-label="年月を選択"
                >
                  {currentMonth.year}年{monthNames[currentMonth.month]}
                </Button>
                <IconButton
                  onClick={handleNextMonth}
                  disabled={!canGoToNextMonth}
                  className={`min-w-[44px] ${
                    !canGoToNextMonth
                      ? 'text-gray-300'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="次月"
                >
                  <HiChevronRight className="h-5 w-5" />
                </IconButton>
              </div>
            </>
          )}
          {viewMode === 'year' && (
            <div className="flex items-center gap-4">
              <IconButton
                onClick={() => setViewMode('calendar')}
                className="min-w-[44px] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                aria-label="戻る"
              >
                <HiChevronLeft className="h-5 w-5" />
              </IconButton>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">年を選択</h3>
            </div>
          )}
          {viewMode === 'month' && (
            <div className="flex items-center gap-4">
              <IconButton
                onClick={() => {
                  setViewMode('year');
                  setSelectedYear(null);
                }}
                className="min-w-[44px] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                aria-label="戻る"
              >
                <HiChevronLeft className="h-5 w-5" />
              </IconButton>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                {selectedYear}年の月を選択
              </h3>
            </div>
          )}
          <IconButton
            onClick={onCancel}
            className="bg-gray-200 p-1.5 md:p-2.5 text-gray-700 hover:bg-gray-300 min-w-[44px]"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 md:h-7 md:w-7" />
          </IconButton>
        </div>

        {/* コンテンツ */}
        <Calendar
          viewMode={viewMode}
          selectedDate={selectedDate}
          today={today}
          todayDate={todayDate}
          currentYear={currentYear}
          currentMonth={currentMonth}
          maxSelectableDate={maxSelectableDate}
          calendarDays={calendarDays}
          yearList={yearList}
          selectedYear={selectedYear}
          monthNames={monthNames}
          weekdays={weekdays}
          isWeekend={isWeekend}
          onDateClick={(dateString) => handleDateClick(dateString, onSelect)}
          onYearSelect={handleYearSelect}
          onMonthSelect={handleMonthSelect}
        />
      </div>
    </div>
  );
}

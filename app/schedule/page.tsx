'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { useScheduleDateNavigation } from '@/hooks/useScheduleDateNavigation';
import { useScheduleOCR } from '@/hooks/useScheduleOCR';
import { TodaySchedule } from '@/components/TodaySchedule';
import { RoastSchedulerTab } from '@/components/RoastSchedulerTab';
import { Loading } from '@/components/Loading';
import { HiArrowLeft, HiCalendar, HiClock, HiChevronLeft, HiChevronRight, HiCamera } from 'react-icons/hi';
import { DatePickerModal } from '@/components/DatePickerModal';
import { ScheduleOCRModal } from '@/components/ScheduleOCRModal';
import LoginPage from '@/app/login/page';
import { Button } from '@/components/ui';

type TabType = 'today' | 'roast';

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isOCROpen, setIsOCROpen] = useState(false);

  const {
    selectedDate,
    setSelectedDate,
    currentTime,
    isToday,
    isMaxDate,
    isWeekend,
    getTodayString,
    formatDateString,
    formatTime,
    moveToPreviousDay,
    moveToNextDay,
  } = useScheduleDateNavigation();

  const { handleOCRSuccess } = useScheduleOCR({ data, selectedDate, updateData });

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (isLoading) {
    return <Loading message="データを読み込み中..." />;
  }

  return (
    <div className="h-screen md:h-[100dvh] lg:h-screen pt-2 pb-4 px-4 sm:py-4 sm:px-4 lg:py-6 lg:px-6 flex flex-col overflow-hidden" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="w-full flex-1 flex flex-col min-h-0 lg:max-w-7xl lg:mx-auto">
        {/* ヘッダー */}
        <header className="mb-4 flex-shrink-0 flex items-center">
          <div className="flex-1 flex justify-start items-center">
            <Link
              href="/"
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
            </Link>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {/* スマホレイアウト：1つのカード */}
            <div className="sm:hidden w-full max-w-xs">
              <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-xl px-3 py-2.5">
                {/* 日付ナビゲーション */}
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={moveToPreviousDay}
                    className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                    aria-label="前日"
                  >
                    <HiChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsDatePickerOpen(true)}
                    className="flex items-center cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1 transition-colors flex-1 justify-center"
                    aria-label="日付を選択"
                  >
                    <span className="text-base text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                      {formatDateString(selectedDate)}
                    </span>
                  </button>
                  <button
                    onClick={moveToNextDay}
                    disabled={isMaxDate}
                    className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                      isMaxDate
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    aria-label="翌日"
                  >
                    <HiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* タブレット・デスクトップレイアウト：横並び */}
            <div className="hidden sm:flex flex-row items-center gap-3 md:gap-4 px-5 py-2 md:px-6 md:py-2.5 bg-white border-2 border-gray-300 rounded-2xl shadow-xl">
              {/* 日付ナビゲーション */}
              <div className="flex items-center gap-2 md:gap-2.5">
                <button
                  onClick={moveToPreviousDay}
                  className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                  aria-label="前日"
                >
                  <HiChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex items-center gap-2 md:gap-2.5 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1.5 transition-colors"
                  aria-label="日付を選択"
                >
                  <HiCalendar className="h-5 w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                    {formatDateString(selectedDate)}
                  </span>
                </button>
                <button
                  onClick={moveToNextDay}
                  disabled={isMaxDate}
                  className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-md transition-colors ${
                    isMaxDate
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="翌日"
                >
                  <HiChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
              {/* 区切り線 */}
              <div className="flex-shrink-0 h-7 md:h-8 flex items-center">
                <div className="w-px h-full bg-gray-200"></div>
              </div>
              {/* 時刻 */}
              <div className="flex items-center gap-2 md:gap-2.5">
                <HiClock className="h-5 w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0" />
                <span className="text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsOCROpen(true)}
                className="shadow-md"
                title="画像から読み取り"
                aria-label="画像から読み取り"
              >
                <HiCamera className="h-5 w-5 flex-shrink-0 mr-2" />
                <span className="font-medium">AIで読み取る</span>
              </Button>
            </div>
          </div>
        </header>

        {/* タブナビゲーション（スマホ版：画面下部に固定） */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 px-4 pb-4">
          <nav className="flex gap-1.5 sm:gap-2 bg-white border-2 border-gray-300 rounded-t-xl shadow-lg p-1.5 sm:p-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded transition-colors text-xs sm:text-sm min-h-[44px] ${
                activeTab === 'today'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              本日のスケジュール
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOCROpen(true)}
              className="!px-3 !py-2 sm:!px-4 sm:!py-2.5 shadow-md"
              title="画像から読み取り"
              aria-label="画像から読み取り"
            >
              <HiCamera className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <button
              onClick={() => setActiveTab('roast')}
              className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded transition-colors text-xs sm:text-sm min-h-[44px] ${
                activeTab === 'roast'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ローストスケジュール
            </button>
          </nav>
        </div>

        {/* コンテンツ */}
        <main className="flex-1 flex flex-col min-h-0 pb-20 lg:pb-0">
          {/* モバイル版：タブ切替 */}
          <div className="block lg:hidden flex-1 flex flex-col min-h-0">
            {activeTab === 'today' && (
              <div className="flex-1 flex flex-col min-h-0">
                <TodaySchedule key={selectedDate} data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} />
              </div>
            )}
            {activeTab === 'roast' && (
              <div className="flex-1 flex flex-col min-h-0">
                <RoastSchedulerTab data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} />
              </div>
            )}
          </div>

          {/* デスクトップ版：横並び */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:flex-1 lg:min-h-0">
            <div className="flex flex-col min-h-0">
              <TodaySchedule key={selectedDate} data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} />
            </div>
            <div className="flex flex-col min-h-0">
              <RoastSchedulerTab data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} />
            </div>
          </div>
        </main>
      </div>

      {/* カレンダーピッカーモーダル */}
      {isDatePickerOpen && (
        <DatePickerModal
          selectedDate={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setIsDatePickerOpen(false);
          }}
          onCancel={() => setIsDatePickerOpen(false)}
          isWeekend={isWeekend}
          getTodayString={getTodayString}
        />
      )}

      {/* OCRモーダル */}
      {isOCROpen && (
        <ScheduleOCRModal
          selectedDate={selectedDate}
          onSuccess={(mode, timeLabels, roastSchedules) => {
            handleOCRSuccess(mode, timeLabels, roastSchedules);
            setIsOCROpen(false);
          }}
          onCancel={() => setIsOCROpen(false)}
        />
      )}

    </div>
  );
}


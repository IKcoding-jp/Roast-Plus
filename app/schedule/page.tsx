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
import { Button, IconButton } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';

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
  const { isChristmasMode } = useChristmasMode();

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
    <div className="h-screen md:h-[100dvh] lg:h-screen pt-2 pb-4 px-4 sm:py-4 sm:px-4 lg:py-6 lg:px-6 flex flex-col overflow-hidden" style={{ backgroundColor: isChristmasMode ? '#051a0e' : '#F7F7F5' }}>
      <div className="w-full flex-1 flex flex-col min-h-0 lg:max-w-7xl lg:mx-auto">
        {/* ヘッダー */}
        <header className="mb-4 flex-shrink-0 flex items-center">
          <div className="flex-1 flex justify-start items-center">
            <Link
              href="/"
              className={`px-3 py-2 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] ${
                isChristmasMode
                  ? 'text-[#f8f1e7]/70 hover:text-[#f8f1e7] hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
            </Link>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {/* スマホレイアウト：1つのカード */}
            <div className="sm:hidden w-full max-w-xs">
              <div className={`rounded-2xl shadow-xl px-3 py-2.5 ${
                isChristmasMode
                  ? 'bg-[#0a2f1a] border-2 border-[#d4af37]/30'
                  : 'bg-white border-2 border-gray-300'
              }`}>
                {/* 日付ナビゲーション */}
                <div className="flex items-center justify-center gap-1.5">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={moveToPreviousDay}
                    aria-label="前日"
                    isChristmasMode={isChristmasMode}
                  >
                    <HiChevronLeft className="h-5 w-5" />
                  </IconButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDatePickerOpen(true)}
                    aria-label="日付を選択"
                    isChristmasMode={isChristmasMode}
                    className="flex-1 justify-center"
                  >
                    <span className={`text-base font-semibold font-sans whitespace-nowrap leading-tight ${
                      isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'
                    }`}>
                      {formatDateString(selectedDate)}
                    </span>
                  </Button>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={moveToNextDay}
                    disabled={isMaxDate}
                    aria-label="翌日"
                    isChristmasMode={isChristmasMode}
                  >
                    <HiChevronRight className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>
            </div>
            {/* タブレット・デスクトップレイアウト：横並び */}
            <div className={`hidden sm:flex flex-row items-center gap-3 md:gap-4 px-5 py-2 md:px-6 md:py-2.5 rounded-2xl shadow-xl ${
              isChristmasMode
                ? 'bg-[#0a2f1a] border-2 border-[#d4af37]/30'
                : 'bg-white border-2 border-gray-300'
            }`}>
              {/* 日付ナビゲーション */}
              <div className="flex items-center gap-2 md:gap-2.5">
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={moveToPreviousDay}
                  aria-label="前日"
                  isChristmasMode={isChristmasMode}
                >
                  <HiChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </IconButton>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setIsDatePickerOpen(true)}
                  aria-label="日付を選択"
                  isChristmasMode={isChristmasMode}
                  className="gap-2 md:gap-2.5"
                >
                  <HiCalendar className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${
                    isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'
                  }`} />
                  <span className={`text-base md:text-lg font-semibold font-sans whitespace-nowrap leading-tight ${
                    isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'
                  }`}>
                    {formatDateString(selectedDate)}
                  </span>
                </Button>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={moveToNextDay}
                  disabled={isMaxDate}
                  aria-label="翌日"
                  isChristmasMode={isChristmasMode}
                >
                  <HiChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </IconButton>
              </div>
              {/* 区切り線 */}
              <div className="flex-shrink-0 h-7 md:h-8 flex items-center">
                <div className={`w-px h-full ${isChristmasMode ? 'bg-[#d4af37]/30' : 'bg-gray-200'}`}></div>
              </div>
              {/* 時刻 */}
              <div className="flex items-center gap-2 md:gap-2.5">
                <HiClock className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${
                  isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'
                }`} />
                <span className={`text-base md:text-lg font-semibold font-sans whitespace-nowrap leading-tight ${
                  isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'
                }`}>
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
                isChristmasMode={isChristmasMode}
              >
                <HiCamera className="h-5 w-5 flex-shrink-0 mr-2" />
                <span className="font-medium">AIで読み取る</span>
              </Button>
            </div>
          </div>
        </header>

        {/* タブナビゲーション（スマホ版：画面下部に固定） */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 px-4 pb-4">
          <nav className={`flex gap-1.5 sm:gap-2 rounded-t-xl shadow-lg p-1.5 sm:p-2 ${
            isChristmasMode
              ? 'bg-[#0a2f1a] border-2 border-[#d4af37]/30'
              : 'bg-white border-2 border-gray-300'
          }`}>
            <Button
              variant={activeTab === 'today' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('today')}
              isChristmasMode={isChristmasMode}
              className="flex-1 text-xs sm:text-sm"
            >
              本日のスケジュール
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOCROpen(true)}
              className="!px-3 !py-2 sm:!px-4 sm:!py-2.5 shadow-md"
              title="画像から読み取り"
              aria-label="画像から読み取り"
              isChristmasMode={isChristmasMode}
            >
              <HiCamera className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              variant={activeTab === 'roast' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('roast')}
              isChristmasMode={isChristmasMode}
              className="flex-1 text-xs sm:text-sm"
            >
              ローストスケジュール
            </Button>
          </nav>
        </div>

        {/* コンテンツ */}
        <main className="flex-1 flex flex-col min-h-0 pb-20 lg:pb-0">
          {/* モバイル版：タブ切替 */}
          <div className="block lg:hidden flex-1 flex flex-col min-h-0">
            {activeTab === 'today' && (
              <div className="flex-1 flex flex-col min-h-0">
                <TodaySchedule key={selectedDate} data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} isChristmasMode={isChristmasMode} />
              </div>
            )}
            {activeTab === 'roast' && (
              <div className="flex-1 flex flex-col min-h-0">
                <RoastSchedulerTab data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} isChristmasMode={isChristmasMode} />
              </div>
            )}
          </div>

          {/* デスクトップ版：横並び */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:flex-1 lg:min-h-0">
            <div className="flex flex-col min-h-0">
              <TodaySchedule key={selectedDate} data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} isChristmasMode={isChristmasMode} />
            </div>
            <div className="flex flex-col min-h-0">
              <RoastSchedulerTab data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday} isChristmasMode={isChristmasMode} />
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


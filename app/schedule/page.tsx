'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { useScheduleDateNavigation } from '@/hooks/useScheduleDateNavigation';
import { useScheduleOCR } from '@/hooks/useScheduleOCR';
import { TodaySchedule } from '@/components/TodaySchedule';
import { RoastSchedulerTab } from '@/components/RoastSchedulerTab';
import { Loading } from '@/components/Loading';
import { HiCalendar, HiClock, HiChevronLeft, HiChevronRight, HiCamera } from 'react-icons/hi';
import { DatePickerModal } from '@/components/DatePickerModal';
import { ScheduleOCRModal } from '@/components/ScheduleOCRModal';
import LoginPage from '@/app/login/page';
import { Button, IconButton, FloatingNav, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

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
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} defaultValue="today" className="h-screen md:h-[100dvh] lg:h-screen pt-14 sm:pt-3 pb-4 px-4 sm:px-4 lg:px-6 flex flex-col overflow-hidden bg-page">
      <FloatingNav backHref="/" />
      {/* モバイル版：日付ナビ（戻るボタンの右〜画面右端で中央配置） */}
      <div className="sm:hidden fixed top-3 left-14 right-3 z-50 flex">
        <div className="w-full flex items-center justify-between rounded-2xl px-3 py-2 bg-surface/80 backdrop-blur-sm border border-edge shadow-md">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={moveToPreviousDay}
            aria-label="前日"
            className="active:scale-90 transition-transform !min-h-0 !p-1"
          >
            <HiChevronLeft className="h-5 w-5" />
          </IconButton>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDatePickerOpen(true)}
            aria-label="日付を選択"
            className="!min-h-0 !px-1 !py-1"
          >
            <span className={`text-base font-bold tracking-tight font-sans whitespace-nowrap leading-tight ${isToday ? 'text-spot' : 'text-ink'}`}>
              {formatDateString(selectedDate)}
            </span>
          </Button>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={moveToNextDay}
            disabled={isMaxDate}
            aria-label="翌日"
            className="active:scale-90 transition-transform !min-h-0 !p-1"
          >
            <HiChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
      <div className="w-full flex-1 flex flex-col min-h-0 lg:max-w-7xl lg:mx-auto">
        {/* 日付ナビゲーション */}
        <div className="mb-2 flex-shrink-0 flex justify-center">
          {/* スマホレイアウト：FloatingNav右に統合済み */}
          {/* タブレット・デスクトップレイアウト：横並び */}
          <div className="hidden sm:flex flex-row items-center gap-3 md:gap-4 px-5 py-2 md:px-6 md:py-2.5 rounded-2xl shadow-lg bg-surface border border-edge">
            <div className="flex items-center gap-2 md:gap-2.5">
              <IconButton
                variant="ghost"
                size="md"
                onClick={moveToPreviousDay}
                aria-label="前日"
                className="active:scale-90 transition-transform"
              >
                <HiChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </IconButton>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsDatePickerOpen(true)}
                aria-label="日付を選択"
                className="gap-2 md:gap-2.5"
              >
                <HiCalendar className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-spot" />
                <span className={`text-base md:text-lg font-bold tracking-tight font-sans whitespace-nowrap leading-tight ${isToday ? 'text-spot' : 'text-ink'}`}>
                  {formatDateString(selectedDate)}
                </span>
              </Button>
              <IconButton
                variant="ghost"
                size="md"
                onClick={moveToNextDay}
                disabled={isMaxDate}
                aria-label="翌日"
                className="active:scale-90 transition-transform"
              >
                <HiChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </IconButton>
            </div>
            <div className="flex-shrink-0 h-7 md:h-8 flex items-center">
              <div className="w-px h-full bg-edge"></div>
            </div>
            <div className="flex items-center gap-2 md:gap-2.5">
              <HiClock className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-spot" />
              <span className="text-base md:text-lg font-bold tracking-tight font-sans whitespace-nowrap leading-tight text-ink">
                {formatTime(currentTime)}
              </span>
            </div>
            <div className="flex-shrink-0 h-7 md:h-8 flex items-center">
              <div className="w-px h-full bg-edge"></div>
            </div>
            <IconButton
              variant="ghost"
              size="md"
              onClick={() => setIsOCROpen(true)}
              aria-label="画像から読み取り"
            >
              <HiCamera className="h-5 w-5 md:h-6 md:w-6" />
            </IconButton>
          </div>
        </div>

        {/* タブナビゲーション（スマホ版：画面下部に固定） */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 px-4 pb-4">
          <div className="flex items-end gap-3 justify-center">
            <TabsList className="flex-1 !rounded-2xl shadow-xl !p-1 sm:!p-1.5 !bg-surface border border-edge">
              <TabsTrigger value="today" className="py-3.5 sm:py-4 text-xs sm:text-sm font-semibold !rounded-xl aria-selected:!bg-spot aria-selected:!text-on-spot aria-selected:!shadow-md">
                本日のスケジュール
              </TabsTrigger>
              {/* 中央OCRボタン */}
              <IconButton
                variant="primary"
                size="md"
                onClick={() => setIsOCROpen(true)}
                className="relative z-20 -my-3 mx-1 flex-shrink-0 !w-12 !h-12 !rounded-full shadow-lg !bg-spot !text-on-spot active:scale-95 transition-transform ring-4 ring-surface"
                aria-label="画像から読み取り"
              >
                <HiCamera className="h-5 w-5" />
              </IconButton>
              <TabsTrigger value="roast" className="py-3.5 sm:py-4 text-xs sm:text-sm font-semibold !rounded-xl aria-selected:!bg-spot aria-selected:!text-on-spot aria-selected:!shadow-md">
                ローストスケジュール
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* コンテンツ */}
        <main className="flex-1 flex flex-col min-h-0 pb-20 lg:pb-0">
          {/* モバイル版：タブ切替 */}
          <div className="block lg:hidden flex-1 flex flex-col min-h-0">
            <TabsContent value="today" className="flex-1 flex flex-col min-h-0">
              <TodaySchedule key={selectedDate} data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday}  />
            </TabsContent>
            <TabsContent value="roast" className="flex-1 flex flex-col min-h-0">
              <RoastSchedulerTab data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday}  />
            </TabsContent>
          </div>

          {/* デスクトップ版：横並び */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:flex-1 lg:min-h-0">
            <div className="flex flex-col min-h-0">
              <TodaySchedule key={selectedDate} data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday}  />
            </div>
            <div className="flex flex-col min-h-0">
              <RoastSchedulerTab data={data} onUpdate={updateData} selectedDate={selectedDate} isToday={isToday}  />
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

    </Tabs>
  );
}


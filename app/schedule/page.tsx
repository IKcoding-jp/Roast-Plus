'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TodaySchedule } from '@/components/TodaySchedule';
import { RoastSchedulerTab } from '@/components/RoastSchedulerTab';
import { Loading } from '@/components/Loading';
import { HiHome, HiCalendar, HiClock, HiChevronLeft, HiChevronRight, HiCamera } from 'react-icons/hi';
import { DatePickerModal } from '@/components/DatePickerModal';
import { ScheduleOCRCapture } from '@/components/ScheduleOCRCapture';
import LoginPage from '@/app/login/page';
import type { TimeLabel } from '@/types';

type TabType = 'today' | 'roast';

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showOCRCapture, setShowOCRCapture] = useState(false);
  
  // 選択中の日付を管理（YYYY-MM-DD形式）
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 土日判定関数（0=日曜、6=土曜）
  const isWeekend = useCallback((dateString: string): boolean => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0=日曜、6=土曜
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
  const getInitialDate = (): string => {
    const today = getTodayString();
    if (isWeekend(today)) {
      return getPreviousWeekday(today);
    }
    return today;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());

  // 時刻・日付・曜日を1秒ごとに更新
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

  // モバイル用の短縮日付フォーマット関数
  const formatDateShort = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    return `${month}/${day}（${weekday}）`;
  };

  const formatDateString = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return formatDate(date);
  };

  const formatDateStringShort = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return formatDateShort(date);
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
    const nextWeekday = getNextWeekday(selectedDate);
    
    // 今日を超えないようにする（今日まで移動可能）
    // 今日が土日の場合は、前の平日まで移動可能
    const maxDate = isWeekend(today) ? getPreviousWeekday(today) : today;
    if (nextWeekday <= maxDate) {
      setSelectedDate(nextWeekday);
    }
  }, [selectedDate, getNextWeekday, getPreviousWeekday, isWeekend]);

  // 選択日が今日かどうか（実際の今日の日付と比較）
  const today = getTodayString();
  const effectiveToday = isWeekend(today) ? getPreviousWeekday(today) : today;
  const isToday = selectedDate === today; // 実際の今日の日付と比較

  // OCR結果をTimeLabelとして追加
  const handleOCRComplete = (timeLabels: TimeLabel[]) => {
    if (!data) return;
    
    const todaySchedule = data.todaySchedules?.find(s => s.date === selectedDate);
    const existingLabels = todaySchedule?.timeLabels || [];
    
    // 既存のTimeLabelとマージ（重複を避けるため、時間でチェック）
    const existingTimes = new Set(existingLabels.map((label) => label.time));
    const newLabels = timeLabels.filter((label) => !existingTimes.has(label.time));
    
    // orderを再設定
    const maxOrder = existingLabels.length > 0 
      ? Math.max(...existingLabels.map((label) => label.order || 0))
      : -1;
    
    const labelsWithOrder = newLabels.map((label, index) => ({
      ...label,
      order: maxOrder + 1 + index,
    }));

    const updatedLabels = [...existingLabels, ...labelsWithOrder];
    
    // todaySchedulesを更新
    const existingScheduleIndex = data.todaySchedules?.findIndex(s => s.date === selectedDate) ?? -1;
    let updatedTodaySchedules: typeof data.todaySchedules;
    
    if (existingScheduleIndex >= 0 && data.todaySchedules) {
      // 既存の日付を更新
      updatedTodaySchedules = data.todaySchedules.map((s, index) =>
        index === existingScheduleIndex
          ? { ...s, timeLabels: updatedLabels }
          : s
      );
    } else {
      // 新しい日付を追加
      updatedTodaySchedules = [
        ...(data.todaySchedules || []),
        { date: selectedDate, timeLabels: updatedLabels }
      ];
    }
    
    updateData({
      ...data,
      todaySchedules: updatedTodaySchedules,
    });
    
    setShowOCRCapture(false);
  };

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
        <header className="mb-4 flex-shrink-0 flex items-center justify-between">
          <Link
            href="/"
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="ホームに戻る"
            aria-label="ホームに戻る"
          >
            <HiHome className="h-6 w-6 flex-shrink-0" />
          </Link>
          <div className="flex-1 flex justify-end sm:justify-center lg:justify-end items-center">
            <div className="flex flex-row items-center gap-2.5 sm:gap-3 md:gap-4 px-3 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 bg-white border border-gray-200 rounded-md sm:rounded-xl shadow-md">
              {/* 日付ナビゲーション */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5">
                <button
                  onClick={moveToPreviousDay}
                  className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                  aria-label="前日"
                >
                  <HiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 cursor-pointer hover:bg-gray-50 rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 transition-colors"
                  aria-label="日付を選択"
                >
                  <HiCalendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                    <span className="sm:hidden">{formatDateStringShort(selectedDate)}</span>
                    <span className="hidden sm:inline">{formatDateString(selectedDate)}</span>
                  </span>
                </button>
                <button
                  onClick={moveToNextDay}
                  disabled={isToday}
                  className={`flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md transition-colors ${
                    isToday
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="翌日"
                >
                  <HiChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
              </div>
              {/* 区切り線 */}
              <div className="flex-shrink-0 h-6 sm:h-7 md:h-8 flex items-center">
                <div className="w-px h-full bg-gray-200"></div>
              </div>
              {/* 時刻 */}
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <HiClock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0" />
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                  {formatTime(currentTime)}
                </span>
              </div>
              {/* 区切り線（デスクトップ版のみ） */}
              <div className="hidden sm:flex flex-shrink-0 h-6 sm:h-7 md:h-8 items-center">
                <div className="w-px h-full bg-gray-200"></div>
              </div>
              {/* OCRボタン（デスクトップ版のみ） */}
              <button
                onClick={() => setShowOCRCapture(true)}
                className="hidden sm:flex items-center gap-1.5 sm:gap-2 rounded-md bg-primary px-3 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2 text-xs sm:text-sm md:text-base font-medium text-white transition-colors hover:bg-primary-dark flex-shrink-0"
                aria-label="OCRでスケジュールを読み取る"
                title="ホワイトボードのスケジュールを撮影して読み取る"
              >
                <HiCamera className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5" />
                <span>OCR</span>
              </button>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0 w-[140px]"></div>
        </header>

        {/* タブナビゲーション（モバイル版：画面下部に固定） */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 px-4 pb-4">
          <nav className="flex gap-1.5 sm:gap-2 bg-white border-t border-gray-200 shadow-lg p-1.5 sm:p-2">
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
            {/* OCRボタン（モバイル版：タブナビゲーション内） */}
            <button
              onClick={() => setShowOCRCapture(true)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-md bg-primary w-11 h-11 sm:w-12 sm:h-12 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-primary-dark flex-shrink-0"
              aria-label="OCRでスケジュールを読み取る"
              title="ホワイトボードのスケジュールを撮影して読み取る"
            >
              <HiCamera className="h-5 w-5 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">OCR</span>
            </button>
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

      {/* OCRキャプチャコンポーネント */}
      {showOCRCapture && (
        <ScheduleOCRCapture
          onComplete={handleOCRComplete}
          onCancel={() => setShowOCRCapture(false)}
        />
      )}
    </div>
  );
}


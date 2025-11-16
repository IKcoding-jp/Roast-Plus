'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TodaySchedule } from '@/components/TodaySchedule';
import { RoastSchedulerTab } from '@/components/RoastSchedulerTab';
import { HiArrowLeft, HiCalendar, HiClock, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { DatePickerModal } from '@/components/DatePickerModal';
import LoginPage from '@/app/login/page';

type TabType = 'today' | 'roast';

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen md:h-[100dvh] lg:h-screen pt-2 pb-4 px-4 sm:py-4 sm:px-4 lg:py-6 lg:px-6 flex flex-col overflow-hidden" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="w-full flex-1 flex flex-col min-h-0 lg:max-w-7xl lg:mx-auto">
        {/* ヘッダー */}
        <header className="mb-4 flex-shrink-0 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors min-w-[44px] min-h-[44px] flex-shrink-0"
          >
            <HiArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            <span className="text-sm sm:text-base md:text-lg">ホームに戻る</span>
          </Link>
          <div className="flex-1 flex justify-end sm:justify-center items-center">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 md:gap-4 px-2 py-0.5 sm:px-5 sm:py-1 md:px-6 md:py-1.5 bg-white border border-gray-200 rounded-md sm:rounded-xl shadow-md">
              {/* 日付ナビゲーション */}
              <div className="flex items-center gap-0.5 sm:gap-2.5 md:gap-3">
                <button
                  onClick={moveToPreviousDay}
                  className="flex items-center justify-center min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                  aria-label="前日"
                >
                  <HiChevronLeft className="h-3.5 w-3.5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </button>
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex items-center gap-0.5 sm:gap-2.5 md:gap-3 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-0.5 sm:px-2 sm:py-1 transition-colors"
                  aria-label="日付を選択"
                >
                  <HiCalendar className="h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0 self-center" />
                  <span className="text-xs sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                    {formatDateString(selectedDate)}
                  </span>
                </button>
                <button
                  onClick={moveToNextDay}
                  disabled={isToday}
                  className={`flex items-center justify-center min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] rounded-md transition-colors ${
                    isToday
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="翌日"
                >
                  <HiChevronRight className="h-3.5 w-3.5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </button>
              </div>
              {/* 区切り線（デスクトップのみ） */}
              <div className="hidden sm:block w-px h-6 md:h-7 bg-gray-200 mx-1"></div>
              {/* 時刻 */}
              <div className="flex items-center gap-0.5 sm:gap-2.5 md:gap-3">
                <HiClock className="h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0 self-center" />
                <span className="text-xs sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0 w-[140px]"></div>
        </header>

        {/* タブナビゲーション（モバイル版） */}
        <div className="mb-4 block lg:hidden flex-shrink-0">
          <nav className="flex gap-2 bg-white rounded-lg shadow p-1 sm:p-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded transition-colors text-sm sm:text-base md:text-lg min-h-[44px] ${
                activeTab === 'today'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              本日のスケジュール
            </button>
            <button
              onClick={() => setActiveTab('roast')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded transition-colors text-sm sm:text-base md:text-lg min-h-[44px] ${
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
        <main className="flex-1 flex flex-col min-h-0">
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
    </div>
  );
}


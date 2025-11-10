'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TodaySchedule } from '@/components/TodaySchedule';
import { RoastSchedulerTab } from '@/components/RoastSchedulerTab';
import { HiArrowLeft, HiCalendar, HiClock } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

type TabType = 'today' | 'roast';

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
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
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen md:h-[100dvh] lg:h-screen bg-amber-50 pt-2 pb-4 px-4 sm:py-4 sm:px-4 lg:py-6 lg:px-6 flex flex-col overflow-hidden">
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
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-white border border-gray-200 rounded-xl shadow-md">
              {/* 日付 */}
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <HiCalendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0 self-center" />
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
                  {formatDate(currentTime)}
                </span>
              </div>
              {/* 区切り線（デスクトップのみ） */}
              <div className="hidden sm:block w-px h-6 md:h-7 bg-gray-200 mx-1"></div>
              {/* 時刻 */}
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <HiClock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0 self-center" />
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
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
                <TodaySchedule data={data} onUpdate={updateData} />
              </div>
            )}
            {activeTab === 'roast' && (
              <div className="flex-1 flex flex-col min-h-0">
                <RoastSchedulerTab data={data} onUpdate={updateData} />
              </div>
            )}
          </div>

          {/* デスクトップ版：横並び */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:flex-1 lg:min-h-0">
            <div className="flex flex-col min-h-0">
              <TodaySchedule data={data} onUpdate={updateData} />
            </div>
            <div className="flex flex-col min-h-0">
              <RoastSchedulerTab data={data} onUpdate={updateData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


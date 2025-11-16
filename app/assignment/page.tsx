'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { AssignmentTable } from '@/components/AssignmentTable';
import { MemberTeamManagement } from '@/components/MemberTeamManagement';
import { TaskLabelManagement } from '@/components/TaskLabelManagement';
import { HiHome, HiCalendar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { DatePickerModal } from '@/components/DatePickerModal';
import LoginPage from '@/app/login/page';

type TabType = 'assignment' | 'members' | 'labels';

export default function AssignmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('assignment');

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="ホームに戻る"
                aria-label="ホームに戻る"
              >
                <HiHome className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
            {/* 日付ナビゲーション（担当表タブの時のみ表示） */}
            {activeTab === 'assignment' && (
              <div className="flex justify-center w-full sm:flex-1">
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
                      <span className="text-base sm:text-base md:text-lg text-gray-900 font-semibold font-sans whitespace-nowrap leading-tight">
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
                </div>
              </div>
            )}
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>
        <div className="mb-6">
          <nav className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white rounded-lg shadow p-1 sm:p-2">
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base ${
                activeTab === 'assignment'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              担当表
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base ${
                activeTab === 'members'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              メンバー・班管理
            </button>
            <button
              onClick={() => setActiveTab('labels')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base ${
                activeTab === 'labels'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              作業ラベル管理
            </button>
          </nav>
        </div>
        <main>
          {activeTab === 'assignment' && (
            <AssignmentTable 
              data={data} 
              onUpdate={updateData} 
              selectedDate={selectedDate}
              isToday={isToday}
            />
          )}
          {activeTab === 'members' && (
            <MemberTeamManagement data={data} onUpdate={updateData} />
          )}
          {activeTab === 'labels' && (
            <TaskLabelManagement data={data} onUpdate={updateData} />
          )}
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

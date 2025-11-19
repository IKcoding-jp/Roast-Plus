'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { AssignmentTable } from '@/components/AssignmentTable';
import { MemberTeamManagement } from '@/components/MemberTeamManagement';
import { TaskLabelManagement } from '@/components/TaskLabelManagement';
import { Loading } from '@/components/Loading';
import { HiArrowLeft } from 'react-icons/hi';
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

  // 常に今日の日付を使用
  const today = getTodayString();
  const selectedDate = isWeekend(today) ? getPreviousWeekday(today) : today;
  const isToday = selectedDate === today;

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
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="戻る"
                aria-label="戻る"
              >
                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
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

    </div>
  );
}

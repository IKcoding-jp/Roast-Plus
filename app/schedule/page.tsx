'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TodaySchedule } from '@/components/TodaySchedule';
import { RoastSchedulerTab } from '@/components/RoastSchedulerTab';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

type TabType = 'today' | 'roast';

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('today');

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
    <div className="min-h-screen bg-amber-50 py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6 flex flex-col">
      <div className="w-full flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors min-w-[44px] min-h-[44px]"
          >
            <HiArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm sm:text-base">ホームに戻る</span>
          </Link>
        </header>

        {/* タブナビゲーション（モバイル版） */}
        <div className="mb-4 block lg:hidden">
          <nav className="flex gap-2 bg-white rounded-lg shadow p-1 sm:p-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base min-h-[44px] ${
                activeTab === 'today'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              本日のスケジュール
            </button>
            <button
              onClick={() => setActiveTab('roast')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base min-h-[44px] ${
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


'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiClock } from 'react-icons/hi';
import { RoastTimer } from '@/components/RoastTimer';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { requestNotificationPermission } from '@/lib/notifications';
import LoginPage from '@/app/login/page';
import { useEffect } from 'react';

export default function RoastTimerPage() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  // アプリ起動時に通知権限をリクエスト
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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

  return (
    <div className="h-screen bg-amber-50 flex flex-col overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0 px-4 sm:px-6 py-4 sm:py-6">
        <header className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0 min-h-[44px]"
            >
              <HiArrowLeft className="text-lg flex-shrink-0" />
              ホームに戻る
            </Link>
            <Link
              href="/roast-record"
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 hover:shadow-lg transition-all flex items-center gap-2 flex-shrink-0 min-h-[44px]"
              aria-label="ロースト履歴一覧"
            >
              <HiClock className="text-lg flex-shrink-0" />
              <span className="hidden sm:inline">ロースト履歴</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0">
          {/* タイマーコンポーネント */}
          <div className="flex-1 min-h-0">
            <RoastTimer />
          </div>
        </main>
      </div>
    </div>
  );
}


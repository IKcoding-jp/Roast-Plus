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

  return (
    <div className="h-screen overflow-hidden flex flex-col px-2 sm:px-4 py-2 sm:py-4" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="flex-1 min-h-0">
        <RoastTimer />
      </div>
    </div>
  );
}


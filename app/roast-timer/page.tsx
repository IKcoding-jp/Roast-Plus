'use client';

import { useAuth } from '@/lib/auth';
import { RoastTimer } from '@/components/RoastTimer';
import { Loading } from '@/components/Loading';
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
    return <Loading />;
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


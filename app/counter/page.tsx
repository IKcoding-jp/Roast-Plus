'use client';

import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import Link from 'next/link';

export default function CounterPage() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F5' }}>
      {/* ヘッダー */}
      <header className="flex items-center justify-between bg-dark px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-white hover:text-gray-200 hover:bg-dark-light rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="ホームに戻る"
          >
            <HiArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">カウンター</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 pt-6 pb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">このページは準備中です。</p>
        </div>
      </main>
    </div>
  );
}


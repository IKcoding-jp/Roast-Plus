'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();

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
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <HiArrowLeft className="text-lg flex-shrink-0" />
                ホームに戻る
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              作業進捗
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>
        <main>
          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <div className="text-center py-12 sm:py-16">
              <p className="text-lg sm:text-xl text-gray-600 mb-2">
                この機能は開発予定です
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                しばらくお待ちください
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


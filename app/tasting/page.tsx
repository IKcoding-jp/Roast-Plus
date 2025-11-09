'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionList } from '@/components/TastingSessionList';
import { HiArrowLeft } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi';

export default function TastingPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login?returnUrl=/tasting');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  // 未認証の場合はリダイレクト中なので何も表示しない
  if (!user) {
    return null;
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
            <h1 className="hidden sm:block w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              試飲感想記録
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <TastingSessionList data={data} onUpdate={updateData} />
        </main>

        {/* 新規セッション作成FAB */}
        <Link
          href="/tasting/sessions/new"
          className="fixed bottom-8 right-8 w-14 h-14 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-colors flex items-center justify-center z-10"
          aria-label="新規セッション作成"
        >
          <HiPlus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}


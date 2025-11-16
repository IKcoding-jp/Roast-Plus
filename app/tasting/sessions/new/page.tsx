'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionForm } from '@/components/TastingSessionForm';
import { Loading } from '@/components/Loading';
import type { TastingSession } from '@/types';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useToastContext } from '@/components/Toast';

export default function NewTastingSessionPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const { showToast } = useToastContext();
  const hasRedirected = useRef(false);

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login?returnUrl=/tasting/sessions/new');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loading />;
  }

  // 未認証の場合はリダイレクト中なので何も表示しない
  if (!user) {
    return null;
  }

  if (isLoading) {
    return <Loading message="データを読み込み中..." />;
  }

  const tastingSessions = Array.isArray(data.tastingSessions) ? data.tastingSessions : [];

  const handleSave = async (session: TastingSession) => {
    try {
      const newSession: TastingSession = {
        ...session,
        userId: user.uid,
      };

      const updatedSessions = [...tastingSessions, newSession];
      await updateData({
        ...data,
        tastingSessions: updatedSessions,
      });

      // 保存が完了してから試飲記録一覧ページに遷移
      // 静的エクスポート時には動的ルートが存在しないため、一覧ページに遷移する
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to save tasting session:', error);
      showToast('セッションの保存に失敗しました。もう一度お試しください。', 'error');
    }
  };

  const handleCancel = () => {
    router.push('/tasting');
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/tasting"
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <HiArrowLeft className="text-lg flex-shrink-0" />
                一覧に戻る
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              新規セッション作成
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <div className="bg-white rounded-lg shadow-md p-6">
            <TastingSessionForm
              session={null}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </main>
      </div>
    </div>
  );
}


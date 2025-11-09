'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionDetail } from '@/components/TastingSessionDetail';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';
import { useEffect, useState } from 'react';

export default function TastingSessionDetailPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const params = useParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 静的エクスポート時のフォールバック: useParams()が動作しない場合、window.location.pathnameから取得
  // クライアント側で確実にIDを取得するため、複数の方法を試す
  useEffect(() => {
    let id: string | null = null;

    // 方法1: useParams()から取得
    if (params?.id) {
      id = params.id as string;
    }

    // 方法2: window.location.pathnameから取得（静的エクスポート時のフォールバック）
    if (!id && typeof window !== 'undefined') {
      const pathMatch = window.location.pathname.match(/\/tasting\/sessions\/([^\/]+)/);
      if (pathMatch && pathMatch[1]) {
        id = pathMatch[1];
      }
    }

    // 方法3: window.location.hashから取得（フォールバック）
    if (!id && typeof window !== 'undefined' && window.location.hash) {
      const hashMatch = window.location.hash.match(/\/tasting\/sessions\/([^\/]+)/);
      if (hashMatch && hashMatch[1]) {
        id = hashMatch[1];
      }
    }

    if (id) {
      setSessionId(id);
    }
  }, [params]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EB]">
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
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EB]">
        <div className="text-center">
          <div className="text-lg text-gray-600">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  // セッションIDが取得できない場合
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">セッションIDが取得できません</p>
            <Link
              href="/tasting"
              className="text-[#8B4513] hover:underline"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tastingSessions = Array.isArray(data.tastingSessions)
    ? data.tastingSessions
    : [];
  const session = tastingSessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">セッションが見つかりません</p>
            <Link
              href="/tasting"
              className="text-[#8B4513] hover:underline"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              記録の追加・編集
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <TastingSessionDetail
            session={session}
            data={data}
            onUpdate={updateData}
          />
        </main>
      </div>
    </div>
  );
}


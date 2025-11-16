'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionList } from '@/components/TastingSessionList';
import { TastingSessionDetail } from '@/components/TastingSessionDetail';
import { TastingRecordForm } from '@/components/TastingRecordForm';
import { TastingSessionForm } from '@/components/TastingSessionForm';
import type { TastingSession, TastingRecord } from '@/types';
import { HiArrowLeft } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi';
import { useToastContext } from '@/components/Toast';

function TastingPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);
  const { showToast } = useToastContext();

  // クエリパラメータからIDを取得
  const sessionId = searchParams?.get('sessionId');
  const recordId = searchParams?.get('recordId');
  const isEditSession = searchParams?.get('edit') === 'true';
  const isNewRecord = searchParams?.get('newRecord') === 'true';

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login?returnUrl=/tasting');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  const tastingSessions = Array.isArray(data.tastingSessions) ? data.tastingSessions : [];
  const tastingRecords = Array.isArray(data.tastingRecords) ? data.tastingRecords : [];

  // セッション編集モード
  if (sessionId && isEditSession) {
    const session = tastingSessions.find((s) => s.id === sessionId);
    if (!session) {
      return (
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">セッションが見つかりません</p>
              <Link href="/tasting" className="text-[#8B4513] hover:underline">
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const handleSave = async (updatedSession: TastingSession) => {
      try {
        const updatedSessions = tastingSessions.map((s) =>
          s.id === sessionId ? { ...updatedSession, userId: user.uid } : s
        );
        await updateData({
          ...data,
          tastingSessions: updatedSessions,
        });
        showToast('セッションを更新しました', 'success');
        router.push('/tasting');
      } catch (error) {
        console.error('Failed to update session:', error);
        showToast('セッションの更新に失敗しました', 'error');
      }
    };

    const handleDelete = async (id: string) => {
      const confirmDelete = window.confirm('このセッションを削除しますか？この操作は取り消せません。');
      if (!confirmDelete) return;

      try {
        // セッションに関連する記録も削除
        const updatedRecords = tastingRecords.filter((r) => r.sessionId !== id);
        const updatedSessions = tastingSessions.filter((s) => s.id !== id);
        await updateData({
          ...data,
          tastingSessions: updatedSessions,
          tastingRecords: updatedRecords,
        });
        router.push('/tasting');
      } catch (error) {
        console.error('Failed to delete session:', error);
        showToast('セッションの削除に失敗しました', 'error');
      }
    };

    const handleCancel = () => {
      router.push('/tasting');
    };

    return (
      <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
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
              <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 whitespace-nowrap">
                セッションを編集
              </h1>
              <div className="hidden sm:block flex-1 flex-shrink-0"></div>
            </div>
          </header>
          <main>
            <div className="bg-white rounded-lg shadow-md p-6">
              <TastingSessionForm
                session={session}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 記録詳細/編集モード
  if (recordId) {
    const record = tastingRecords.find((r) => r.id === recordId);
    if (!record) {
      return (
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">記録が見つかりません</p>
              <Link href="/tasting" className="text-[#8B4513] hover:underline">
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const handleSave = async (updatedRecord: TastingRecord) => {
      try {
        const updatedRecords = tastingRecords.map((r) =>
          r.id === recordId ? { ...updatedRecord, userId: user.uid } : r
        );
        await updateData({
          ...data,
          tastingRecords: updatedRecords,
        });
        showToast('記録を保存しました', 'success');
        router.push('/tasting');
      } catch (error) {
        console.error('Failed to save record:', error);
        showToast('記録の保存に失敗しました', 'error');
      }
    };

    const handleDelete = async (id: string) => {
      const confirmDelete = window.confirm('この記録を削除しますか？');
      if (!confirmDelete) return;

      try {
        const updatedRecords = tastingRecords.filter((r) => r.id !== id);
        await updateData({
          ...data,
          tastingRecords: updatedRecords,
        });
        showToast('記録を削除しました', 'success');
        router.push('/tasting');
      } catch (error) {
        console.error('Failed to delete record:', error);
        showToast('記録の削除に失敗しました', 'error');
      }
    };

    const handleCancel = () => {
      router.push('/tasting');
    };

    return (
      <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
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
                記録を編集
              </h1>
              <div className="hidden sm:block flex-1 flex-shrink-0"></div>
            </div>
          </header>
          <main>
            <div className="bg-white rounded-lg shadow-md p-6">
              <TastingRecordForm
                record={record}
                data={data}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={handleCancel}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // セッション詳細モード（新規記録作成含む）
  if (sessionId) {
    const session = tastingSessions.find((s) => s.id === sessionId);
    if (!session) {
      return (
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">セッションが見つかりません</p>
              <Link href="/tasting" className="text-[#8B4513] hover:underline">
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
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
            <TastingSessionDetail session={session} data={data} onUpdate={updateData} />
          </main>
        </div>
      </div>
    );
  }

  // 一覧表示（デフォルト）
  const isEmpty = tastingSessions.length === 0;
  
  return (
    <div className="h-screen overflow-y-hidden flex flex-col px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <header className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <HiArrowLeft className="text-lg flex-shrink-0" />
                ホームに戻る
              </Link>
            </div>
            <h1 className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl font-bold text-gray-800">
              試飲感想記録
            </h1>
            <div className="flex justify-end w-full sm:w-auto sm:flex-1">
              {!isEmpty && (
                <Link
                  href="/tasting/sessions/new"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-colors flex items-center gap-2 flex-shrink-0"
                  aria-label="新規セッション作成"
                >
                  <HiPlus className="text-lg flex-shrink-0" />
                  <span className="whitespace-nowrap">セッションを作成</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-hidden">
          <TastingSessionList data={data} onUpdate={updateData} />
        </main>
      </div>
    </div>
  );
}

export default function TastingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    }>
      <TastingPageContent />
    </Suspense>
  );
}


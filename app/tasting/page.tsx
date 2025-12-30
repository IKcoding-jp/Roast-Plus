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
import { Loading } from '@/components/Loading';
import type { TastingSession, TastingRecord } from '@/types';
import { CaretLeft, PencilCircle, Notebook, Coffee as CoffeeIcon, Plus } from 'phosphor-react';
import { useToastContext } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login?returnUrl=/tasting');
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
      <div className="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="max-w-2xl mx-auto space-y-10">
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <Link
              href="/tasting"
              className="group flex items-center gap-2 text-stone-400 hover:text-amber-600 transition-colors font-bold text-sm uppercase tracking-widest"
            >
              <CaretLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              一覧に戻る
            </Link>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="p-5 bg-white rounded-[2.5rem] shadow-sm border border-stone-100 mb-4 relative">
              <div className="absolute inset-0 bg-amber-50 rounded-[2.5rem] scale-110 blur-2xl opacity-30 -z-10" />
              <PencilCircle size={48} weight="duotone" className="text-amber-600" />
            </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight">
                セッションを編集
              </h1>
              <p className="text-stone-400 font-medium">セッションの情報を更新します</p>
            </div>
          </motion.header>

          <main>
            <TastingSessionForm
              session={session}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
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
      <div className="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="max-w-2xl mx-auto space-y-10">
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <Link
              href="/tasting"
              className="group flex items-center gap-2 text-stone-400 hover:text-amber-600 transition-colors font-bold text-sm uppercase tracking-widest"
            >
              <CaretLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              一覧に戻る
            </Link>
            
            <div className="flex flex-col items-center space-y-3">
            <div className="p-5 bg-white rounded-[2.5rem] shadow-sm border border-stone-100 mb-4 relative">
              <div className="absolute inset-0 bg-amber-50 rounded-[2.5rem] scale-110 blur-2xl opacity-30 -z-10" />
              <Notebook size={48} weight="duotone" className="text-amber-600" />
            </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight">
                記録を編集
              </h1>
              <p className="text-stone-400 font-medium">試飲の感想を更新します</p>
            </div>
          </motion.header>

          <main>
            <TastingRecordForm
              record={record}
              data={data}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
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
      <div className="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="max-w-4xl mx-auto space-y-10">
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <Link
              href="/tasting"
              className="group flex items-center gap-2 text-stone-400 hover:text-amber-600 transition-colors font-bold text-sm uppercase tracking-widest"
            >
              <CaretLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              一覧に戻る
            </Link>
            
            <div className="flex flex-col items-center space-y-3">
            <div className="p-5 bg-white rounded-[2.5rem] shadow-sm border border-stone-100 mb-4 relative">
              <div className="absolute inset-0 bg-amber-50 rounded-[2.5rem] scale-110 blur-2xl opacity-30 -z-10" />
              <CoffeeIcon size={48} weight="duotone" className="text-amber-600" />
            </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight">
                記録の追加・編集
              </h1>
              <p className="text-stone-400 font-medium">セッションの試飲記録を管理します</p>
            </div>
          </motion.header>

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
          <div className="relative flex flex-col sm:flex-row items-center gap-4">
            <div className="flex justify-between items-center w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="group p-2 text-stone-400 hover:text-amber-600 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] bg-white rounded-2xl border border-stone-100 shadow-sm"
                title="戻る"
                aria-label="戻る"
              >
                <CaretLeft size={24} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div id="filter-button-container-mobile" className="sm:hidden"></div>
            </div>
            
            <h1 className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">
              試飲感想記録
            </h1>

            <div className="hidden sm:flex justify-end items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1">
              <div id="filter-button-container"></div>
              {!isEmpty && (
                <Link
                  href="/tasting/sessions/new"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl font-black text-sm shadow-md hover:from-amber-700 hover:to-amber-600 transition-all active:scale-95 flex items-center gap-2 min-h-[44px] flex-shrink-0"
                  aria-label="新規セッション作成"
                >
                  <Plus size={20} weight="bold" />
                  <span className="whitespace-nowrap">セッションを作成</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-hidden pb-20 sm:pb-0">
          <TastingSessionList 
            data={data} 
            onUpdate={updateData}
            filterButtonContainerId="filter-button-container"
            filterButtonContainerIdMobile="filter-button-container-mobile"
          />
        </main>

        {!isEmpty && (
          <div className="sm:hidden fixed bottom-6 left-4 right-4 z-20">
            <Link
              href="/tasting/sessions/new"
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-amber-900/20 hover:from-amber-700 hover:to-amber-600 transition-all active:scale-95 flex items-center justify-center gap-3 min-h-[56px]"
              aria-label="新規セッション作成"
            >
              <Plus size={24} weight="bold" />
              <span className="whitespace-nowrap">セッションを作成</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TastingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TastingPageContent />
    </Suspense>
  );
}


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
import { Plus } from 'phosphor-react';
import { useToastContext } from '@/components/Toast';
import { motion } from 'framer-motion';
import { Button, IconButton, Card, BackLink } from '@/components/ui';

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
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-page">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 text-center">
              <p className="mb-4 text-ink-sub">セッションが見つかりません</p>
              <Link href="/tasting" className="text-spot hover:underline">
                一覧に戻る
              </Link>
            </Card>
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
      <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 bg-page">
        <div className="max-w-lg mx-auto space-y-6">
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center text-center pt-6"
          >
            <BackLink
              href="/tasting"
              variant="icon-only"
              className="absolute left-0 top-0"
            />

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              セッションを編集
            </h1>
            <p className="mt-1 text-sm font-medium text-ink-muted">セッションの情報を更新します</p>
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
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-page">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 text-center">
              <p className="mb-4 text-ink-sub">記録が見つかりません</p>
              <Link href="/tasting" className="text-spot hover:underline">
                一覧に戻る
              </Link>
            </Card>
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
      <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 bg-page">
        <div className="max-w-lg mx-auto space-y-6">
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center text-center pt-6"
          >
            <BackLink
              href="/tasting"
              variant="icon-only"
              className="absolute left-0 top-0"
            />

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              記録を編集
            </h1>
            <p className="mt-1 text-sm font-medium text-ink-muted">試飲の感想を更新します</p>
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
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-page">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <p className="mb-4 text-ink-sub">セッションが見つかりません</p>
              <Link href="/tasting" className="text-spot hover:underline">
                一覧に戻る
              </Link>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 bg-page">
        <div className="max-w-lg mx-auto space-y-6">
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center text-center pt-6"
          >
            <BackLink
              href="/tasting"
              variant="icon-only"
              className="absolute left-0 top-0"
            />

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              記録の追加・編集
            </h1>
            <p className="mt-1 text-sm font-medium text-ink-muted">セッションの試飲記録を管理します</p>
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
    <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4 bg-page">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <header className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="relative flex flex-col sm:flex-row items-center gap-4">
            <div className="flex justify-between items-center w-full sm:w-auto sm:flex-1">
              <BackLink
                href="/"
                variant="icon-only"
              />
              <div className="flex items-center gap-2 sm:hidden">
                <div id="filter-button-container-mobile" className="min-w-[1px]"></div>
                {!isEmpty && (
                  <IconButton
                    variant="primary"
                    onClick={() => router.push('/tasting/sessions/new')}
                    aria-label="新規セッション作成"
                  >
                    <Plus size={22} weight="bold" />
                  </IconButton>
                )}
              </div>
            </div>

            <h1 className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl font-black tracking-tight text-ink">
              試飲感想記録
            </h1>

            <div className="hidden sm:flex justify-end items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1">
              <div id="filter-button-container" className="min-w-[1px]"></div>
              {!isEmpty && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/tasting/sessions/new')}
                  aria-label="新規セッション作成"
                  className="flex items-center gap-2"
                >
                  <Plus size={20} weight="bold" />
                  <span className="whitespace-nowrap">セッションを作成</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main>
          <TastingSessionList
            data={data}
            onUpdate={updateData}
            filterButtonContainerId="filter-button-container"
            filterButtonContainerIdMobile="filter-button-container-mobile"
          />
        </main>
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

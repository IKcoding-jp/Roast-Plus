'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { RoastRecordForm } from '@/components/RoastRecordForm';
import { RoastRecordList } from '@/components/RoastRecordList';
import { Loading } from '@/components/Loading';
import type { RoastTimerRecord } from '@/types';
import { HiPlus, HiArrowLeft } from 'react-icons/hi';
import { useToastContext } from '@/components/Toast';

function RoastRecordPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);
  const { showToast } = useToastContext();

  // クエリパラメータから情報を取得
  const recordId = searchParams?.get('recordId');
  const isNew = searchParams?.get('new') === 'true';
  const beanName = searchParams?.get('beanName') || undefined;
  const weightParam = searchParams?.get('weight');
  const weight = weightParam ? (parseInt(weightParam, 10) as 200 | 300 | 500) : undefined;
  const roastLevel = searchParams?.get('roastLevel') as
    | '浅煎り'
    | '中煎り'
    | '中深煎り'
    | '深煎り'
    | undefined;
  const durationParam = searchParams?.get('duration');
  const duration = durationParam ? parseInt(durationParam, 10) : undefined;

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login?returnUrl=/roast-record');
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

  const roastTimerRecords = Array.isArray(data.roastTimerRecords)
    ? data.roastTimerRecords
    : [];

  // 編集モード
  if (recordId) {
    const record = roastTimerRecords.find((r) => r.id === recordId);
    if (!record) {
      return (
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">記録が見つかりません</p>
              <Link href="/roast-record" className="text-amber-600 hover:underline">
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const handleSave = async (updatedRecord: RoastTimerRecord) => {
      try {
        const updatedRecords = roastTimerRecords.map((r) =>
          r.id === recordId ? { ...updatedRecord, userId: user.uid } : r
        );
        await updateData({
          ...data,
          roastTimerRecords: updatedRecords,
        });
        showToast('記録を更新しました', 'success');
        router.push('/roast-record');
      } catch (error) {
        console.error('Failed to update record:', error);
        showToast('記録の更新に失敗しました', 'error');
      }
    };

    const handleDelete = async (id: string) => {
      const confirmDelete = window.confirm('この記録を削除しますか？');
      if (!confirmDelete) return;

      try {
        const updatedRecords = roastTimerRecords.filter((r) => r.id !== id);
        await updateData({
          ...data,
          roastTimerRecords: updatedRecords,
        });
        showToast('記録を削除しました', 'success');
        router.push('/roast-record');
      } catch (error) {
        console.error('Failed to delete record:', error);
        showToast('記録の削除に失敗しました', 'error');
      }
    };

    const handleCancel = () => {
      router.push('/roast-record');
    };

    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex justify-start w-full sm:w-auto sm:flex-1">
                <Link
                  href="/roast-record"
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
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <RoastRecordForm
                data={data}
                record={record}
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

  // 新規作成モード
  if (isNew) {
    const initialValues = {
      beanName,
      weight,
      roastLevel,
      duration,
    };

    const handleSave = async (newRecord: RoastTimerRecord) => {
      try {
        const recordToSave: RoastTimerRecord = {
          ...newRecord,
          userId: user.uid,
        };

        const updatedRecords = [...roastTimerRecords, recordToSave];
        await updateData({
          ...data,
          roastTimerRecords: updatedRecords,
        });

        showToast('ロースト記録を保存しました', 'success');
        router.push('/roast-record');
      } catch (error) {
        console.error('Failed to save roast record:', error);
        showToast('ロースト記録の保存に失敗しました', 'error');
      }
    };

    const handleCancel = () => {
      router.push('/roast-record');
    };

    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex justify-start w-full sm:w-auto sm:flex-1">
                <Link
                  href="/roast-record"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <HiArrowLeft className="text-lg flex-shrink-0" />
                  一覧に戻る
                </Link>
              </div>
              <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
                新規記録を作成
              </h1>
              <div className="hidden sm:block flex-1 flex-shrink-0"></div>
            </div>
          </header>
          <main>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <RoastRecordForm
                data={data}
                onSave={handleSave}
                initialValues={initialValues}
                onCancel={handleCancel}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 一覧表示（デフォルト）
  return (
    <div className="h-screen overflow-y-hidden flex flex-col px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <header className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="戻る"
                aria-label="戻る"
              >
                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
            <h1 className="hidden sm:block w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              ロースト記録
            </h1>
            <div className="flex justify-end w-full sm:w-auto sm:flex-1">
              <Link
                href="/roast-record?new=true"
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-colors flex items-center gap-2 flex-shrink-0"
                aria-label="新規記録作成"
              >
                <HiPlus className="text-lg flex-shrink-0" />
                <span className="whitespace-nowrap">新規記録を作成</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-hidden">
          <RoastRecordList data={data} onUpdate={updateData} />
        </main>
      </div>
    </div>
  );
}

export default function RoastRecordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RoastRecordPageContent />
    </Suspense>
  );
}


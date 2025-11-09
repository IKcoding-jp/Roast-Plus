'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionForm } from '@/components/TastingSessionForm';
import type { TastingSession } from '@/types';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

export default function EditTastingSessionPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

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

  const tastingSessions = Array.isArray(data.tastingSessions)
    ? data.tastingSessions
    : [];
  const session = tastingSessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
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

  const handleSave = async (updatedSession: TastingSession) => {
    try {
      const sessionData: TastingSession = {
        ...updatedSession,
        userId: user.uid,
      };

      const updatedSessions = tastingSessions.map((s) =>
        s.id === sessionId ? sessionData : s
      );
      await updateData({
        ...data,
        tastingSessions: updatedSessions,
      });

      // 保存が完了してから試飲記録一覧ページに遷移
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to save tasting session:', error);
      alert('セッションの保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleCancel = () => {
    router.push(`/tasting/sessions/${sessionId}`);
  };

  const handleDelete = async (id: string) => {
    const tastingRecords = Array.isArray(data.tastingRecords) ? data.tastingRecords : [];
    const recordCount = tastingRecords.filter((r) => r.sessionId === id).length;
    const confirmMessage = recordCount > 0
      ? `このセッションと関連する${recordCount}件の記録を削除しますか？この操作は取り消せません。`
      : 'このセッションを削除しますか？この操作は取り消せません。';
    
    const confirmDelete = window.confirm(confirmMessage);
    if (!confirmDelete) return;

    try {
      // セッションに関連する記録も削除
      const updatedRecords = tastingRecords.filter(
        (r) => r.sessionId !== id
      );
      
      // セッションを削除
      const updatedSessions = tastingSessions.filter(
        (s) => s.id !== id
      );

      await updateData({
        ...data,
        tastingSessions: updatedSessions,
        tastingRecords: updatedRecords,
      });

      // 削除が完了してから試飲記録一覧ページに遷移
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to delete tasting session:', error);
      alert('セッションの削除に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/tasting"
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <HiArrowLeft className="text-lg flex-shrink-0" />
                試飲記録一覧に戻る
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              セッション編集
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


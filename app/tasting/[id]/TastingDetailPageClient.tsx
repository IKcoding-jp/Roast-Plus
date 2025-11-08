'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingRecordForm } from '@/components/TastingRecordForm';
import type { TastingRecord } from '@/types';
import { getSelectedMemberId } from '@/lib/localStorage';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

export default function TastingDetailPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const params = useParams();
  const recordId = params?.id as string;

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

  const tastingRecords = Array.isArray(data.tastingRecords) ? data.tastingRecords : [];
  const record = tastingRecords.find((r) => r.id === recordId);
  const selectedMemberId = getSelectedMemberId();
  const isOwnRecord = record?.memberId === selectedMemberId;

  if (!record) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">記録が見つかりません</p>
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

  const handleSave = (updatedRecord: TastingRecord) => {
    if (!isOwnRecord) {
      alert('自分の記録のみ編集できます');
      return;
    }

    const updatedRecords = tastingRecords.map((r) =>
      r.id === recordId ? { ...updatedRecord, userId: user.uid } : r
    );
    updateData({
      ...data,
      tastingRecords: updatedRecords,
    });

    router.push('/tasting');
  };

  const handleDelete = (id: string) => {
    if (!isOwnRecord) {
      alert('自分の記録のみ削除できます');
      return;
    }

    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (!confirmDelete) return;

    const updatedRecords = tastingRecords.filter((r) => r.id !== id);
    updateData({
      ...data,
      tastingRecords: updatedRecords,
    });

    router.push('/tasting');
  };

  const handleCancel = () => {
    router.push('/tasting');
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
          {!isOwnRecord && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                この記録は他のメンバーのものです。閲覧のみ可能です。
              </p>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md p-6">
            <TastingRecordForm
              record={isOwnRecord ? record : null}
              data={data}
              onSave={handleSave}
              onDelete={isOwnRecord ? handleDelete : undefined}
              onCancel={handleCancel}
              readOnly={!isOwnRecord}
            />
          </div>
        </main>
      </div>
    </div>
  );
}



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
import { useEffect, useState, useRef } from 'react';

export default function TastingDetailPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const params = useParams();
  const [recordId, setRecordId] = useState<string | null>(null);
  const hasRedirected = useRef(false); // 無限ループを防ぐためのフラグ

  // 予約語のリスト
  const reservedWords = ['new', 'edit', 'sessions'];

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
      const pathMatch = window.location.pathname.match(/\/tasting\/([^\/]+)/);
      if (pathMatch && pathMatch[1]) {
        id = pathMatch[1];
      }
    }

    // 方法3: window.location.hashから取得（フォールバック）
    if (!id && typeof window !== 'undefined' && window.location.hash) {
      const hashMatch = window.location.hash.match(/\/tasting\/([^\/]+)/);
      if (hashMatch && hashMatch[1]) {
        id = hashMatch[1];
      }
    }

    if (id) {
      setRecordId(id);
    }
  }, [params]);

  // 予約語チェック: 静的エクスポート時のルーティング競合を防ぐ
  // 早期に検出して適切なページにリダイレクト
  useEffect(() => {
    if (!recordId || hasRedirected.current) return;

    if (reservedWords.includes(recordId)) {
      hasRedirected.current = true; // 無限ループを防ぐ
      
      if (recordId === 'new') {
        // `/tasting/new`は実際に存在するページなので、リダイレクト
        // window.location.hrefを使用して、確実にページを切り替える
        window.location.href = '/tasting/new';
        return;
      }
      // その他の予約語（edit、sessions）は存在しないので、404エラーとして扱う
      // この処理は後続のレンダリングで404を表示する
    }
  }, [recordId]);

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

  // 記録IDが取得できない場合
  if (!recordId) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">記録IDが取得できません</p>
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

  // 予約語チェック: 静的エクスポート時のルーティング競合を防ぐ
  // リダイレクト処理中の場合、ローディング表示
  if (reservedWords.includes(recordId) && recordId === 'new') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EB]">
        <div className="text-center">
          <div className="text-lg text-gray-600">リダイレクト中...</div>
        </div>
      </div>
    );
  }

  // 予約語チェック: edit、sessionsなどの場合は404エラーを表示
  if (reservedWords.includes(recordId)) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">ページが見つかりません</p>
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

  const handleSave = async (updatedRecord: TastingRecord) => {
    if (!isOwnRecord) {
      alert('自分の記録のみ編集できます');
      return;
    }

    try {
      const updatedRecords = tastingRecords.map((r) =>
        r.id === recordId ? { ...updatedRecord, userId: user.uid } : r
      );
      await updateData({
        ...data,
        tastingRecords: updatedRecords,
      });

      // 保存が完了してから試飲記録一覧ページに遷移
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to save tasting record:', error);
      alert('記録の保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isOwnRecord) {
      alert('自分の記録のみ削除できます');
      return;
    }

    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (!confirmDelete) return;

    try {
      const updatedRecords = tastingRecords.filter((r) => r.id !== id);
      await updateData({
        ...data,
        tastingRecords: updatedRecords,
      });

      // 削除が完了してから試飲記録一覧ページに遷移
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to delete tasting record:', error);
      alert('記録の削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleCancel = () => {
    // 試飲記録一覧ページに戻る
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingRecordList } from '@/components/TastingRecordList';
import { HiArrowLeft } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

export default function TastingPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();

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

  return (
    <div className="min-h-screen bg-[#F5F1EB] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              試飲記録
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <TastingRecordList data={data} onUpdate={updateData} />
        </main>

        {/* 新規作成FAB */}
        <Link
          href="/tasting/new"
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#8B4513] text-white rounded-full shadow-lg hover:bg-[#6B3410] transition-colors flex items-center justify-center z-10"
          aria-label="新規作成"
        >
          <HiPlus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { AssignmentTable } from '@/components/AssignmentTable';
import { MemberTeamManagement } from '@/components/MemberTeamManagement';
import { TaskLabelManagement } from '@/components/TaskLabelManagement';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

type TabType = 'assignment' | 'members' | 'labels';

export default function AssignmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('assignment');

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
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
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            <div className="w-full sm:w-auto sm:flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                担当表
              </h1>
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                ※バグが発生していて、使えません。
              </p>
            </div>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>
        <div className="mb-6">
          <nav className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white rounded-lg shadow p-1 sm:p-2">
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base ${
                activeTab === 'assignment'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              担当表
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base ${
                activeTab === 'members'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              メンバー・班管理
            </button>
            <button
              onClick={() => setActiveTab('labels')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base ${
                activeTab === 'labels'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              作業ラベル管理
            </button>
          </nav>
        </div>
        <main>
          {activeTab === 'assignment' && (
            <AssignmentTable data={data} onUpdate={updateData} />
          )}
          {activeTab === 'members' && (
            <MemberTeamManagement data={data} onUpdate={updateData} />
          )}
          {activeTab === 'labels' && (
            <TaskLabelManagement data={data} onUpdate={updateData} />
          )}
        </main>
      </div>
    </div>
  );
}

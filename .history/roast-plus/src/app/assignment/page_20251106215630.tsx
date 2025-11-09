'use client';

import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import TeamMemberManagement from '@/components/TeamMemberManagement';
import TaskLabelManagement from '@/components/TaskLabelManagement';
import AssignmentTable from '@/components/AssignmentTable';
import Auth from '@/components/Auth';
import { useState } from 'react';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';

type TabType = 'assignment' | 'members' | 'labels';

export default function AssignmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading: dataLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>('assignment');

  // 認証状態の読み込み中
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  // 未ログイン時はログイン画面を表示
  if (!user) {
    return <Auth />;
  }

  // データ読み込み中
  if (dataLoading) {
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
        <header className="mb-6 sm:mb-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex-1 flex justify-start">
              <Link
                href="/"
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
              >
                <HiArrowLeft className="text-lg" />
                ホームに戻る
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex-1">
              担当表
            </h1>
            <div className="flex-1"></div>
          </div>
        </header>

        <div className="mb-6">
          <nav className="flex flex-col md:flex-row gap-2 bg-white rounded-lg shadow p-1">
            <button
              onClick={() => setActiveTab('assignment')}
              className={`w-full md:flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors ${
                activeTab === 'assignment'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              担当表
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`w-full md:flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors ${
                activeTab === 'members'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              メンバー・班管理
            </button>
            <button
              onClick={() => setActiveTab('labels')}
              className={`w-full md:flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors ${
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
            <TeamMemberManagement data={data} onUpdate={updateData} />
          )}
          {activeTab === 'labels' && (
            <TaskLabelManagement data={data} onUpdate={updateData} />
          )}
        </main>
      </div>
    </div>
  );
}


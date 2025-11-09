'use client';

import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import Link from 'next/link';
import { FaCoffee } from 'react-icons/fa';
import { HiUsers, HiCalendar } from 'react-icons/hi';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();

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

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* アプリヘッダー */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaCoffee className="text-3xl sm:text-4xl text-amber-800" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                ローストプラス
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* 業務セクション */}
        <section className="mb-8">
          <div className="bg-orange-50 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* 担当表カード */}
              <Link
                href="/assignment"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]"
              >
                <HiUsers className="text-4xl sm:text-5xl text-orange-600 mb-3" />
                <span className="text-base sm:text-lg font-medium text-gray-800 text-center">
                  担当表
                </span>
              </Link>
              {/* スケジュールカード */}
              <Link
                href="/schedule"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]"
              >
                <HiCalendar className="text-4xl sm:text-5xl text-orange-600 mb-3" />
                <span className="text-base sm:text-lg font-medium text-gray-800 text-center mb-1">
                  スケジュール
                </span>
                <span className="text-xs sm:text-sm text-gray-500 text-center">
                  開発中
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

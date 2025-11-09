'use client';

import { useRouter } from 'next/navigation';
import { useAuth, signOut } from '@/lib/auth';
import { useEffect } from 'react';
import { PiCoffeeBeanFill } from "react-icons/pi";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { FaCoffee } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { IoSettings } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNotifications } from '@/hooks/useNotifications';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* ヘッダー */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <PiCoffeeBeanFill className="h-6 w-6 text-[#8B4513]" />
          <h1 className="text-xl font-bold text-gray-800">ローストプラス</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* 通知マーク */}
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2.5 text-gray-700 hover:text-gray-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="通知"
          >
            <IoNotificationsOutline className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 担当表カード */}
          <button
            onClick={() => router.push('/assignment')}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex justify-center">
              <HiUsers className="h-16 w-16 text-orange-500" />
            </div>
            <h2 className="text-center text-lg font-semibold text-gray-800">
              担当表
            </h2>
          </button>

          {/* スケジュールカード */}
          <button
            onClick={() => router.push('/schedule')}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex justify-center">
              <RiCalendarScheduleLine className="h-16 w-16 text-orange-500" />
            </div>
            <h2 className="text-center text-lg font-semibold text-gray-800">
              スケジュール
            </h2>
          </button>

          {/* 試飲感想記録カード */}
          <button
            onClick={() => router.push('/tasting')}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex justify-center">
              <FaCoffee className="h-16 w-16 text-orange-500" />
            </div>
            <h2 className="text-center text-lg font-semibold text-gray-800">
              試飲感想記録　※開発中
            </h2>
          </button>

          {/* 設定カード */}
          <button
            onClick={() => router.push('/settings')}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex justify-center">
              <IoSettings className="h-16 w-16 text-orange-500" />
            </div>
            <h2 className="text-center text-lg font-semibold text-gray-800">
              設定
            </h2>
          </button>
        </div>
      </main>
    </div>
  );
}

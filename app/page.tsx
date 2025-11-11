'use client';

import { useRouter } from 'next/navigation';
import { useAuth, signOut } from '@/lib/auth';
import { useEffect } from 'react';
import { PiCoffeeBeanFill } from "react-icons/pi";
import { RiCalendarScheduleLine, RiBookFill } from "react-icons/ri";
import { FaCoffee, FaThumbsUp } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { IoSettings } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdTimer } from "react-icons/md";
import { MdTimeline } from "react-icons/md";
import { useNotifications } from '@/hooks/useNotifications';
import { useAppData } from '@/hooks/useAppData';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const { data, updateData } = useAppData();

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

  const handleEncouragementClick = async () => {
    try {
      const currentCount = data.encouragementCount ?? 0;
      await updateData({
        ...data,
        encouragementCount: currentCount + 1,
      });
    } catch (error: any) {
      // Firestoreのデバウンス機能によるエラーは無視（正常な動作の一部）
      if (error?.message === 'New write request superseded previous one') {
        // このエラーは正常な動作の一部なので無視
        // コンソールにエラーを表示しない
        return;
      }
      // その他のエラーのみコンソールに表示
      console.error('応援カウント更新エラー:', error);
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
      <header className="flex items-center justify-between bg-dark px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <PiCoffeeBeanFill className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">ローストプラス</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* 通知マーク */}
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2.5 text-white hover:text-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
            className="text-sm font-medium text-white hover:text-gray-200"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* 応援メッセージバナー */}
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-3">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2">
            <FaThumbsUp className="h-5 w-5 text-amber-700 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed text-center">
              開発者は「ITパスポート」という資格試験を11月15日に受けるので、開発は来週までお休みします。応援してね！
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          {/* 担当表カード */}
          <button
            onClick={() => router.push('/assignment')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <HiUsers className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              担当表
            </h2>
          </button>

          {/* スケジュールカード */}
          <button
            onClick={() => router.push('/schedule')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <RiCalendarScheduleLine className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              スケジュール
            </h2>
          </button>

          {/* 試飲感想記録カード */}
          <button
            onClick={() => router.push('/tasting')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <FaCoffee className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              試飲感想記録
            </h2>
          </button>

          {/* ローストタイマーカード */}
          <button
            onClick={() => router.push('/roast-timer')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <MdTimer className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              ローストタイマー
            </h2>
            <span className="flex-shrink-0 text-xs sm:text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              開発予定
            </span>
          </button>

          {/* 欠点豆図鑑カード */}
          <button
            onClick={() => router.push('/defect-beans')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <RiBookFill className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              欠点豆図鑑
            </h2>
            <span className="flex-shrink-0 text-xs sm:text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              開発予定
            </span>
          </button>

          {/* 作業進捗カード */}
          <button
            onClick={() => router.push('/progress')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <MdTimeline className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              作業進捗
            </h2>
            <span className="flex-shrink-0 text-xs sm:text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              開発予定
            </span>
          </button>

          {/* 設定カード */}
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <IoSettings className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="flex-1 text-left text-base sm:text-lg font-semibold text-gray-800">
              設定
            </h2>
          </button>
        </div>
      </main>
    </div>
  );
}

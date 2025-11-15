'use client';

import { useRouter } from 'next/navigation';
import { useAuth, signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { PiCoffeeBeanFill } from "react-icons/pi";
import { RiCalendarScheduleLine, RiBookFill } from "react-icons/ri";
import { FaCoffee } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { IoSettings, IoClose } from "react-icons/io5";
import { MdTimer } from "react-icons/md";
import { MdTimeline } from "react-icons/md";

// バージョン情報（package.jsonと同期）
const APP_VERSION = '0.2.0';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(true);

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
      <header className="flex items-center justify-between bg-dark px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <PiCoffeeBeanFill className="h-6 w-6 text-gold" />
          <h1 className="text-xl font-bold text-white">ローストプラス</h1>
          <span className="text-sm font-normal text-gray-300">v{APP_VERSION}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white hover:text-gray-200"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* バナー通知 */}
      {showBanner && (
        <div className="bg-gradient-to-r from-amber-100 to-orange-50 border-b border-amber-300 shadow-sm">
          <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-2.5">
            <div className="flex items-start gap-2 max-w-2xl mx-auto">
              <div className="flex-1">
                <p className="text-xs sm:text-sm leading-relaxed text-gray-800 font-medium">
                  ITパスポートは合格しました。ローストタイマーと欠点豆図鑑、作業進捗がある程度完成したので、確認してみてください！
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0 p-0.5 hover:bg-amber-200 rounded transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center text-gray-700"
                aria-label="バナーを閉じる"
              >
                <IoClose className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 pt-2 sm:pt-3 pb-6 sm:pb-8">
        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          {/* 担当表カード */}
          <button
            onClick={() => router.push('/assignment')}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg min-h-[60px]"
          >
            <div className="flex-shrink-0">
              <HiUsers className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                担当表
              </h2>
            </div>
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
              ローストタイマー β版
            </h2>
            <span className="flex-shrink-0 new-label-gradient text-white text-xs font-bold px-2 py-1 rounded shadow-md animate-pulse-scale">
              New!
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
              欠点豆図鑑 β版
            </h2>
            <span className="flex-shrink-0 new-label-gradient text-white text-xs font-bold px-2 py-1 rounded shadow-md animate-pulse-scale">
              New!
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
              作業進捗 β版
            </h2>
            <span className="flex-shrink-0 new-label-gradient text-white text-xs font-bold px-2 py-1 rounded shadow-md animate-pulse-scale">
              New!
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

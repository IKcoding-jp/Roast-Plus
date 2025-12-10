'use client';

/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { useAuth, signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { PiCoffeeBeanFill } from "react-icons/pi";
import { RiCalendarScheduleFill, RiBookFill } from "react-icons/ri";
import { FaCoffee, FaUsers } from "react-icons/fa";

import { IoSettings, IoTimer } from "react-icons/io5";
import { MdTimer, MdTimeline, MdCoffeeMaker, MdAddCircle } from "react-icons/md";
import { Loading } from '@/components/Loading';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';

const SPLASH_DISPLAY_TIME = 3000; // スプラッシュ画面の表示時間（3秒）

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoadingDebugModal, setShowLoadingDebugModal] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const { isEnabled: isDeveloperMode } = useDeveloperMode();

  // スプラッシュ画面の表示時間を管理
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, SPLASH_DISPLAY_TIME + 300); // フェードアウト時間も考慮

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // スマホレイアウト: 画面高さに応じてカードの高さを動的に調整
  useEffect(() => {
    const calculateCardHeight = () => {
      // スマホのみで適用（md未満 = 768px未満）
      if (typeof window === 'undefined' || window.innerWidth >= 768) {
        setCardHeight(null);
        return;
      }

      // 利用可能な高さを計算
      const viewportHeight = window.innerHeight;
      const headerHeight = 64; // py-4 (16px × 2) + ロゴ高さ (32px) = 約64px
      const paddingTop = 8; // pt-2 = 8px
      const paddingBottom = 24; // pb-6 = 24px
      const gridGap = 60; // 5行 × gap-3 (12px) = 60px
      
      const availableHeight = viewportHeight - headerHeight - paddingTop - paddingBottom;
      const cardHeightPerRow = (availableHeight - gridGap) / 5; // 10個のカードを5行に配置
      
      // 最小高さを確保（100px以上）
      const minCardHeight = 100;
      const calculatedHeight = Math.max(cardHeightPerRow, minCardHeight);
      
      setCardHeight(calculatedHeight);
    };

    // 初回計算
    calculateCardHeight();

    // リサイズイベントリスナーを追加
    window.addEventListener('resize', calculateCardHeight);
    window.addEventListener('orientationchange', calculateCardHeight);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', calculateCardHeight);
      window.removeEventListener('orientationchange', calculateCardHeight);
    };
  }, []);

  // 開発用: Lottieアニメーション確認モーダルを表示
  const handleShowLoadingDebugModal = () => {
    setShowLoadingDebugModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // スプラッシュ画面が表示されている間は、Loadingを表示しない
  if (loading && !splashVisible) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F5' }}>
      {/* 開発用: Lottieアニメーション確認モーダル */}
      {showLoadingDebugModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoadingDebugModal(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Lottieアニメーション確認</h2>
              <button
                onClick={() => setShowLoadingDebugModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <Loading fullScreen={false} message="読み込み中..." />
            </div>
            <div className="mb-4">
              <Loading fullScreen={false} message="データを読み込み中..." />
            </div>
            <button
              onClick={() => setShowLoadingDebugModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="flex items-center justify-between bg-dark px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="RoastPlus" 
            className="h-10 w-auto md:h-12"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* 開発者モード: Lottieアニメーション確認ボタン */}
          {isDeveloperMode && (
            <button
              onClick={handleShowLoadingDebugModal}
              className="p-2 text-white hover:text-gray-200 hover:bg-dark-light rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Lottieアニメーション確認"
              title="開発用: Lottieアニメーション確認"
            >
              <PiCoffeeBeanFill className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white hover:text-gray-200"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 pt-2 sm:pt-3 pb-6 sm:pb-8">
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3"
          style={cardHeight ? { gridAutoRows: `${cardHeight}px` } : { gridAutoRows: '1fr' }}
        >


          {/* 担当表カード */}
          <button
            onClick={() => router.push('/assignment')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <FaUsers className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              担当表
            </h2>
          </button>

          {/* スケジュールカード */}
          <button
            onClick={() => router.push('/schedule')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <RiCalendarScheduleFill className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              スケジュール
            </h2>
          </button>

          {/* 試飲感想記録カード */}
          <button
            onClick={() => router.push('/tasting')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <FaCoffee className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              試飲感想記録
            </h2>
          </button>

          {/* ローストタイマーカード */}
          <button
            onClick={() => router.push('/roast-timer')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <MdTimer className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-sm md:text-base font-semibold text-gray-800 text-center">
              ローストタイマー
            </h2>
          </button>

          {/* コーヒー豆図鑑カード */}
          <button
            onClick={() => router.push('/defect-beans')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <RiBookFill className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              コーヒー豆図鑑
            </h2>
          </button>

          {/* 作業進捗カード */}
          <button
            onClick={() => router.push('/progress')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <MdTimeline className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              作業進捗
            </h2>
          </button>

          {/* ドリップガイドカード */}
          <button
            onClick={() => router.push('/drip-guide')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <MdCoffeeMaker className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              ドリップガイド
            </h2>
          </button>

          {/* ハンドピックタイマーカード */}
          <button
            onClick={() => router.push('/handpick-timer')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <IoTimer className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-xs md:text-base font-semibold text-gray-800 text-center">
              ハンドピックタイマー
            </h2>
          </button>

          {/* カウンターカード */}
          <button
            onClick={() => router.push('/counter')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <MdAddCircle className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-center">
              カウンター
            </h2>
          </button>

          {/* 設定カード */}
          <button
            onClick={() => router.push('/settings')}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 md:p-6 shadow-md transition-shadow hover:shadow-lg md:h-full"
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <IoSettings className="h-12 w-12 md:h-12 md:w-12 text-primary" />
            <h2 className="text-base md:text-base font-semibold text-gray-800 text-right md:text-center">
              設定
            </h2>
          </button>
        </div>
      </main>
    </div>
  );
}

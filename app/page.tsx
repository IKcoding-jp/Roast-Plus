'use client';

/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCoffee, FaUsers } from 'react-icons/fa';
import { IoSettings, IoTimer } from 'react-icons/io5';
import { MdAddCircle, MdCoffeeMaker, MdTimer, MdTimeline } from 'react-icons/md';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { RiBookFill, RiCalendarScheduleFill } from 'react-icons/ri';
import { Loading } from '@/components/Loading';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useAuth, signOut } from '@/lib/auth';

const SPLASH_DISPLAY_TIME = 3000; // スプラッシュ画面の表示時間 (ms)

const ACTIONS = [
  {
    key: 'assignment',
    title: '担当表',
    description: '公平に担当を割り当て',
    href: '/assignment',
    icon: FaUsers,
  },
  {
    key: 'schedule',
    title: 'スケジュール',
    description: '一日の予定を確認',
    href: '/schedule',
    icon: RiCalendarScheduleFill,
  },
  {
    key: 'tasting',
    title: '試飲感想記録',
    description: '試飲の感想を記録',
    href: '/tasting',
    icon: FaCoffee,
  },
  {
    key: 'roast-timer',
    title: 'ローストタイマー',
    description: '最適なタイマーで焙煎',
    href: '/roast-timer',
    icon: MdTimer,
  },
  {
    key: 'defect-beans',
    title: 'コーヒー豆図鑑',
    description: '欠点豆の知識を共有',
    href: '/defect-beans',
    icon: RiBookFill,
  },
  {
    key: 'progress',
    title: '作業進捗',
    description: '進捗を可視化',
    href: '/progress',
    icon: MdTimeline,
  },
  {
    key: 'drip-guide',
    title: 'ドリップガイド',
    description: '淹れ方の手順',
    href: '/drip-guide',
    icon: MdCoffeeMaker,
  },
  {
    key: 'handpick-timer',
    title: 'ハンドピックタイマー',
    description: '効率よくハンドピック',
    href: '/handpick-timer',
    icon: IoTimer,
  },
  {
    key: 'counter',
    title: 'カウンター',
    description: '数え間違い防止',
    href: '/counter',
    icon: MdAddCircle,
  },
  {
    key: 'settings',
    title: '設定',
    description: '自分好みにカスタマイズ',
    href: '/settings',
    icon: IoSettings,
  },
];

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
    }, SPLASH_DISPLAY_TIME + 300); // フェードアウト時間を加味

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
      // md未満 (768px未満) だけ可変
      if (typeof window === 'undefined' || window.innerWidth >= 768) {
        setCardHeight(null);
        return;
      }

      // 利用可能な高さを算出
      const viewportHeight = window.innerHeight;
      const headerHeight = 72; // ヘッダーの高さ目安
      const paddingTop = 8; // pt-2 = 8px
      const paddingBottom = 24; // pb-6 = 24px
      const gridGap = 60; // 5行  gap-3 (12px)

      const availableHeight = viewportHeight - headerHeight - paddingTop - paddingBottom;
      const cardHeightPerRow = (availableHeight - gridGap) / 5; // 10カードを5行に配置

      // 最低100pxは確保
      const minCardHeight = 100;
      const calculatedHeight = Math.max(cardHeightPerRow, minCardHeight);

      setCardHeight(calculatedHeight);
    };

    // 初回計算
    calculateCardHeight();

    // リサイズ向き変更を監視
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

  // スプラッシュ表示中はLoadingを出さない
  if (loading && !splashVisible) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F2EB] to-[#F3F0EA] text-[#1F2A44]">
      {/* 開発用: Lottieアニメーション確認モーダル */}
      {showLoadingDebugModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowLoadingDebugModal(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Lottieアニメーション確認</h2>
              <button
                onClick={() => setShowLoadingDebugModal(false)}
                className="text-2xl font-bold text-gray-500 transition-colors hover:text-gray-700"
                aria-label="閉じる"
              >
                
              </button>
            </div>
            <div className="mb-4">
              <Loading fullScreen={false} message="メインスプラッシュを確認中..." />
            </div>
            <div className="mb-4">
              <Loading fullScreen={false} message="読み込み状態を確認中..." />
            </div>
            <button
              onClick={() => setShowLoadingDebugModal(false)}
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-[#261a14]/98 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RoastPlus" className="h-8 w-auto md:h-10" />
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {isDeveloperMode && (
              <button
                onClick={handleShowLoadingDebugModal}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Lottieアニメーション確認モーダルを開く"
                title="開発用: Lottieアニメーション確認"
              >
                <PiCoffeeBeanFill className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-white transition-colors hover:text-gray-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 pt-4 pb-10 sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-between">
        </div>

        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
          style={cardHeight ? { gridAutoRows: `${cardHeight}px` } : { gridAutoRows: '1fr' }}
        >
          {ACTIONS.map(({ key, title, description, href, icon: Icon }) => (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F2EB]"
              style={cardHeight ? { height: `${cardHeight}px` } : undefined}
              aria-label={title}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-8 w-8" />
              </span>
              <div className="space-y-1 text-center">
                <p className={`font-semibold text-slate-900 ${title === 'ハンドピックタイマー' ? 'text-xs md:text-sm' : 'text-base md:text-lg'}`}>{title}</p>
                <p className="text-xs text-slate-500 md:text-sm">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

'use client';

/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCoffee, FaUsers } from 'react-icons/fa';
import { IoSettings, IoSparkles } from 'react-icons/io5';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { MdCoffeeMaker, MdTimer, MdTimeline } from 'react-icons/md';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { RiBookFill, RiCalendarScheduleFill } from 'react-icons/ri';
import { Loading } from '@/components/Loading';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { useAuth, signOut } from '@/lib/auth';
import { Snowfall } from '@/components/Snowfall';
import { FaTree, FaGift, FaSnowflake, FaHollyBerry, FaStar } from 'react-icons/fa';
import { PiBellFill } from 'react-icons/pi';
import { GiCandyCanes, GiGingerbreadMan } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';

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
    key: 'coffee-trivia',
    title: 'コーヒー雑学・クイズ',
    description: '楽しく学ぶコーヒー知識',
    href: '/coffee-trivia',
    icon: IoSparkles,
  },
  {
    key: 'dev-stories',
    title: '開発秘話',
    description: '開発の裏話を覗く',
    href: '/dev-stories',
    icon: RiLightbulbFlashFill,
  },
  {
    key: 'settings',
    title: '設定',
    description: '自分好みにカスタマイズ',
    href: '/settings',
    icon: IoSettings,
  },
];

type HomePageProps = {
  params?: Promise<Record<string, never>>;
  searchParams?: Promise<Record<string, never>>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HomePage(_props: HomePageProps = {}) {
  // Next.js 16ではparamsとsearchParamsがPromise型
  // このページでは使用しないが、型定義を追加して開発ツールのエラーを防ぐ

  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoadingDebugModal, setShowLoadingDebugModal] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const { isEnabled: isDeveloperMode } = useDeveloperMode();
  const { isChristmasMode } = useChristmasMode();

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
    <div className={`min-h-screen text-slate-100 animate-home-page relative transition-colors duration-1000 ${isChristmasMode
      ? 'bg-[#051a0e] bg-[radial-gradient(circle_at_center,_#0a2f1a_0%,_#051a0e_100%)]'
      : 'bg-gradient-to-b from-[#F7F2EB] to-[#F3F0EA] text-[#1F2A44]'
      }`}>
      {isChristmasMode && <Snowfall />}

      {/* ノイズテクスチャ (高級感の演出) */}
      {isChristmasMode && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
      )}

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
      <header className={`relative z-50 shadow-2xl transition-all duration-1000 ${isChristmasMode
        ? 'bg-gradient-to-r from-[#4a0e0e] via-[#5d1212] to-[#2d0a0a] backdrop-blur-xl border-b-[0.5px] border-[#d4af37]/40'
        : 'bg-[#261a14]/98'
        }`}>
        {/* ヘッダー下部の極細ゴールドライン */}
        {isChristmasMode && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent shadow-[0_-1px_10px_rgba(212,175,55,0.3)]"></div>
        )}

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-5">
          <div className="relative flex items-center gap-3 group cursor-default">
            {isChristmasMode ? (
              <div className="flex items-center gap-1">
                <div className="relative flex items-center justify-center p-1">
                  {/* ツリー本体 */}
                  <FaTree className="text-[#1a472a] text-2xl md:text-4xl drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-700 group-hover:scale-105" />

                  {/* トップスター */}
                  <FaStar className="absolute -top-0.5 text-[#ffcc33] text-[10px] animate-pulse drop-shadow-[0_0_8px_#ffcc33]" />

                  {/* オーナメント (光る飾り) */}
                  <div className="absolute top-[35%] left-[45%] w-1 h-1 bg-[#e23636] rounded-full shadow-[0_0_6px_#e23636] animate-pulse"></div>
                  <div className="absolute top-[55%] right-[35%] w-1 h-1 bg-[#d4af37] rounded-full shadow-[0_0_6px_#d4af37] animate-pulse [animation-delay:0.3s]"></div>
                  <div className="absolute top-[70%] left-[38%] w-0.5 h-0.5 bg-[#f8f1e7] rounded-full shadow-[0_0_4px_white] animate-pulse [animation-delay:0.6s]"></div>
                </div>

                <div className="relative flex flex-col items-center">
                  <span className="text-2xl md:text-4xl font-black italic tracking-tighter flex items-center leading-none">
                    <span className="text-[#e23636] relative drop-shadow-[0_0_10px_rgba(226,54,54,0.3)]">
                      R
                    </span>
                    <span className="text-[#f8f1e7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">oast</span>
                    <span className="text-[#d4af37] ml-0.5 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">Plus</span>
                  </span>
                  <div className="w-full h-[1.5px] mt-0.5 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent shadow-[0_1px_8px_rgba(212,175,55,0.4)]"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start leading-none">
                <div className="flex items-center gap-1">
                  <span className="text-2xl md:text-3xl font-bold tracking-tight text-white font-[var(--font-playfair)]">
                    Roast
                    <span className="text-[#EF8A00] ml-0.5">Plus</span>
                  </span>
                </div>
              </div>
            )}

            {/* キャラクター画像 - フカイリとアサイリ */}
            <img
              src="/avatars/header_characters.png"
              alt="フカイリとアサイリ"
              className="h-10 md:h-14 w-auto object-contain ml-2"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {isDeveloperMode && (
              <button
                onClick={handleShowLoadingDebugModal}
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 transition-all ${isChristmasMode ? 'text-[#d4af37] bg-white/5 hover:bg-[#d4af37]/20 border border-[#d4af37]/20 shadow-inner' : 'text-white hover:bg-white/10'
                  }`}
                aria-label="Lottieアニメーション確認モーダルを開く"
              >
                <PiCoffeeBeanFill className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={handleLogout}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-300 ${isChristmasMode
                ? 'text-[#f8f1e7] bg-[#6d1a1a] hover:bg-[#8b2323] border border-[#d4af37]/40 hover:border-[#d4af37] shadow-lg'
                : 'text-white hover:text-gray-200'
                }`}
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-4 pb-10 sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-between">
        </div>

        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
          style={cardHeight ? { gridAutoRows: `${cardHeight}px` } : { gridAutoRows: '1fr' }}
        >
          {ACTIONS.map(({ key, title, description, href, icon: DefaultIcon, badge }: any, index) => {
            // クリスマスアイコンのマッピング
            const ChristmasIcons: Record<string, any> = {
              assignment: FaGift,
              schedule: BsStars,
              tasting: FaTree,
              'roast-timer': PiBellFill,
              'defect-beans': GiGingerbreadMan,
              progress: FaSnowflake,
              'drip-guide': GiCandyCanes,
              'coffee-trivia': FaStar,
              'dev-stories': FaSnowflake,
              settings: IoSettings,
            };
            const Icon = isChristmasMode ? (ChristmasIcons[key] || DefaultIcon) : DefaultIcon;

            return (
              <button
                key={key}
                onClick={() => router.push(href)}
                className={`group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 shadow-2xl transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 animate-home-card ${isChristmasMode
                  ? 'bg-white/5 backdrop-blur-xl border border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-visible:ring-[#d4af37] focus-visible:ring-offset-[#051a0e]'
                  : 'bg-white/95 text-[#1F2A44] shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-primary focus-visible:ring-offset-[#F5F2EB]'
                  }`}
                style={{
                  ...(cardHeight ? { height: `${cardHeight}px` } : {}),
                  animationDelay: `${index * 60}ms`,
                }}
                aria-label={title}
              >
                {/* バッジ表示 */}
                {badge && (
                  <div className="absolute -top-1 -right-1 z-20 animate-pulse-scale sm:-top-2 sm:-right-2">
                    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-bold text-white shadow-lg completed-label-gradient ring-2 ring-white/20 sm:px-3 sm:py-1">
                      <BsStars className="text-[10px]" />
                      {badge}
                    </span>
                  </div>
                )}
                {/* クリスマス飾りの装飾 ( corners ) */}
                {isChristmasMode && (
                  <div className="absolute top-2 right-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <FaHollyBerry className="text-[#d4af37] text-[10px]" />
                  </div>
                )}

                <span className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${isChristmasMode
                  ? 'bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 text-[#d4af37] border border-[#d4af37]/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                  : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                  }`}>
                  <Icon className="h-8 w-8 relative z-10" />
                  {isChristmasMode && (
                    <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </span>
                <div className="space-y-1 text-center relative z-10">
                  <p className={`font-bold transition-colors ${isChristmasMode
                    ? 'text-[#f8f1e7] group-hover:text-[#d4af37]'
                    : 'text-slate-900'
                    } ${title === 'ハンドピックタイマー' ? 'text-xs md:text-sm' : 'text-base md:text-lg'}`}>
                    {title}
                  </p>
                  <p className={`text-xs transition-colors ${isChristmasMode ? 'text-[#f8f1e7]/60 group-hover:text-[#f8f1e7]/90' : 'text-slate-500'
                    } md:text-sm`}>
                    {description}
                  </p>
                </div>

                {/* カード下部のゴールドライン */}
                {isChristmasMode && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

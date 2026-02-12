'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FaCoffee, FaUsers } from 'react-icons/fa';
import { IoSettings, IoSparkles } from 'react-icons/io5';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { MdCoffeeMaker, MdTimer, MdTimeline } from 'react-icons/md';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { RiBookFill, RiCalendarScheduleFill } from 'react-icons/ri';
import { Loading } from '@/components/Loading';
import { ActionCard } from '@/components/home/ActionCard';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { useAuth } from '@/lib/auth';
import { getUserData } from '@/lib/firestore';
import { needsConsent } from '@/lib/consent';
import dynamic from 'next/dynamic';

const Snowfall = dynamic(() => import('@/components/Snowfall').then(mod => ({ default: mod.Snowfall })), {
  ssr: false,
});
import { FaTree, FaGift, FaSnowflake, FaStar } from 'react-icons/fa';
import { PiBellFill } from 'react-icons/pi';
import { GiCandyCanes, GiGingerbreadMan } from 'react-icons/gi';
import { HiClock } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import { REPLAY_SPLASH_EVENT } from '@/components/SplashScreen';
import { BsStars } from 'react-icons/bs';

const SPLASH_DISPLAY_TIME = 3000; // スプラッシュ画面の表示時間 (ms)

interface Action {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: IconType;
  badge?: string;
}

/** クリスマスモード時のアイコンマッピング（モジュールレベルで定義し再生成を防止） */
const CHRISTMAS_ICONS: Record<string, IconType> = {
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

const ACTIONS: Action[] = [
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
    title: 'コーヒークイズ',
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
    title: 'その他',
    description: '設定やアプリ情報など',
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
  const [checkingConsent, setCheckingConsent] = useState(true);
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

  // 同意状態をチェック
  useEffect(() => {
    async function checkUserConsent() {
      if (!user) return;

      try {
        const userData = await getUserData(user.uid);
        if (needsConsent(userData.userConsent)) {
          // 同意が必要な場合は同意画面へリダイレクト
          router.push('/consent');
          return;
        }
      } catch (error) {
        console.error('同意状態の確認に失敗:', error);
      }

      setCheckingConsent(false);
    }

    if (!loading && user) {
      checkUserConsent();
    } else if (!loading && !user) {
      // ログインページにリダイレクトされるまでの間、ローディング状態を解除
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckingConsent(false);
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
      const paddingBottom = 8; // pb-2 = 8px
      const gridGap = 48; // 4つのgap × 12px (5行で4つのgap)

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

  // スプラッシュ表示中はLoadingを出さない
  if ((loading || checkingConsent) && !splashVisible) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`h-dvh flex flex-col overflow-hidden animate-home-page relative transition-colors duration-1000 bg-page text-ink ${isChristmasMode
      ? 'bg-[radial-gradient(circle_at_center,_#0a2f1a_0%,_#051a0e_100%)]'
      : ''
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
      <header className="shrink-0 relative z-50 shadow-2xl transition-all duration-1000 bg-header-bg">
        {/* ヘッダー下部のアクセントライン（ダーク系テーマのみ） */}
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
                  <span className="text-2xl md:text-4xl tracking-[0.08em] flex items-center leading-none font-[var(--font-playfair)] italic">
                    <span className="text-[#e23636] relative drop-shadow-[0_0_10px_rgba(226,54,54,0.3)] font-bold">
                      R
                    </span>
                    <span className="text-[#f8f1e7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">oast</span>
                    <span className="text-[#d4af37] ml-1 font-bold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">Plus</span>
                  </span>
                  <div className="w-full h-[1.5px] mt-0.5 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent shadow-[0_1px_8px_rgba(212,175,55,0.4)]"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start leading-none">
                <div className="flex items-center gap-1">
                  <span className="text-2xl md:text-3xl font-light tracking-[0.15em] text-header-text font-[var(--font-raleway)]">
                    Roast
                    <span className="text-header-accent font-bold ml-1">Plus</span>
                  </span>
                </div>
              </div>
            )}

          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.push('/clock')}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 transition-all text-header-text hover:bg-header-btn-hover"
              aria-label="デジタル時計を表示"
              title="デジタル時計"
            >
              <HiClock className="h-6 w-6" />
            </button>

            {isDeveloperMode && (
              <>
                <button
                  onClick={() => window.dispatchEvent(new Event(REPLAY_SPLASH_EVENT))}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 transition-all text-header-text hover:bg-header-btn-hover"
                  aria-label="スプラッシュ画面を再生"
                  title="スプラッシュ再生"
                >
                  <HiSparkles className="h-6 w-6" />
                </button>
                <button
                  onClick={handleShowLoadingDebugModal}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 transition-all text-header-text hover:bg-header-btn-hover"
                  aria-label="Lottieアニメーション確認モーダルを開く"
                >
                  <PiCoffeeBeanFill className="h-6 w-6" />
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-2 pb-2 sm:px-6 sm:pt-3 sm:pb-3 flex-1 min-h-0">

        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
          style={cardHeight ? { gridAutoRows: `${cardHeight}px` } : { gridAutoRows: '1fr' }}
        >
          {ACTIONS.map(({ key, title, description, href, icon: DefaultIcon, badge }, index) => {
            const Icon = isChristmasMode ? (CHRISTMAS_ICONS[key] || DefaultIcon) : DefaultIcon;

            return (
              <ActionCard
                key={key}
                title={title}
                description={description}
                href={href}
                icon={Icon}
                badge={badge}
                index={index}
                cardHeight={cardHeight}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

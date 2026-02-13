'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FaCoffee, FaUsers } from 'react-icons/fa';
import { IoSettings, IoSparkles } from 'react-icons/io5';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { MdCoffeeMaker, MdTimer, MdTimeline } from 'react-icons/md';
import { RiBookFill, RiCalendarScheduleFill } from 'react-icons/ri';
import { Loading } from '@/components/Loading';
import { ActionCard } from '@/components/home/ActionCard';
import { HomeHeader } from '@/components/home/HomeHeader';
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
import { BsStars } from 'react-icons/bs';

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
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const [checkingConsent, setCheckingConsent] = useState(true);
  const { isChristmasMode } = useChristmasMode();

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

  if (loading || checkingConsent) {
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

      {/* ヘッダー */}
      <HomeHeader />

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

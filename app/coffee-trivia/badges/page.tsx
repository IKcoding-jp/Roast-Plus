'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loading } from '@/components/Loading';
import { useQuizData } from '@/hooks/useQuizData';
import { BADGE_DEFINITIONS } from '@/lib/coffee-quiz/types';
import {
  LuArrowLeft,
  LuTrophy,
  LuFlame,
  LuCircleCheck,
  LuBookOpen,
  LuAward,
  LuTarget,
  LuCoffee,
  LuBean,
  LuLibrary,
  LuStar,
  LuSparkles,
  LuPartyPopper,
  LuSunrise,
  LuBird,
  LuZap,
  LuCircleCheckBig,
} from 'react-icons/lu';
import type { BadgeType } from '@/lib/coffee-quiz/types';

// バッジタイプに応じたLucideアイコンを返す
function getBadgeIcon(type: BadgeType, isEarned: boolean) {
  const className = isEarned ? 'text-[#EF8A00]' : 'text-[#3A2F2B]/40';
  const size = 24;

  const iconMap: Record<BadgeType, React.ReactNode> = {
    // ストリーク系
    'streak-3': <LuFlame size={size} className={className} />,
    'streak-7': <LuFlame size={size} className={className} />,
    'streak-30': <LuFlame size={size} className={className} />,
    'streak-100': <LuTrophy size={size} className={className} />,
    // 正解数系
    'correct-10': <LuCircleCheck size={size} className={className} />,
    'correct-50': <LuCircleCheck size={size} className={className} />,
    'correct-100': <LuTarget size={size} className={className} />,
    'correct-500': <LuTrophy size={size} className={className} />,
    // カテゴリマスタリー
    'master-basics': <LuCoffee size={size} className={className} />,
    'master-roasting': <LuBean size={size} className={className} />,
    'master-brewing': <LuCoffee size={size} className={className} />,
    'master-history': <LuLibrary size={size} className={className} />,
    // パーフェクト
    'perfect-session': <LuStar size={size} className={className} />,
    'perfect-week': <LuSparkles size={size} className={className} />,
    // その他
    'first-quiz': <LuPartyPopper size={size} className={className} />,
    'early-bird': <LuSunrise size={size} className={className} />,
    'night-owl': <LuBird size={size} className={className} />,
    'speed-demon': <LuZap size={size} className={className} />,
  };

  return iconMap[type] || <LuCircleCheckBig size={size} className={className} />;
}

export default function BadgesPage() {
  const { progress, loading: quizLoading } = useQuizData();

  if (quizLoading) {
    return <Loading />;
  }

  const earnedBadgeTypes = new Set(progress?.earnedBadges.map((b) => b.type) || []);
  const earnedCount = earnedBadgeTypes.size;
  const totalCount = BADGE_DEFINITIONS.length;

  // バッジをカテゴリ別にグループ化
  const badgeGroups = {
    streak: BADGE_DEFINITIONS.filter((b) => b.type.startsWith('streak-')),
    correct: BADGE_DEFINITIONS.filter((b) => b.type.startsWith('correct-')),
    master: BADGE_DEFINITIONS.filter((b) => b.type.startsWith('master-')),
    achievement: BADGE_DEFINITIONS.filter(
      (b) =>
        !b.type.startsWith('streak-') &&
        !b.type.startsWith('correct-') &&
        !b.type.startsWith('master-')
    ),
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0]">
      <header className="flex-none px-4 py-3 flex items-center bg-white border-b border-[#211714]/5">
        <Link
          href="/coffee-trivia"
          className="p-2 -ml-2 text-[#3A2F2B] hover:text-[#EF8A00] hover:bg-[#FDF8F0] rounded-full transition-colors"
        >
          <LuArrowLeft size={24} />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-[#211714] flex items-center gap-2">
          <LuTrophy size={20} />
          バッジコレクション
        </h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg space-y-5">
        {/* 進捗サマリー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#EF8A00] via-[#D67A00] to-[#EF8A00] rounded-2xl p-6 text-white text-center shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-2 flex justify-center text-white/90"
          >
            <LuTrophy size={48} strokeWidth={1.5} />
          </motion.div>
          <div className="text-3xl font-bold mb-1">
            {earnedCount} / {totalCount}
          </div>
          <p className="text-white/80 text-sm">バッジを獲得しました</p>

          {/* プログレスバー */}
          <div className="mt-4 h-2.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* ストリーク系バッジ */}
        <BadgeSection
          title="ストリーク"
          icon={<LuFlame size={18} />}
          badges={badgeGroups.streak}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.1}
        />

        {/* 正解数系バッジ */}
        <BadgeSection
          title="正解数"
          icon={<LuCircleCheck size={18} />}
          badges={badgeGroups.correct}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.2}
        />

        {/* マスタリー系バッジ */}
        <BadgeSection
          title="カテゴリマスター"
          icon={<LuBookOpen size={18} />}
          badges={badgeGroups.master}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.3}
        />

        {/* その他のバッジ */}
        <BadgeSection
          title="アチーブメント"
          icon={<LuAward size={18} />}
          badges={badgeGroups.achievement}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.4}
        />
      </main>
    </div>
  );
}

interface BadgeSectionProps {
  title: string;
  icon: React.ReactNode;
  badges: typeof BADGE_DEFINITIONS;
  earnedBadges: { type: BadgeType; earnedAt: string }[];
  formatDate: (date: string) => string;
  delay: number;
}

function BadgeSection({
  title,
  icon,
  badges,
  earnedBadges,
  formatDate,
  delay,
}: BadgeSectionProps) {
  const earnedMap = new Map(earnedBadges.map((b) => [b.type, b.earnedAt]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-lg p-5 border border-[#211714]/5"
    >
      <h2 className="font-bold text-[#211714] mb-4 flex items-center gap-2">
        <span className="text-[#EF8A00]">{icon}</span>
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => {
          const earnedAt = earnedMap.get(badge.type);
          const isEarned = !!earnedAt;

          return (
            <motion.div
              key={badge.type}
              whileHover={isEarned ? { scale: 1.02 } : {}}
              className={`rounded-xl p-4 transition-all ${
                isEarned
                  ? 'bg-[#FDF8F0] border border-[#EF8A00]/20'
                  : 'bg-[#211714]/5 border border-[#211714]/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex-shrink-0">
                  {getBadgeIcon(badge.type, isEarned)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold text-sm truncate ${
                      isEarned ? 'text-[#211714]' : 'text-[#3A2F2B]/50'
                    }`}
                  >
                    {badge.name}
                  </h3>
                </div>
              </div>
              <p
                className={`text-xs mb-2 ${
                  isEarned ? 'text-[#3A2F2B]/70' : 'text-[#3A2F2B]/40'
                }`}
              >
                {badge.description}
              </p>
              {isEarned && earnedAt ? (
                <p className="text-xs text-[#EF8A00] font-medium">
                  獲得: {formatDate(earnedAt)}
                </p>
              ) : (
                <p className="text-xs text-[#3A2F2B]/40">{badge.requirement}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

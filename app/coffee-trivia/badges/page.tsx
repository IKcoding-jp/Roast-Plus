'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import LoginPage from '@/app/login/page';
import { useQuizData } from '@/hooks/useQuizData';
import { BADGE_DEFINITIONS } from '@/lib/coffee-quiz/types';
import type { BadgeType } from '@/lib/coffee-quiz/types';

// アイコン
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const TrophyLargeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const FlameIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const AwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

export default function BadgesPage() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: quizLoading } = useQuizData();

  if (authLoading || quizLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
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
          <ArrowLeftIcon />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-[#211714] flex items-center gap-2">
          <TrophyIcon />
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
            <TrophyLargeIcon />
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
          icon={<FlameIcon />}
          badges={badgeGroups.streak}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.1}
        />

        {/* 正解数系バッジ */}
        <BadgeSection
          title="正解数"
          icon={<CheckCircleIcon />}
          badges={badgeGroups.correct}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.2}
        />

        {/* マスタリー系バッジ */}
        <BadgeSection
          title="カテゴリマスター"
          icon={<BookOpenIcon />}
          badges={badgeGroups.master}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.3}
        />

        {/* その他のバッジ */}
        <BadgeSection
          title="アチーブメント"
          icon={<AwardIcon />}
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
                <span
                  className={`text-2xl ${
                    isEarned ? '' : 'grayscale opacity-50'
                  }`}
                >
                  {badge.icon}
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

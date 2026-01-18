'use client';

import { motion } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import LoginPage from '@/app/login/page';
import { useQuizData } from '@/hooks/useQuizData';
import { BADGE_DEFINITIONS } from '@/lib/coffee-quiz/types';
import type { BadgeType } from '@/lib/coffee-quiz/types';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      <header className="flex-none px-4 py-3 flex items-center bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <Link
          href="/coffee-trivia"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>🏆</span>
          バッジコレクション
        </h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg space-y-6">
        {/* 進捗サマリー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-5xl mb-2"
          >
            🏆
          </motion.div>
          <div className="text-3xl font-bold mb-1">
            {earnedCount} / {totalCount}
          </div>
          <p className="text-white/80">バッジを獲得しました</p>

          {/* プログレスバー */}
          <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
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
          title="🔥 ストリーク"
          badges={badgeGroups.streak}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.1}
        />

        {/* 正解数系バッジ */}
        <BadgeSection
          title="✅ 正解数"
          badges={badgeGroups.correct}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.2}
        />

        {/* マスタリー系バッジ */}
        <BadgeSection
          title="📚 カテゴリマスター"
          badges={badgeGroups.master}
          earnedBadges={progress?.earnedBadges || []}
          formatDate={formatDate}
          delay={0.3}
        />

        {/* その他のバッジ */}
        <BadgeSection
          title="⭐ アチーブメント"
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
  badges: typeof BADGE_DEFINITIONS;
  earnedBadges: { type: BadgeType; earnedAt: string }[];
  formatDate: (date: string) => string;
  delay: number;
}

function BadgeSection({
  title,
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
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="font-bold text-gray-800 mb-4">{title}</h2>
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
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gray-50 border border-gray-100 opacity-60'
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
                      isEarned ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {badge.name}
                  </h3>
                </div>
              </div>
              <p
                className={`text-xs mb-2 ${
                  isEarned ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {badge.description}
              </p>
              {isEarned && earnedAt ? (
                <p className="text-xs text-amber-600">
                  獲得: {formatDate(earnedAt)}
                </p>
              ) : (
                <p className="text-xs text-gray-400">{badge.requirement}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

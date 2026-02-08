'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { StreakCounter } from './StreakCounter';
import { DailyGoalProgress } from './DailyGoalProgress';
import { CategorySelector } from './CategorySelector';
import { LevelDisplay } from './LevelDisplay';
import type { QuizProgress, QuizCategory, QuizDifficulty } from '@/lib/coffee-quiz/types';
import { getDebugTodayDateString, isDebugMode } from '@/lib/coffee-quiz/debug';

// 問題の統計情報の型
interface QuestionsStats {
  total: number;
  byCategory: Record<QuizCategory, number>;
  byDifficulty: Record<QuizDifficulty, number>;
}

interface QuizDashboardProps {
  progress: QuizProgress | null;
  dueCardsCount: number;
  loading: boolean;
  questionsStats: QuestionsStats | null;
  categoryMasteryStats?: Record<QuizCategory, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }>; // カテゴリ別定着統計
}

// シンプルなSVGアイコン
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
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

export function QuizDashboard({
  progress,
  dueCardsCount,
  loading,
  questionsStats,
  categoryMasteryStats,
}: QuizDashboardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-spot/20 border-t-spot animate-spin" />
      </div>
    );
  }

  // カテゴリ統計: 総問題数と正解済み問題数
  const categoryStats = questionsStats
    ? {
        basics: {
          total: questionsStats.byCategory.basics,
          answeredCorrectlyCount: categoryMasteryStats?.basics?.answeredCorrectlyCount ?? 0,
        },
        roasting: {
          total: questionsStats.byCategory.roasting,
          answeredCorrectlyCount: categoryMasteryStats?.roasting?.answeredCorrectlyCount ?? 0,
        },
        brewing: {
          total: questionsStats.byCategory.brewing,
          answeredCorrectlyCount: categoryMasteryStats?.brewing?.answeredCorrectlyCount ?? 0,
        },
        history: {
          total: questionsStats.byCategory.history,
          answeredCorrectlyCount: categoryMasteryStats?.history?.answeredCorrectlyCount ?? 0,
        },
      }
    : undefined;

  return (
    <div className="space-y-5">
      {/* レベル & ストリーク */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3"
      >
        {progress && <LevelDisplay level={progress.level} compact />}
        {progress && <StreakCounter streak={progress.streak} compact />}
      </motion.div>

      {/* デイリーゴール */}
      {progress && (
        <DailyGoalProgress
          goal={
            progress.dailyGoals.find(
              (g) => g.date === (isDebugMode() ? getDebugTodayDateString() : new Date().toISOString().split('T')[0])
            ) || null
          }
          targetQuestions={progress.settings.dailyGoal}
        />
      )}

      {/* クイズ開始ボタン */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2.5"
      >
        <Link
          href="/coffee-trivia/quiz"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-5 rounded-xl font-semibold text-white bg-spot hover:bg-spot-hover active:scale-[0.98] transition-all"
        >
          <PlayIcon />
          今日のクイズを始める
        </Link>


        {dueCardsCount > 0 ? (
          <Link
            href="/coffee-trivia/review"
            className="group flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl font-medium text-ink-sub bg-edge-subtle hover:bg-edge transition-colors"
          >
            <span className="group-hover:rotate-180 transition-transform duration-300">
              <RefreshIcon />
            </span>
            復習する ({dueCardsCount}問)
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl font-medium text-ink-muted bg-edge-subtle">
            <RefreshIcon />
            復習する問題はありません
          </div>
        )}
      </motion.div>

      {/* カテゴリ別問題一覧 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface rounded-xl p-4 border border-edge"
      >
        <h3 className="font-semibold text-ink text-sm mb-3">
          カテゴリ別学習
        </h3>
        <CategorySelector
          stats={categoryStats}
        />
      </motion.div>

      {/* クイック統計 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link
          href="/coffee-trivia/stats"
          className="group flex items-center gap-3 bg-surface rounded-xl p-3.5 border border-edge hover:border-edge-strong hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-edge-subtle group-hover:bg-edge flex items-center justify-center transition-colors text-ink-sub">
            <ChartIcon />
          </div>
          <div>
            <span className="font-medium text-ink text-sm block">統計</span>
            <span className="text-xs text-ink-muted">
              正解率 {progress?.stats.averageAccuracy ?? 0}%
            </span>
          </div>
        </Link>

        <Link
          href="/coffee-trivia/badges"
          className="group flex items-center gap-3 bg-surface rounded-xl p-3.5 border border-edge hover:border-spot/20 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-spot-subtle group-hover:bg-spot/15 flex items-center justify-center transition-colors text-spot">
            <TrophyIcon />
          </div>
          <div>
            <span className="font-medium text-ink text-sm block">バッジ</span>
            <span className="text-xs text-ink-muted">
              {progress?.earnedBadges.length ?? 0}個獲得
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

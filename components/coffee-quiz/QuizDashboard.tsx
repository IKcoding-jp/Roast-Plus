'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { StreakCounter } from './StreakCounter';
import { DailyGoalProgress } from './DailyGoalProgress';
import { CategorySelector } from './CategorySelector';
import { LevelDisplay } from './LevelDisplay';
import type { QuizProgress, QuizCategory, QuizDifficulty } from '@/lib/coffee-quiz/types';
import { useState } from 'react';

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
}: QuizDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#EF8A00]/20 border-t-[#EF8A00] animate-spin" />
      </div>
    );
  }

  // カテゴリ統計: マスター済み数 / JSONの総問題数
  const categoryStats = questionsStats
    ? {
        basics: {
          total: questionsStats.byCategory.basics,
          mastered: progress?.stats.categoryStats.basics.masteredCount ?? 0,
        },
        roasting: {
          total: questionsStats.byCategory.roasting,
          mastered: progress?.stats.categoryStats.roasting.masteredCount ?? 0,
        },
        brewing: {
          total: questionsStats.byCategory.brewing,
          mastered: progress?.stats.categoryStats.brewing.masteredCount ?? 0,
        },
        history: {
          total: questionsStats.byCategory.history,
          mastered: progress?.stats.categoryStats.history.masteredCount ?? 0,
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
              (g) => g.date === new Date().toISOString().split('T')[0]
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
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-5 rounded-xl font-semibold text-white bg-[#EF8A00] hover:bg-[#D67A00] active:scale-[0.98] transition-all"
        >
          <PlayIcon />
          今日のクイズを始める
        </Link>

        {dueCardsCount > 0 ? (
          <Link
            href="/coffee-trivia/review"
            className="group flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl font-medium text-[#3A2F2B] bg-[#211714]/5 hover:bg-[#211714]/10 transition-colors"
          >
            <span className="group-hover:rotate-180 transition-transform duration-300">
              <RefreshIcon />
            </span>
            復習する ({dueCardsCount}問)
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl font-medium text-[#3A2F2B]/50 bg-[#211714]/5">
            <RefreshIcon />
            復習する問題はありません
          </div>
        )}
      </motion.div>

      {/* カテゴリ選択 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl p-4 border border-[#211714]/5"
      >
        <h3 className="font-semibold text-[#211714] text-sm mb-3">
          カテゴリ別学習
        </h3>
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          stats={categoryStats}
        />

        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-[#211714]/5"
          >
            <Link
              href={`/coffee-trivia/quiz?category=${selectedCategory}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium text-sm text-white bg-[#211714] hover:bg-[#3A2F2B] transition-colors"
            >
              <PlayIcon />
              {selectedCategory === 'basics' && '基礎知識'}
              {selectedCategory === 'roasting' && '焙煎理論'}
              {selectedCategory === 'brewing' && '抽出理論'}
              {selectedCategory === 'history' && '歴史と文化'}
              のクイズを始める
            </Link>
          </motion.div>
        )}
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
          className="group flex items-center gap-3 bg-white rounded-xl p-3.5 border border-[#211714]/5 hover:border-[#211714]/10 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FDF8F0] group-hover:bg-[#211714]/5 flex items-center justify-center transition-colors text-[#3A2F2B]">
            <ChartIcon />
          </div>
          <div>
            <span className="font-medium text-[#211714] text-sm block">統計</span>
            <span className="text-xs text-[#3A2F2B]/60">
              正解率 {progress?.stats.averageAccuracy ?? 0}%
            </span>
          </div>
        </Link>

        <Link
          href="/coffee-trivia/badges"
          className="group flex items-center gap-3 bg-white rounded-xl p-3.5 border border-[#211714]/5 hover:border-[#EF8A00]/20 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FDF8F0] group-hover:bg-[#EF8A00]/10 flex items-center justify-center transition-colors text-[#EF8A00]">
            <TrophyIcon />
          </div>
          <div>
            <span className="font-medium text-[#211714] text-sm block">バッジ</span>
            <span className="text-xs text-[#3A2F2B]/60">
              {progress?.earnedBadges.length ?? 0}個獲得
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

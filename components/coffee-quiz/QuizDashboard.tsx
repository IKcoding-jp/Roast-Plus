'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiPlay, HiRefresh, HiChartBar, HiStar } from 'react-icons/hi';
import { StreakCounter } from './StreakCounter';
import { DailyGoalProgress } from './DailyGoalProgress';
import { CategorySelector } from './CategorySelector';
import { LevelDisplay } from './LevelDisplay';
import type { QuizProgress, QuizCategory } from '@/lib/coffee-quiz/types';
import { useState } from 'react';

interface QuizDashboardProps {
  progress: QuizProgress | null;
  dueCardsCount: number;
  loading: boolean;
}

export function QuizDashboard({
  progress,
  dueCardsCount,
  loading,
}: QuizDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-3 border-[#EF8A00]/20 border-t-[#EF8A00]"
        />
      </div>
    );
  }

  // カテゴリ統計を計算
  const categoryStats = progress
    ? {
        basics: {
          total: progress.stats.categoryStats.basics.total,
          mastered: progress.stats.categoryStats.basics.masteredCount,
        },
        roasting: {
          total: progress.stats.categoryStats.roasting.total,
          mastered: progress.stats.categoryStats.roasting.masteredCount,
        },
        brewing: {
          total: progress.stats.categoryStats.brewing.total,
          mastered: progress.stats.categoryStats.brewing.masteredCount,
        },
        history: {
          total: progress.stats.categoryStats.history.total,
          mastered: progress.stats.categoryStats.history.masteredCount,
        },
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* レベル & ストリーク */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4"
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

      {/* クイズ開始ボタン - プレミアムデザイン */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Link
          href="/coffee-trivia/quiz"
          className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-[0_8px_24px_rgba(239,138,0,0.3)] transition-all active:scale-[0.98] overflow-hidden"
        >
          {/* グラデーション背景 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EF8A00] via-[#FF9A1A] to-[#D67A00] group-hover:from-[#D67A00] group-hover:via-[#EF8A00] group-hover:to-[#FF9A1A] transition-all duration-500" />

          {/* シャイン効果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          {/* コンテンツ */}
          <span className="relative z-10 flex items-center gap-3 text-white">
            <HiPlay className="w-6 h-6" />
            今日のクイズを始める
          </span>
        </Link>

        {/* 復習モード */}
        {dueCardsCount > 0 && (
          <Link
            href="/coffee-trivia/review"
            className="group flex items-center justify-center gap-3 w-full bg-white border-2 border-[#EF8A00]/30 text-[#EF8A00] py-3 px-6 rounded-xl font-bold hover:bg-[#FDF8F0] hover:border-[#EF8A00] hover:shadow-md transition-all"
          >
            <HiRefresh className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            復習する ({dueCardsCount}問)
          </Link>
        )}
      </motion.div>

      {/* カテゴリ選択 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-[#211714]/5 shadow-sm"
      >
        <h3 className="font-bold text-[#211714] mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#EF8A00]/10 flex items-center justify-center">
            <span className="text-lg">📖</span>
          </span>
          カテゴリ別学習
        </h3>
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          stats={categoryStats}
        />

        {/* カテゴリ選択時のボタン */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <Link
              href={`/coffee-trivia/quiz?category=${selectedCategory}`}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#211714] to-[#3A2F2B] text-white py-3 px-6 rounded-xl font-bold hover:from-[#3A2F2B] hover:to-[#211714] transition-all shadow-md"
            >
              <HiPlay className="w-5 h-5" />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link
          href="/coffee-trivia/stats"
          className="group flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-[#211714]/5 hover:border-[#EF8A00]/30 hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <HiChartBar className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#211714] block">統計</span>
            <span className="text-xs text-[#3A2F2B]/70">
              正解率 {progress?.stats.averageAccuracy ?? 0}%
            </span>
          </div>
        </Link>

        <Link
          href="/coffee-trivia/badges"
          className="group flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-[#211714]/5 hover:border-[#d4af37]/30 hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8960c] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <HiStar className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#211714] block">バッジ</span>
            <span className="text-xs text-[#3A2F2B]/70">
              {progress?.earnedBadges.length ?? 0}個獲得
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

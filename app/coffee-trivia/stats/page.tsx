'use client';

import { motion } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import LoginPage from '@/app/login/page';
import { useQuizData } from '@/hooks/useQuizData';
import { LevelDisplay } from '@/components/coffee-quiz/LevelDisplay';
import { StreakCounter } from '@/components/coffee-quiz/StreakCounter';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/coffee-quiz/types';
import type { QuizCategory, QuizDifficulty } from '@/lib/coffee-quiz/types';

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: quizLoading } = useQuizData();

  if (authLoading || quizLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const stats = progress?.stats;

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
          <span>📊</span>
          統計
        </h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg space-y-6">
        {progress && (
          <>
            {/* レベル & ストリーク */}
            <div className="grid grid-cols-1 gap-4">
              <LevelDisplay level={progress.level} />
              <StreakCounter streak={progress.streak} />
            </div>

            {/* 全体統計 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📈</span>
                全体統計
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <span className="text-3xl font-bold text-gray-800">
                    {stats?.totalQuestions ?? 0}
                  </span>
                  <p className="text-gray-500 text-sm mt-1">総回答数</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <span className="text-3xl font-bold text-amber-600">
                    {stats?.averageAccuracy ?? 0}%
                  </span>
                  <p className="text-gray-500 text-sm mt-1">平均正解率</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <span className="text-2xl font-bold text-green-600">
                    {stats?.totalCorrect ?? 0}
                  </span>
                  <p className="text-green-600 text-sm mt-1">正解</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <span className="text-2xl font-bold text-red-500">
                    {stats?.totalIncorrect ?? 0}
                  </span>
                  <p className="text-red-500 text-sm mt-1">不正解</p>
                </div>
              </div>
            </motion.div>

            {/* カテゴリ別統計 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📖</span>
                カテゴリ別
              </h2>

              <div className="space-y-4">
                {(['basics', 'roasting', 'brewing', 'history'] as QuizCategory[]).map(
                  (category) => {
                    const catStats = stats?.categoryStats[category];
                    const accuracy = catStats?.accuracy ?? 0;

                    return (
                      <div key={category} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">
                            {CATEGORY_LABELS[category]}
                          </span>
                          <span className="text-amber-600 font-bold">{accuracy}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${accuracy}%` }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            {catStats?.correct ?? 0}/{catStats?.total ?? 0}問正解
                          </span>
                          <span>{catStats?.masteredCount ?? 0}問マスター</span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </motion.div>

            {/* 難易度別統計 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                難易度別
              </h2>

              <div className="space-y-3">
                {(['beginner', 'intermediate', 'advanced'] as QuizDifficulty[]).map(
                  (difficulty) => {
                    const diffStats = stats?.difficultyStats[difficulty];
                    const accuracy = diffStats?.accuracy ?? 0;

                    return (
                      <div
                        key={difficulty}
                        className="flex items-center gap-4 bg-gray-50 rounded-xl p-3"
                      >
                        <span className="font-medium text-gray-600 w-16">
                          {DIFFICULTY_LABELS[difficulty]}
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              difficulty === 'beginner'
                                ? 'bg-green-400'
                                : difficulty === 'intermediate'
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${accuracy}%` }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          />
                        </div>
                        <span className="font-bold text-gray-700 w-12 text-right">
                          {accuracy}%
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

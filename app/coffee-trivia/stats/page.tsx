'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import LoginPage from '@/app/login/page';
import { useQuizData } from '@/hooks/useQuizData';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { LevelDisplay } from '@/components/coffee-quiz/LevelDisplay';
import { StreakCounter } from '@/components/coffee-quiz/StreakCounter';
import { ResetConfirmDialog } from '@/components/coffee-quiz/ResetConfirmDialog';
import { DebugPanel } from '@/components/coffee-quiz/DebugPanel';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/coffee-quiz/types';
import type { QuizCategory, QuizDifficulty } from '@/lib/coffee-quiz/types';

// アイコン
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ChartBarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: quizLoading, questionsStats, difficultyMasteryStats, resetProgress } = useQuizData();
  const { isEnabled: isDeveloperMode } = useDeveloperMode();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetProgress();
      setShowResetDialog(false);
    } catch (error) {
      console.error('Failed to reset progress:', error);
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading || quizLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const stats = progress?.stats;

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
          <ChartBarIcon />
          統計
        </h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg space-y-5">
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
              className="bg-white rounded-2xl shadow-lg p-5 border border-[#211714]/5"
            >
              <h2 className="font-bold text-[#211714] mb-4 flex items-center gap-2">
                <span className="text-[#EF8A00]">
                  <TrendingUpIcon />
                </span>
                全体統計
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#FDF8F0] rounded-xl p-4 text-center border border-[#211714]/5">
                  <span className="text-3xl font-bold text-[#211714]">
                    {stats?.totalQuestions ?? 0}
                  </span>
                  <p className="text-[#3A2F2B]/60 text-sm mt-1">総回答数</p>
                </div>
                <div className="bg-[#FDF8F0] rounded-xl p-4 text-center border border-[#EF8A00]/20">
                  <span className="text-3xl font-bold text-[#EF8A00]">
                    {stats?.averageAccuracy ?? 0}%
                  </span>
                  <p className="text-[#EF8A00]/70 text-sm mt-1">平均正解率</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                  <span className="text-2xl font-bold text-emerald-600">
                    {stats?.totalCorrect ?? 0}
                  </span>
                  <p className="text-emerald-600/70 text-sm mt-1">正解</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                  <span className="text-2xl font-bold text-rose-500">
                    {stats?.totalIncorrect ?? 0}
                  </span>
                  <p className="text-rose-500/70 text-sm mt-1">不正解</p>
                </div>
              </div>
            </motion.div>

            {/* カテゴリ別統計 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-5 border border-[#211714]/5"
            >
              <h2 className="font-bold text-[#211714] mb-4 flex items-center gap-2">
                <span className="text-[#EF8A00]">
                  <BookOpenIcon />
                </span>
                カテゴリ別
              </h2>

              <div className="space-y-3">
                {(['basics', 'roasting', 'brewing', 'history'] as QuizCategory[]).map(
                  (category) => {
                    const catStats = stats?.categoryStats[category];
                    const totalQuestions = questionsStats?.byCategory[category] ?? 0;
                    const masteredCount = catStats?.masteredCount ?? 0;
                    // マスター進捗率を計算
                    const masteryProgress = totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0;

                    return (
                      <div key={category} className="bg-[#FDF8F0] rounded-xl p-4 border border-[#211714]/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#211714]">
                            {CATEGORY_LABELS[category]}
                          </span>
                          <span className="text-[#EF8A00] font-bold">{masteryProgress}%</span>
                        </div>
                        <div className="h-2 bg-[#211714]/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#EF8A00] to-[#D67A00] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${masteryProgress}%` }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-[#3A2F2B]/60">
                          <span>
                            マスター: {masteredCount}/{totalQuestions}問
                          </span>
                          <span>
                            正解率: {catStats?.accuracy ?? 0}%（{catStats?.correct ?? 0}/{catStats?.total ?? 0}回答）
                          </span>
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
              className="bg-white rounded-2xl shadow-lg p-5 border border-[#211714]/5"
            >
              <h2 className="font-bold text-[#211714] mb-4 flex items-center gap-2">
                <span className="text-[#EF8A00]">
                  <TargetIcon />
                </span>
                難易度別
              </h2>

              <div className="space-y-3">
                {(['beginner', 'intermediate', 'advanced'] as QuizDifficulty[]).map(
                  (difficulty, index) => {
                    const masteryPercent = difficultyMasteryStats?.[difficulty] ?? 0;
                    const totalQuestions = questionsStats?.byDifficulty[difficulty] ?? 0;

                    return (
                      <div
                        key={difficulty}
                        className="bg-[#FDF8F0] rounded-xl p-4 border border-[#211714]/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#211714]">
                            {DIFFICULTY_LABELS[difficulty]}
                          </span>
                          <span className={`font-bold ${
                            difficulty === 'beginner'
                              ? 'text-emerald-600'
                              : difficulty === 'intermediate'
                              ? 'text-[#EF8A00]'
                              : 'text-rose-600'
                          }`}>{masteryPercent}%</span>
                        </div>
                        <div className="h-2 bg-[#211714]/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              difficulty === 'beginner'
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : difficulty === 'intermediate'
                                ? 'bg-gradient-to-r from-[#EF8A00] to-[#D67A00]'
                                : 'bg-gradient-to-r from-rose-500 to-rose-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${masteryPercent}%` }}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                          />
                        </div>
                        <div className="text-xs text-[#3A2F2B]/60 mt-2">
                          定着率（{totalQuestions}問）
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </motion.div>

            {/* データリセット */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-5 border border-rose-100"
            >
              <h2 className="font-bold text-[#211714] mb-3 flex items-center gap-2">
                <span className="text-rose-500">
                  <TrashIcon />
                </span>
                データ管理
              </h2>

              <p className="text-[#3A2F2B]/70 text-sm mb-4">
                学習データをリセットして、最初からやり直すことができます。
              </p>

              <button
                onClick={() => setShowResetDialog(true)}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-3 px-4 rounded-xl font-semibold transition-colors border border-rose-200 flex items-center justify-center gap-2"
              >
                <TrashIcon />
                データをリセット
              </button>
            </motion.div>

            {/* デバッグパネル（開発者モード時のみ表示） */}
            {isDeveloperMode && <DebugPanel />}
          </>
        )}
      </main>

      {/* リセット確認ダイアログ */}
      <ResetConfirmDialog
        show={showResetDialog}
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
        isLoading={isResetting}
      />
    </div>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import { QuizCard } from '@/components/coffee-quiz/QuizCard';
import { QuizResult } from '@/components/coffee-quiz/QuizResult';
import { XPGainAnimation } from '@/components/coffee-quiz/XPGainAnimation';
import { LevelUpModal } from '@/components/coffee-quiz/LevelUpModal';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizData } from '@/hooks/useQuizData';
import type { QuizCategory } from '@/lib/coffee-quiz/types';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') as QuizCategory | null;
  const modeParam = searchParams.get('mode') || 'daily';

  const { isAuthenticated, loading: authLoading } = useQuizData();

  const {
    session,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isLoading,
    isComplete,
    sessionStats,
    answerFeedback,
    showFeedback,
    startSession,
    submitAnswer,
    nextQuestion,
    resetSession,
  } = useQuizSession({
    mode: categoryParam ? 'category' : modeParam as 'daily' | 'review' | 'random',
    category: categoryParam || undefined,
    count: 10,
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  // セッション開始
  useEffect(() => {
    if (isAuthenticated && !session && !isLoading) {
      startSession();
    }
  }, [isAuthenticated, session, isLoading, startSession]);

  // 回答送信
  const handleSelectOption = async (optionId: string) => {
    if (showFeedback || !currentQuestion) return;

    setSelectedOptionId(optionId);
    await submitAnswer(optionId);
  };

  // フィードバック表示時のエフェクト
  useEffect(() => {
    if (answerFeedback) {
      // XPアニメーション
      if (answerFeedback.xpEarned > 0) {
        setShowXPAnimation(true);
      }

      // レベルアップモーダル
      if (answerFeedback.leveledUp && answerFeedback.newLevel) {
        setTimeout(() => {
          setNewLevel(answerFeedback.newLevel!);
          setShowLevelUp(true);
        }, 800);
      }
    }
  }, [answerFeedback]);

  // 次の問題へ
  const handleNext = () => {
    setSelectedOptionId(null);
    setShowXPAnimation(false);
    nextQuestion();
  };

  // リトライ
  const handleRetry = () => {
    resetSession();
    startSession();
  };

  // 認証チェック
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-sm">
          <span className="text-4xl mb-4 block">🔐</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ログインが必要です</h2>
          <p className="text-gray-600 text-sm mb-4">
            クイズに挑戦するにはログインしてください
          </p>
          <Link
            href="/login"
            className="inline-block bg-amber-500 text-white py-2 px-6 rounded-xl font-bold hover:bg-amber-600 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  // ローディング
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-amber-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link
            href="/coffee-trivia"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <h1 className="font-bold text-gray-800">
            {categoryParam ? `${categoryParam}クイズ` : 'デイリークイズ'}
          </h1>
          <div className="w-16" /> {/* スペーサー */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <QuizResult
              correct={sessionStats.correct}
              incorrect={sessionStats.incorrect}
              totalXP={sessionStats.totalXP}
              accuracy={sessionStats.accuracy}
              onRetry={handleRetry}
            />
          ) : currentQuestion ? (
            <>
              <QuizCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                selectedOptionId={selectedOptionId}
                correctOptionId={showFeedback ? answerFeedback?.correctOptionId ?? null : null}
                showFeedback={showFeedback}
                onSelectOption={handleSelectOption}
              />

              {/* 次へボタン */}
              {showFeedback && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNext}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-500 text-white py-4 px-6 rounded-xl font-bold hover:bg-amber-600 transition-colors"
                >
                  {currentIndex + 1 >= totalQuestions ? (
                    '結果を見る'
                  ) : (
                    <>
                      次の問題へ
                      <HiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-600">問題がありません</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* XPアニメーション */}
      <XPGainAnimation
        xp={answerFeedback?.xpEarned ?? 0}
        show={showXPAnimation}
        onComplete={() => setShowXPAnimation(false)}
      />

      {/* レベルアップモーダル */}
      <LevelUpModal
        show={showLevelUp}
        newLevel={newLevel}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}

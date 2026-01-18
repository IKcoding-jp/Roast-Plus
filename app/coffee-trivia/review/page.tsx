'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import { QuizCard } from '@/components/coffee-quiz/QuizCard';
import { QuizResult } from '@/components/coffee-quiz/QuizResult';
import { XPGainAnimation } from '@/components/coffee-quiz/XPGainAnimation';
import { LevelUpModal } from '@/components/coffee-quiz/LevelUpModal';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizData } from '@/hooks/useQuizData';

export default function ReviewPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, getDueCardsForReview } = useQuizData();

  const dueCardsCount = getDueCardsForReview().length;

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
    mode: 'review',
    count: Math.min(dueCardsCount, 10),
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  // 復習する問題がない場合はリダイレクト
  useEffect(() => {
    if (!authLoading && isAuthenticated && dueCardsCount === 0 && !session) {
      router.push('/coffee-trivia');
    }
  }, [authLoading, isAuthenticated, dueCardsCount, session, router]);

  // セッション開始
  useEffect(() => {
    if (isAuthenticated && !session && !isLoading && dueCardsCount > 0) {
      startSession();
    }
  }, [isAuthenticated, session, isLoading, dueCardsCount, startSession]);

  // 回答送信
  const handleSelectOption = async (optionId: string) => {
    if (showFeedback || !currentQuestion) return;

    setSelectedOptionId(optionId);
    await submitAnswer(optionId);
  };

  // フィードバック表示時のエフェクト
  useEffect(() => {
    if (answerFeedback) {
      if (answerFeedback.xpEarned > 0) {
        setShowXPAnimation(true);
      }

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
          <p className="text-gray-600">復習問題を準備中...</p>
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
          <h1 className="font-bold text-gray-800 flex items-center gap-2">
            <span>🔄</span>
            復習モード
          </h1>
          <div className="w-16" />
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
              <span className="text-4xl mb-4 block">✅</span>
              <p className="text-gray-600">復習する問題はありません</p>
              <Link
                href="/coffee-trivia"
                className="inline-block mt-4 bg-amber-500 text-white py-2 px-6 rounded-xl font-bold hover:bg-amber-600 transition-colors"
              >
                ダッシュボードへ戻る
              </Link>
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

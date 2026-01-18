'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { QuizCard } from '@/components/coffee-quiz/QuizCard';
import { QuizResult } from '@/components/coffee-quiz/QuizResult';
import { XPGainAnimation } from '@/components/coffee-quiz/XPGainAnimation';
import { LevelUpModal } from '@/components/coffee-quiz/LevelUpModal';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizData } from '@/hooks/useQuizData';
import { useQuizSound } from '@/hooks/useQuizSound';

// アイコン
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function ReviewPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, getDueCardsForReview, progress } = useQuizData();

  const dueCardsCount = getDueCardsForReview().length;

  // 効果音フック
  const {
    initialize: initializeSound,
    playCorrect,
    playIncorrect,
    playLevelUp: playLevelUpSound,
    playXP,
    playStart,
    playComplete,
  } = useQuizSound({
    soundEnabled: progress?.settings.soundEnabled ?? true,
    vibrationEnabled: progress?.settings.vibrationEnabled ?? true,
  });

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
  const hasPlayedStartSound = useRef(false);

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

  // セッション開始音
  useEffect(() => {
    if (session && !hasPlayedStartSound.current) {
      initializeSound();
      playStart();
      hasPlayedStartSound.current = true;
    }
  }, [session, initializeSound, playStart]);

  // 回答送信
  const handleSelectOption = async (optionId: string) => {
    if (showFeedback || !currentQuestion) return;

    setSelectedOptionId(optionId);
    await submitAnswer(optionId);
  };

  // フィードバック表示時のエフェクト
  useEffect(() => {
    if (answerFeedback) {
      // 正解・不正解音
      if (answerFeedback.isCorrect) {
        playCorrect();
      } else {
        playIncorrect();
      }

      if (answerFeedback.xpEarned > 0) {
        setShowXPAnimation(true);
        // XP音は少し遅らせる
        setTimeout(() => playXP(), 200);
      }

      if (answerFeedback.leveledUp && answerFeedback.newLevel) {
        setTimeout(() => {
          setNewLevel(answerFeedback.newLevel!);
          setShowLevelUp(true);
          playLevelUpSound();
        }, 800);
      }
    }
  }, [answerFeedback, playCorrect, playIncorrect, playXP, playLevelUpSound]);

  // 次の問題へ
  const handleNext = () => {
    setSelectedOptionId(null);
    setShowXPAnimation(false);
    nextQuestion();
  };

  // セッション完了時に音を再生
  useEffect(() => {
    if (isComplete) {
      playComplete();
    }
  }, [isComplete, playComplete]);

  // リトライ
  const handleRetry = () => {
    hasPlayedStartSound.current = false;
    resetSession();
    startSession();
  };

  // 認証チェック
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#EF8A00]/20 border-t-[#EF8A00] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-sm border border-[#211714]/5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#211714]/5 flex items-center justify-center text-[#211714]/40">
            <LockIcon />
          </div>
          <h2 className="text-lg font-bold text-[#211714] mb-2">ログインが必要です</h2>
          <Link
            href="/login"
            className="inline-block bg-[#EF8A00] hover:bg-[#D67A00] text-white py-2.5 px-6 rounded-xl font-semibold transition-colors"
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
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#EF8A00]/20 border-t-[#EF8A00] animate-spin mx-auto mb-3" />
          <p className="text-[#3A2F2B]/70 text-sm">復習問題を準備中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#211714]/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link
            href="/coffee-trivia"
            className="flex items-center gap-1.5 text-[#3A2F2B] hover:text-[#EF8A00] transition-colors"
          >
            <ArrowLeftIcon />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <h1 className="font-semibold text-[#211714] flex items-center gap-2">
            <RefreshIcon />
            復習モード
          </h1>
          <div className="w-14" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-4 py-5">
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
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-[#EF8A00] hover:bg-[#D67A00] text-white py-3.5 px-5 rounded-xl font-semibold transition-colors"
                >
                  {currentIndex + 1 >= totalQuestions ? (
                    '結果を見る'
                  ) : (
                    <>
                      次の問題へ
                      <ArrowRightIcon />
                    </>
                  )}
                </motion.button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircleIcon />
              </div>
              <p className="text-[#3A2F2B]/70 mb-4">復習する問題はありません</p>
              <Link
                href="/coffee-trivia"
                className="inline-block bg-[#EF8A00] hover:bg-[#D67A00] text-white py-2.5 px-6 rounded-xl font-semibold transition-colors"
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

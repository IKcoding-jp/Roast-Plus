'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { QuizCard } from '@/components/coffee-quiz/QuizCard';
import { QuizResult } from '@/components/coffee-quiz/QuizResult';
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

const FlameIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const InboxIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

function RevengePageContent() {
  const { isAuthenticated, loading: authLoading, progress, revengeCount } = useQuizData();

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
    mode: 'revenge',
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const hasPlayedStartSound = useRef(false);

  // セッション開始
  useEffect(() => {
    if (isAuthenticated && !session && !isLoading && revengeCount > 0) {
      startSession();
    }
  }, [isAuthenticated, session, isLoading, revengeCount, startSession]);

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

      // XP音は少し遅らせる
      if (answerFeedback.xpEarned > 0) {
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
          <p className="text-[#3A2F2B]/70 text-sm mb-4">
            リベンジモードに挑戦するにはログインしてください
          </p>
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

  // リベンジ対象の問題がない場合
  if (!isLoading && revengeCount === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <header className="sticky top-0 z-10 bg-white border-b border-[#211714]/5 px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Link
              href="/coffee-trivia"
              className="flex items-center gap-1.5 text-[#3A2F2B] hover:text-[#EF8A00] transition-colors"
            >
              <ArrowLeftIcon />
              <span className="text-sm font-medium">戻る</span>
            </Link>
            <h1 className="font-semibold text-[#211714]">リベンジモード</h1>
            <div className="w-14" />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#211714] mb-2">苦手な問題はありません</h2>
            <p className="text-[#3A2F2B]/70 text-sm mb-6">
              素晴らしい！現在リベンジが必要な問題はありません。<br />
              クイズを続けて学習を深めましょう。
            </p>
            <Link
              href="/coffee-trivia"
              className="inline-block bg-[#EF8A00] hover:bg-[#D67A00] text-white py-2.5 px-6 rounded-xl font-semibold transition-colors"
            >
              ダッシュボードへ戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ローディング
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mx-auto mb-3" />
          <p className="text-[#3A2F2B]/70 text-sm">苦手問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link
            href="/coffee-trivia"
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeftIcon />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <FlameIcon />
            <h1 className="font-bold text-white">リベンジモード</h1>
          </div>
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
                xpEarned={answerFeedback?.xpEarned}
              />

              {/* 次へボタン */}
              {showFeedback && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNext}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3.5 px-5 rounded-xl font-semibold transition-colors"
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#211714]/5 flex items-center justify-center text-[#211714]/40">
                <InboxIcon />
              </div>
              <p className="text-[#3A2F2B]/70">問題がありません</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* レベルアップモーダル */}
      <LevelUpModal
        show={showLevelUp}
        newLevel={newLevel}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
}

export default function RevengePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
        </div>
      }
    >
      <RevengePageContent />
    </Suspense>
  );
}

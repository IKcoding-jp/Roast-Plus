'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { QuizCard } from '@/components/coffee-quiz/QuizCard';
import { QuizResult } from '@/components/coffee-quiz/QuizResult';
import { LevelUpModal } from '@/components/coffee-quiz/LevelUpModal';
import { QuizPageHeader } from '@/components/coffee-quiz/QuizPageHeader';
import { QuizNavigationButtons } from '@/components/coffee-quiz/QuizNavigationButtons';
import { QuizCompletionScreen } from '@/components/coffee-quiz/QuizCompletionScreen';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizData } from '@/hooks/useQuizData';
import { useQuizSound } from '@/hooks/useQuizSound';
import type { QuizCategory } from '@/lib/coffee-quiz/types';

const InboxIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

function QuizPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as QuizCategory | null;
  const modeParam = searchParams.get('mode') || 'daily';
  const questionIdsParam = searchParams.get('questionIds');
  const returnUrlParam = searchParams.get('returnUrl');

  // 問題IDリストを解析
  const questionIds = questionIdsParam ? questionIdsParam.split(',').filter(Boolean) : undefined;
  // 戻り先URL（デコード）
  const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : '/coffee-trivia';

  const { isAuthenticated, loading: authLoading, progress } = useQuizData();

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

  // モードを決定
  const determineMode = () => {
    if (modeParam === 'single') return 'single';
    if (modeParam === 'sequential') return 'sequential';
    if (modeParam === 'shuffle') return 'shuffle';
    if (categoryParam) return 'category';
    return modeParam as 'daily' | 'review' | 'random';
  };

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
    mode: determineMode(),
    category: categoryParam || undefined,
    count: questionIds?.length || 10,
    questionIds,
  });

  const isSingleMode = modeParam === 'single';
  const isSequentialMode = modeParam === 'sequential';

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const hasPlayedStartSound = useRef(false);

  // セッション開始
  useEffect(() => {
    if (isAuthenticated && !session && !isLoading) {
      startSession();
    }
  }, [isAuthenticated, session, isLoading, startSession]);

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

      // sequentialモードで正解時は自動的に次の問題へ遷移
      if (isSequentialMode && answerFeedback.isCorrect) {
        const isLastQuestion = currentIndex + 1 >= totalQuestions;
        // 最後の問題でない場合のみ自動遷移（1.2秒後）
        if (!isLastQuestion) {
          const timer = setTimeout(() => {
            setSelectedOptionId(null);
            nextQuestion();
          }, 1200);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [answerFeedback, playCorrect, playIncorrect, playXP, playLevelUpSound, isSequentialMode, currentIndex, totalQuestions, nextQuestion]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#EF8A00]/20 border-t-[#EF8A00] animate-spin" />
      </div>
    );
  }

  // ローディング
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#EF8A00]/20 border-t-[#EF8A00] animate-spin mx-auto mb-3" />
          <p className="text-[#3A2F2B]/70 text-sm">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <QuizPageHeader returnUrl={returnUrl} mode={modeParam} category={categoryParam} />

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {isComplete ? (
            isSingleMode ? (
              <QuizCompletionScreen
                correct={sessionStats.correct}
                totalXP={sessionStats.totalXP}
                returnUrl={returnUrl}
              />
            ) : (
              <QuizResult
                correct={sessionStats.correct}
                incorrect={sessionStats.incorrect}
                totalXP={sessionStats.totalXP}
                accuracy={sessionStats.accuracy}
                onRetry={handleRetry}
                returnUrl={returnUrl}
              />
            )
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
                <QuizNavigationButtons
                  mode={isSingleMode ? 'single' : isSequentialMode ? 'sequential' : 'normal'}
                  returnUrl={returnUrl}
                  isCorrect={answerFeedback?.isCorrect ?? false}
                  isLastQuestion={currentIndex + 1 >= totalQuestions}
                  onNext={handleNext}
                />
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

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#EF8A00]/20 border-t-[#EF8A00] animate-spin" />
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}

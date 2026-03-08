'use client';

import { useState } from 'react';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { QuizDashboard, HelpGuideModal } from '@/components/coffee-quiz';
import { useQuizData } from '@/hooks/useQuizData';
import { FloatingNav, IconButton } from '@/components/ui';

// ヘルプアイコン
const HelpCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

export default function CoffeeTriviaPage() {
  const { progress, loading: quizLoading, getDueCardsForReview, questionsStats, categoryMasteryStats } = useQuizData();
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  useAppLifecycle();

  if (quizLoading) {
    return <Loading />;
  }

  const dueCardsCount = getDueCardsForReview().length;

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <FloatingNav
        backHref="/"
        right={
          <IconButton
            variant="surface"
            size="sm"
            rounded
            onClick={() => setShowHelpGuide(true)}
            className="!w-11 !h-11 bg-surface/80 backdrop-blur-sm shadow-md text-ink-sub hover:text-ink hover:bg-surface"
            title="使い方ガイド"
            aria-label="使い方ガイド"
          >
            <HelpCircleIcon />
          </IconButton>
        }
      />

      <main className="flex-1 container mx-auto px-4 lg:px-6 pt-14 pb-6 max-w-lg flex flex-col justify-center">
        <QuizDashboard
          progress={progress}
          dueCardsCount={dueCardsCount}
          loading={quizLoading}
          questionsStats={questionsStats}
          categoryMasteryStats={categoryMasteryStats}
        />
      </main>

      {/* 使い方ガイドモーダル */}
      <HelpGuideModal
        show={showHelpGuide}
        onClose={() => setShowHelpGuide(false)}
      />
    </div>
  );
}

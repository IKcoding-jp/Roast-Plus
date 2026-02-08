'use client';

import { useState } from 'react';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import Link from 'next/link';
import { QuizDashboard, HelpGuideModal } from '@/components/coffee-quiz';
import { useQuizData } from '@/hooks/useQuizData';

// シンプルな戻るアイコン
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

// コーヒーカップアイコン
const CoffeeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

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
      <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between bg-surface border-b border-edge">
        <div className="flex items-center">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 text-ink-sub hover:text-spot hover:bg-spot-subtle rounded-lg transition-colors"
            title="戻る"
            aria-label="戻る"
          >
            <ArrowLeftIcon />
          </Link>
          <h1 className="ml-2.5 text-base font-semibold text-ink flex items-center gap-2">
            <span className="text-spot">
              <CoffeeIcon />
            </span>
            コーヒークイズ
          </h1>
        </div>
        <button
          onClick={() => setShowHelpGuide(true)}
          className="p-1.5 -mr-1.5 text-ink-muted hover:text-spot hover:bg-spot-subtle rounded-lg transition-colors"
          title="使い方ガイド"
          aria-label="使い方ガイド"
        >
          <HelpCircleIcon />
        </button>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg">
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

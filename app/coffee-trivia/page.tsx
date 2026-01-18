'use client';

import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import Link from 'next/link';
import { QuizDashboard } from '@/components/coffee-quiz/QuizDashboard';
import { useQuizData } from '@/hooks/useQuizData';

export default function CoffeeTriviaPage() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: quizLoading, getDueCardsForReview } = useQuizData();
  useAppLifecycle();

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const dueCardsCount = getDueCardsForReview().length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          title="戻る"
          aria-label="戻る"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>☕</span>
          コーヒークイズ
        </h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg">
        <QuizDashboard
          progress={progress}
          dueCardsCount={dueCardsCount}
          loading={quizLoading}
        />
      </main>
    </div>
  );
}

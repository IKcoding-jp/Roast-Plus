'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { QuizQuestion, QuizCategory } from '@/lib/coffee-quiz/types';
import { CATEGORY_LABELS } from '@/lib/coffee-quiz/types';
import { getQuestionsByCategory } from '@/lib/coffee-quiz/questions';
import { useQuizData } from '@/hooks/useQuizData';
import { CategoryQuestionList } from '@/components/coffee-quiz/CategoryQuestionList';

// インラインSVGアイコン
const ArrowLeftIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

interface CategoryPageContentProps {
  category: QuizCategory;
}

export function CategoryPageContent({ category }: CategoryPageContentProps) {
  const router = useRouter();
  const { progress, loading: progressLoading, refreshProgress } = useQuizData();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // ページ表示時に進捗データを再読み込み（クイズ回答後の反映用）
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // カテゴリの検証
  const validCategories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];
  const isValidCategory = validCategories.includes(category);

  // 問題を読み込み
  useEffect(() => {
    if (!isValidCategory) {
      setLoading(false);
      return;
    }

    async function loadQuestions() {
      try {
        const categoryQuestions = await getQuestionsByCategory(category);
        setQuestions(categoryQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [category, isValidCategory]);

  // 無効なカテゴリ
  if (!isValidCategory) {
    return (
      <div className="min-h-screen bg-page p-4">
        <div className="max-w-md mx-auto pt-20 text-center">
          <p className="text-ink-muted">カテゴリが見つかりません</p>
          <button
            onClick={() => router.push('/coffee-trivia')}
            className="mt-4 text-spot hover:underline"
          >
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  // ローディング
  if (loading || progressLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-spot/20 border-t-spot animate-spin" />
      </div>
    );
  }

  const cards = progress?.cards ?? [];

  return (
    <div className="min-h-screen bg-page">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-edge">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/coffee-trivia')}
            className="p-2 -ml-2 rounded-lg hover:bg-edge-subtle transition-colors"
          >
            <ArrowLeftIcon size={24} className="text-ink-sub" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-ink">
              {CATEGORY_LABELS[category]}
            </h1>
            <p className="text-xs text-ink-muted">
              問題一覧
            </p>
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        {questions.length > 0 ? (
          <CategoryQuestionList
            category={category}
            questions={questions}
            cards={cards}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-ink-muted">問題がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}

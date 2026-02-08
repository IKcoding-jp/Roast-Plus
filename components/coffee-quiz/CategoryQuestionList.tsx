'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { QuizQuestion, QuizCard, QuizCategory } from '@/lib/coffee-quiz/types';
import { getCardMastery } from '@/lib/coffee-quiz/fsrs';
import { CATEGORY_LABELS } from '@/lib/coffee-quiz/types';
import { QuestionListItem } from './QuestionListItem';

// インラインSVGアイコン
const ShuffleIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
    <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
    <path d="m18 14 4 4-4 4" />
  </svg>
);

const PlayIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

interface CategoryQuestionListProps {
  category: QuizCategory;
  questions: QuizQuestion[];
  cards: QuizCard[];
}

type SortOption = 'default' | 'difficulty';

/**
 * カテゴリ別問題一覧コンテナ
 * 出題オプション:
 * 1. 個別問題クリック - クリックした問題から連続出題（正解で次へ自動遷移）
 * 2. シャッフル10問 - ランダム10問出題
 * 3. 全問連続 - カテゴリ全問題を出題
 */
export function CategoryQuestionList({
  category,
  questions,
  cards,
}: CategoryQuestionListProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // カードから定着率マップを作成
  const masteryMap = useMemo(() => {
    const map = new Map<string, number>();
    cards.forEach((card) => {
      map.set(card.questionId, getCardMastery(card));
    });
    return map;
  }, [cards]);

  // 回答状態マップを作成（'correct' | 'incorrect' | 'unanswered'）
  const answerStatusMap = useMemo(() => {
    const map = new Map<string, 'correct' | 'incorrect' | 'unanswered'>();
    cards.forEach((card) => {
      if (card.hasAnsweredCorrectly) {
        map.set(card.questionId, 'correct');
      } else {
        // カードが存在するが正解していない = 不正解
        map.set(card.questionId, 'incorrect');
      }
    });
    return map;
  }, [cards]);

  // ソートされた問題リスト
  const sortedQuestions = useMemo(() => {
    const sorted = [...questions];
    switch (sortBy) {
      case 'difficulty':
        const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        sorted.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
        break;

      default:
        // デフォルト順序
        break;
    }
    return sorted;
  }, [questions, sortBy]);

  // 個別問題を解く（クリックした問題から連続出題）
  const handleQuestionClick = (questionId: string) => {
    // クリックした問題のインデックスを取得
    const clickedIndex = sortedQuestions.findIndex(q => q.id === questionId);
    // クリックした問題から最後までの問題IDリストを作成
    const remainingQuestions = sortedQuestions.slice(clickedIndex);
    const ids = remainingQuestions.map(q => q.id).join(',');
    const returnUrl = encodeURIComponent(`/coffee-trivia/category/${category}`);
    router.push(`/coffee-trivia/quiz?mode=sequential&questionIds=${ids}&returnUrl=${returnUrl}`);
  };

  // シャッフル10問
  const handleShuffle10 = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    const ids = selected.map((q) => q.id).join(',');
    const returnUrl = encodeURIComponent(`/coffee-trivia/category/${category}`);
    router.push(`/coffee-trivia/quiz?mode=shuffle&questionIds=${ids}&returnUrl=${returnUrl}`);
  };

  // 全問連続
  const handleAllQuestions = () => {
    const ids = questions.map((q) => q.id).join(',');
    const returnUrl = encodeURIComponent(`/coffee-trivia/category/${category}`);
    router.push(`/coffee-trivia/quiz?mode=category&category=${category}&questionIds=${ids}&returnUrl=${returnUrl}`);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">
            {CATEGORY_LABELS[category]}
          </h2>
          <p className="text-sm text-ink-muted">
            全{questions.length}問
          </p>
        </div>
      </div>

      {/* 出題オプション */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleShuffle10}
          className="
            flex items-center justify-center gap-2
            bg-spot hover:bg-spot/90
            text-white
            rounded-xl
            py-3 px-4
            transition-colors
            shadow-sm
          "
        >
          <ShuffleIcon size={18} />
          <span className="font-medium">シャッフル10問</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAllQuestions}
          className="
            flex items-center justify-center gap-2
            bg-edge-subtle hover:bg-edge
            border border-edge
            text-ink
            rounded-xl
            py-3 px-4
            transition-colors
          "
        >
          <PlayIcon size={18} />
          <span className="font-medium">全問出題</span>
        </motion.button>
      </div>

      {/* ソートオプション */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted">並び替え:</span>
        <div className="flex gap-1">
          {[
            { value: 'default', label: '順番' },
            { value: 'difficulty', label: '難易度' },

          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortOption)}
              className={`
                text-xs px-2 py-1 rounded-md transition-colors
                ${sortBy === option.value
                  ? 'bg-spot/20 text-spot'
                  : 'bg-edge-subtle text-ink-muted hover:text-ink-sub'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 問題リスト */}
      <div className="space-y-2">
        {sortedQuestions.map((question, index) => (
          <QuestionListItem
            key={question.id}
            question={question}
            mastery={masteryMap.get(question.id) ?? 0}
            answerStatus={answerStatusMap.get(question.id) ?? 'unanswered'}
            index={index}
            onClick={() => handleQuestionClick(question.id)}
          />
        ))}
      </div>
    </div>
  );
}

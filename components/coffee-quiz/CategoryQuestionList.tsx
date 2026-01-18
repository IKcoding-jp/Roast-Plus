'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { QuizQuestion, QuestionCheckmark, QuizCategory } from '@/lib/coffee-quiz/types';
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
  checkmarks: QuestionCheckmark[];
}

type SortOption = 'default' | 'difficulty' | 'redCheck';

/**
 * カテゴリ別問題一覧コンテナ
 * 出題オプション:
 * 1. 個別問題クリック - 1問だけ解いて一覧に戻る
 * 2. シャッフル10問 - ランダム10問出題
 * 3. 全問連続 - カテゴリ全問題を出題
 */
export function CategoryQuestionList({
  category,
  questions,
  checkmarks,
}: CategoryQuestionListProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // チェックマークをマップに変換
  const checkmarkMap = useMemo(() => {
    const map = new Map<string, QuestionCheckmark>();
    checkmarks.forEach((c) => map.set(c.questionId, c));
    return map;
  }, [checkmarks]);

  // ソートされた問題リスト
  const sortedQuestions = useMemo(() => {
    const sorted = [...questions];
    switch (sortBy) {
      case 'difficulty':
        const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        sorted.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
        break;
      case 'redCheck':
        sorted.sort((a, b) => {
          const aRed = checkmarkMap.get(a.id)?.redCheck ?? 0;
          const bRed = checkmarkMap.get(b.id)?.redCheck ?? 0;
          return bRed - aRed;
        });
        break;
      default:
        // デフォルト順序
        break;
    }
    return sorted;
  }, [questions, sortBy, checkmarkMap]);

  // 個別問題を解く
  const handleQuestionClick = (questionId: string) => {
    const returnUrl = encodeURIComponent(`/coffee-trivia/category/${category}`);
    router.push(`/coffee-trivia/quiz?mode=single&questionIds=${questionId}&returnUrl=${returnUrl}`);
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
    router.push(`/coffee-trivia/quiz?mode=category&questionIds=${ids}&returnUrl=${returnUrl}`);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {CATEGORY_LABELS[category]}
          </h2>
          <p className="text-sm text-neutral-400">
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
            bg-[#EF8A00]/20 hover:bg-[#EF8A00]/30
            border border-[#EF8A00]/30
            text-[#EF8A00]
            rounded-xl
            py-3 px-4
            transition-colors
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
            bg-neutral-700/50 hover:bg-neutral-600/50
            border border-neutral-600/50
            text-neutral-200
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
        <span className="text-xs text-neutral-500">並び替え:</span>
        <div className="flex gap-1">
          {[
            { value: 'default', label: '順番' },
            { value: 'difficulty', label: '難易度' },
            { value: 'redCheck', label: '苦手順' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortOption)}
              className={`
                text-xs px-2 py-1 rounded-md transition-colors
                ${sortBy === option.value
                  ? 'bg-[#EF8A00]/20 text-[#EF8A00]'
                  : 'bg-neutral-800/50 text-neutral-400 hover:text-neutral-200'
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
            checkmark={checkmarkMap.get(question.id)}
            index={index}
            onClick={() => handleQuestionClick(question.id)}
          />
        ))}
      </div>
    </div>
  );
}

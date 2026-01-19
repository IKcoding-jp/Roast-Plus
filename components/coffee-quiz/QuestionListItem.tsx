'use client';

import { motion } from 'framer-motion';
import type { QuizQuestion, QuestionCheckmark } from '@/lib/coffee-quiz/types';
import { DIFFICULTY_LABELS } from '@/lib/coffee-quiz/types';
import { CheckmarkCompact } from './CheckmarkDisplay';

// インラインSVGアイコン
const ChevronRightIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
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
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface QuestionListItemProps {
  question: QuizQuestion;
  checkmark?: QuestionCheckmark | null;
  index: number;
  onClick: () => void;
}

/**
 * 問題一覧アイテムコンポーネント
 * - 問題ID
 * - 難易度バッジ
 * - チェックマーク状態
 */
export function QuestionListItem({
  question,
  checkmark,
  index,
  onClick,
}: QuestionListItemProps) {
  const difficultyConfig = {
    beginner: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    intermediate: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    advanced: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  };

  const config = difficultyConfig[question.difficulty];

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onClick}
      className="
        w-full
        bg-white
        hover:bg-[#211714]/5
        border border-[#211714]/5
        hover:border-[#211714]/10
        rounded-xl
        p-4
        text-left
        transition-colors duration-200
        shadow-sm
        group
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* 問題ID & 難易度 & チェックマーク */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#3A2F2B]/50 font-mono">
              {question.id}
            </span>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${config.bg} ${config.text} ${config.border}
                border
              `}
            >
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
            <CheckmarkCompact
              blueCheck={checkmark?.blueCheck ?? 0}
              redCheck={checkmark?.redCheck ?? 0}
            />
          </div>

          {/* 問題文（プレビュー） */}
          <p className="text-sm text-[#211714] line-clamp-2">
            {question.question}
          </p>
        </div>

        {/* 矢印 */}
        <ChevronRightIcon
          size={20}
          className="text-[#3A2F2B]/40 group-hover:text-[#3A2F2B]/60 transition-colors ml-2 flex-shrink-0"
        />
      </div>
    </motion.button>
  );
}

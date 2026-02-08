'use client';

import { motion } from 'framer-motion';
import type { QuizQuestion } from '@/lib/coffee-quiz/types';
import { DIFFICULTY_LABELS } from '@/lib/coffee-quiz/types';
import { MasteryLabel } from './MasteryDisplay';

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

type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

interface QuestionListItemProps {
  question: QuizQuestion;
  mastery?: number; // 0-100の定着率
  answerStatus?: AnswerStatus; // 回答状態
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
  mastery = 0,
  answerStatus = 'unanswered',
  index,
  onClick,
}: QuestionListItemProps) {
  const difficultyConfig = {
    beginner: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-700',
      border: 'border-emerald-500/20',
    },
    intermediate: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-700',
      border: 'border-amber-500/20',
    },
    advanced: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-700',
      border: 'border-rose-500/20',
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
        bg-surface
        hover:bg-edge-subtle
        border border-edge
        hover:border-edge-strong
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
          {/* 問題ID & 難易度 & 定着率 */}
          <div className="flex items-center gap-2 mb-2">
            {/* 回答ステータス */}
            <span className={`text-xl font-bold ${
              answerStatus === 'correct' ? 'text-green-500' :
              answerStatus === 'incorrect' ? 'text-red-400' :
              'text-ink-muted'
            }`}>
              {answerStatus === 'correct' ? '○' :
               answerStatus === 'incorrect' ? '×' :
               '−'}
            </span>
            <span className="text-xs text-ink-muted font-mono">
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
            <MasteryLabel mastery={mastery} />
          </div>

          {/* 問題文（プレビュー） */}
          <p className="text-sm text-ink line-clamp-2">
            {question.question}
          </p>
        </div>

        {/* 矢印 */}
        <ChevronRightIcon
          size={20}
          className="text-ink-muted group-hover:text-ink-sub transition-colors ml-2 flex-shrink-0"
        />
      </div>
    </motion.button>
  );
}

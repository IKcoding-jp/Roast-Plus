'use client';

import { motion } from 'framer-motion';
import type { QuizOption as QuizOptionType } from '@/lib/coffee-quiz/types';

interface QuizOptionProps {
  option: QuizOptionType;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  disabled: boolean;
  onClick: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// チェックアイコン
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ×アイコン
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function QuizOption({
  option,
  index,
  isSelected,
  isCorrect,
  showFeedback,
  disabled,
  onClick,
}: QuizOptionProps) {
  // 状態に応じたスタイルを決定
  const getStyles = () => {
    if (!showFeedback) {
      // フィードバック前
      if (isSelected) {
        return 'bg-[#EF8A00]/10 border-[#EF8A00] text-[#211714]';
      }
      return 'bg-white border-[#211714]/10 text-[#211714] hover:bg-[#FDF8F0] hover:border-[#EF8A00]/40';
    }

    // フィードバック後
    if (isCorrect) {
      return 'bg-emerald-50 border-emerald-500 text-emerald-900';
    }
    if (isSelected && !isCorrect) {
      return 'bg-rose-50 border-rose-500 text-rose-900';
    }
    return 'bg-gray-50 border-gray-200 text-gray-400';
  };

  const getLetterStyles = () => {
    if (!showFeedback) {
      if (isSelected) {
        return 'bg-[#EF8A00] text-white';
      }
      return 'bg-[#211714]/5 text-[#3A2F2B]';
    }

    if (isCorrect) {
      return 'bg-emerald-500 text-white';
    }
    if (isSelected && !isCorrect) {
      return 'bg-rose-500 text-white';
    }
    return 'bg-gray-200 text-gray-400';
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${getStyles()} ${
        disabled ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'
      }`}
    >
      {/* 選択肢のレター */}
      <span
        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${getLetterStyles()}`}
      >
        {showFeedback && isCorrect ? (
          <CheckIcon />
        ) : showFeedback && isSelected && !isCorrect ? (
          <XIcon />
        ) : (
          OPTION_LETTERS[index]
        )}
      </span>

      {/* 選択肢のテキスト */}
      <span className="flex-1 text-left font-medium text-sm">{option.text}</span>

      {/* 正解/不正解アイコン */}
      {showFeedback && isCorrect && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-emerald-500"
        >
          <CheckIcon />
        </motion.span>
      )}
      {showFeedback && isSelected && !isCorrect && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-rose-500"
        >
          <XIcon />
        </motion.span>
      )}
    </motion.button>
  );
}

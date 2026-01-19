'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QuizOption } from './QuizOption';
import { QuizProgress } from './QuizProgress';
import type { QuizQuestion } from '@/lib/coffee-quiz/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/coffee-quiz/types';

interface QuizCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  showFeedback: boolean;
  onSelectOption: (optionId: string) => void;
  xpEarned?: number;
}

// カテゴリアイコン
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'basics':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        </svg>
      );
    case 'roasting':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'brewing':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case 'history':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    default:
      return null;
  }
};

// 解説アイコン
const LightbulbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

// 難易度に応じたスタイル
const DIFFICULTY_STYLES = {
  beginner: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30',
  intermediate: 'bg-amber-500/20 text-amber-100 border border-amber-400/30',
  advanced: 'bg-rose-500/20 text-rose-100 border border-rose-400/30',
};

export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  correctOptionId,
  showFeedback,
  onSelectOption,
  xpEarned,
}: QuizCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50, rotateY: -5 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: -50, rotateY: 5 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#211714]/5"
    >
      {/* ヘッダー - ローストプラスブランドカラー */}
      <div className="relative bg-gradient-to-r from-[#211714] via-[#3A2F2B] to-[#211714] px-5 py-4">
        <div className="relative z-10">
          <QuizProgress current={currentIndex + 1} total={totalQuestions} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-white font-medium flex items-center gap-2">
              <span className="text-white/80">
                <CategoryIcon category={question.category} />
              </span>
              {CATEGORY_LABELS[question.category]}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${DIFFICULTY_STYLES[question.difficulty]}`}>
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
          </div>
        </div>
      </div>

      {/* 問題文 */}
      <div className="p-5">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base font-bold text-[#211714] leading-relaxed mb-5"
        >
          {question.question}
        </motion.h2>

        {/* 画像（あれば） */}
        {question.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-5 rounded-xl overflow-hidden"
          >
            <img
              src={question.imageUrl}
              alt="問題画像"
              className="w-full h-40 object-cover"
            />
          </motion.div>
        )}

        {/* 選択肢 */}
        <div className="space-y-2.5">
          <AnimatePresence>
            {question.options.map((option, index) => (
              <QuizOption
                key={option.id}
                option={option}
                index={index}
                isSelected={selectedOptionId === option.id}
                isCorrect={correctOptionId === option.id}
                showFeedback={showFeedback}
                disabled={showFeedback}
                onClick={() => onSelectOption(option.id)}
                xpEarned={selectedOptionId === option.id ? xpEarned : undefined}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* フィードバック（解説） */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mt-5 p-4 bg-[#FDF8F0] rounded-xl border border-[#EF8A00]/20"
            >
              <h3 className="font-bold text-[#211714] mb-2 flex items-center gap-2 text-sm">
                <span className="w-7 h-7 rounded-lg bg-[#EF8A00]/10 flex items-center justify-center text-[#EF8A00]">
                  <LightbulbIcon />
                </span>
                解説
              </h3>
              <p className="text-[#3A2F2B] text-sm leading-relaxed pl-9">
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

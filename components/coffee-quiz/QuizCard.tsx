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
}

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
}: QuizCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50, rotateY: -5 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: -50, rotateY: 5 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/95 rounded-2xl shadow-[0_8px_32px_rgba(33,23,20,0.12)] overflow-hidden backdrop-blur-sm border border-[#EF8A00]/10"
    >
      {/* ヘッダー - コーヒーブランドカラー */}
      <div className="relative bg-gradient-to-r from-[#EF8A00] via-[#D67A00] to-[#211714] px-5 py-4">
        {/* 装飾パターン */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <QuizProgress current={currentIndex + 1} total={totalQuestions} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-white font-medium flex items-center gap-2">
              <span className="text-lg">☕</span>
              {CATEGORY_LABELS[question.category]}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${DIFFICULTY_STYLES[question.difficulty]}`}>
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
          </div>
        </div>
      </div>

      {/* 問題文 */}
      <div className="p-6">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-bold text-[#211714] leading-relaxed mb-6"
        >
          {question.question}
        </motion.h2>

        {/* 画像（あれば） */}
        {question.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-5 rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={question.imageUrl}
              alt="問題画像"
              className="w-full h-44 object-cover"
            />
          </motion.div>
        )}

        {/* 選択肢 */}
        <div className="space-y-3">
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
              className="mt-6 p-5 bg-gradient-to-br from-[#FDF8F0] to-[#F7F2EB] rounded-xl border border-[#EF8A00]/20 shadow-inner"
            >
              <h3 className="font-bold text-[#211714] mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#EF8A00]/10 flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </span>
                解説
              </h3>
              <p className="text-[#3A2F2B] text-sm leading-relaxed pl-10">
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

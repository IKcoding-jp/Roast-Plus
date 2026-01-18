'use client';

import { motion } from 'framer-motion';
import type { QuizCategory } from '@/lib/coffee-quiz/types';
import { CATEGORY_LABELS } from '@/lib/coffee-quiz/types';

interface CategorySelectorProps {
  selectedCategory: QuizCategory | null;
  onSelect: (category: QuizCategory | null) => void;
  stats?: Record<QuizCategory, { total: number; mastered: number }>;
}

const CATEGORY_CONFIG: Record<QuizCategory, { icon: string; gradient: string; bgLight: string }> = {
  basics: {
    icon: '☕',
    gradient: 'from-[#EF8A00] via-[#FF9A1A] to-[#D67A00]',
    bgLight: 'bg-[#EF8A00]/5 border-[#EF8A00]/20 hover:border-[#EF8A00]/50',
  },
  roasting: {
    icon: '🫘',
    gradient: 'from-[#211714] via-[#3A2F2B] to-[#211714]',
    bgLight: 'bg-[#211714]/5 border-[#211714]/20 hover:border-[#211714]/50',
  },
  brewing: {
    icon: '💧',
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    bgLight: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  },
  history: {
    icon: '📚',
    gradient: 'from-[#d4af37] via-[#f4d03f] to-[#b8960c]',
    bgLight: 'bg-[#d4af37]/5 border-[#d4af37]/20 hover:border-[#d4af37]/50',
  },
};

export function CategorySelector({
  selectedCategory,
  onSelect,
  stats,
}: CategorySelectorProps) {
  const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category, index) => {
        const isSelected = selectedCategory === category;
        const categoryStats = stats?.[category];
        const config = CATEGORY_CONFIG[category];
        const masteryPercent = categoryStats && categoryStats.total > 0
          ? Math.round((categoryStats.mastered / categoryStats.total) * 100)
          : 0;

        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(isSelected ? null : category)}
            className={`relative rounded-2xl p-4 transition-all min-h-[100px] overflow-hidden ${
              isSelected
                ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg`
                : `bg-white border-2 ${config.bgLight} hover:shadow-md`
            }`}
          >
            {/* 背景装飾 */}
            {isSelected && (
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
            )}

            <div className="relative z-10">
              {/* アイコン */}
              <motion.span
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl mb-2 block"
              >
                {config.icon}
              </motion.span>

              {/* カテゴリ名 */}
              <span
                className={`font-bold text-sm block ${
                  isSelected ? 'text-white' : 'text-[#211714]'
                }`}
              >
                {CATEGORY_LABELS[category]}
              </span>

              {/* 統計とプログレス */}
              {categoryStats && (
                <div className="mt-2">
                  <div className={`h-1.5 rounded-full overflow-hidden mb-1 ${
                    isSelected ? 'bg-white/30' : 'bg-[#211714]/10'
                  }`}>
                    <motion.div
                      className={`h-full rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[#EF8A00]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryPercent}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  <span
                    className={`text-[10px] block ${
                      isSelected ? 'text-white/80' : 'text-[#3A2F2B]/60'
                    }`}
                  >
                    {categoryStats.mastered}/{categoryStats.total}問マスター
                  </span>
                </div>
              )}
            </div>

            {/* 選択インジケーター */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

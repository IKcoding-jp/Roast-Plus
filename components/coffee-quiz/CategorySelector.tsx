'use client';

import { motion } from 'framer-motion';
import type { QuizCategory } from '@/lib/coffee-quiz/types';
import { CATEGORY_LABELS } from '@/lib/coffee-quiz/types';

interface CategorySelectorProps {
  selectedCategory: QuizCategory | null;
  onSelect: (category: QuizCategory | null) => void;
  stats?: Record<QuizCategory, { total: number; mastered: number }>;
}

// カテゴリアイコン
const CoffeeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

const BeanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const DropletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CATEGORY_CONFIG: Record<QuizCategory, {
  icon: React.ComponentType;
  selectedBg: string;
  iconBg: string;
}> = {
  basics: {
    icon: CoffeeIcon,
    selectedBg: 'bg-[#211714]',
    iconBg: 'bg-[#FDF8F0]',
  },
  roasting: {
    icon: BeanIcon,
    selectedBg: 'bg-[#EF8A00]',
    iconBg: 'bg-[#EF8A00]/10',
  },
  brewing: {
    icon: DropletIcon,
    selectedBg: 'bg-sky-600',
    iconBg: 'bg-sky-50',
  },
  history: {
    icon: BookIcon,
    selectedBg: 'bg-[#3A2F2B]',
    iconBg: 'bg-[#211714]/5',
  },
};

export function CategorySelector({
  selectedCategory,
  onSelect,
  stats,
}: CategorySelectorProps) {
  const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {categories.map((category, index) => {
        const isSelected = selectedCategory === category;
        const categoryStats = stats?.[category];
        const config = CATEGORY_CONFIG[category];
        const Icon = config.icon;
        const masteryPercent = categoryStats && categoryStats.total > 0
          ? Math.round((categoryStats.mastered / categoryStats.total) * 100)
          : 0;

        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(isSelected ? null : category)}
            className={`relative rounded-xl p-3.5 transition-all text-left ${
              isSelected
                ? `${config.selectedBg} text-white`
                : 'bg-[#FDF8F0] hover:bg-[#211714]/5 border border-[#211714]/5'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {/* アイコン */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-white/15' : config.iconBg
              }`}>
                <span className={isSelected ? 'text-white' : 'text-[#3A2F2B]'}>
                  <Icon />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* カテゴリ名 */}
                <span className={`font-medium text-sm block ${
                  isSelected ? 'text-white' : 'text-[#211714]'
                }`}>
                  {CATEGORY_LABELS[category]}
                </span>

                {/* 統計とプログレス */}
                {categoryStats && (
                  <div className="mt-1.5">
                    <div className={`h-1 rounded-full overflow-hidden ${
                      isSelected ? 'bg-white/25' : 'bg-[#211714]/10'
                    }`}>
                      <motion.div
                        className={`h-full rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#EF8A00]'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${masteryPercent}%` }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      />
                    </div>
                    <span className={`text-[10px] block mt-1 ${
                      isSelected ? 'text-white/70' : 'text-[#3A2F2B]/60'
                    }`}>
                      {categoryStats.mastered}/{categoryStats.total}問
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 選択インジケーター */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2.5 right-2.5 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"
              >
                <CheckIcon />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

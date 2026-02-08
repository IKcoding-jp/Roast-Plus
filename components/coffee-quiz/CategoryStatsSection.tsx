import { motion } from 'framer-motion';
import type { QuizCategory, QuizStats } from '@/lib/coffee-quiz/types';
import { CATEGORY_LABELS } from '@/lib/coffee-quiz/types';

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

interface CategoryStatsSectionProps {
  stats: QuizStats;
  questionsStats: { byCategory: Record<QuizCategory, number> } | null;
  categoryMasteryStats: Record<QuizCategory, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }>;
}

export function CategoryStatsSection({ stats, questionsStats, categoryMasteryStats }: CategoryStatsSectionProps) {
  const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-surface rounded-2xl shadow-lg p-5 border border-edge"
    >
      <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
        <span className="text-spot">
          <BookOpenIcon />
        </span>
        カテゴリ別
      </h2>

      <div className="space-y-3">
        {categories.map((category) => {
          const catStats = stats.categoryStats[category];
          const totalQuestions = questionsStats?.byCategory[category] ?? 0;
          const masteryData = categoryMasteryStats[category];
          const answeredCorrectlyCount = masteryData?.answeredCorrectlyCount ?? 0;
          // 正解済み進捗率を計算
          const progressPercent = totalQuestions > 0 ? Math.round((answeredCorrectlyCount / totalQuestions) * 100) : 0;

          return (
            <div key={category} className="bg-ground rounded-xl p-4 border border-edge">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-spot font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-edge rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-spot to-spot-hover rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-ink-muted">
                <span>
                  正解済み: {answeredCorrectlyCount}/{totalQuestions}問
                </span>
                <span>
                  正解率: {catStats.accuracy}%（{catStats.correct}/{catStats.total}回答）
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import type { QuizDifficulty, QuizStats } from '@/lib/coffee-quiz/types';
import { DIFFICULTY_LABELS } from '@/lib/coffee-quiz/types';

const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

interface DifficultyStatsSectionProps {
  stats: QuizStats;
  questionsStats: { byDifficulty: Record<QuizDifficulty, number> } | null;
  difficultyMasteryStats: Record<QuizDifficulty, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }>;
}

export function DifficultyStatsSection({ stats, questionsStats, difficultyMasteryStats }: DifficultyStatsSectionProps) {
  const difficulties: QuizDifficulty[] = ['beginner', 'intermediate', 'advanced'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-surface rounded-2xl shadow-lg p-5 border border-edge"
    >
      <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
        <span className="text-spot">
          <TargetIcon />
        </span>
        難易度別
      </h2>

      <div className="space-y-3">
        {difficulties.map((difficulty, index) => {
          const diffStats = stats.difficultyStats[difficulty];
          const totalQuestions = questionsStats?.byDifficulty[difficulty] ?? 0;
          const masteryData = difficultyMasteryStats?.[difficulty];
          const answeredCorrectlyCount = masteryData?.answeredCorrectlyCount ?? 0;
          // 正解済み進捗率を計算
          const progressPercent = totalQuestions > 0 ? Math.round((answeredCorrectlyCount / totalQuestions) * 100) : 0;

          return (
            <div
              key={difficulty}
              className="bg-ground rounded-xl p-4 border border-edge"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink">
                  {DIFFICULTY_LABELS[difficulty]}
                </span>
                <span className={`font-bold ${
                  difficulty === 'beginner'
                    ? 'text-emerald-600'
                    : difficulty === 'intermediate'
                    ? 'text-spot'
                    : 'text-rose-600'
                }`}>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-edge rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    difficulty === 'beginner'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : difficulty === 'intermediate'
                      ? 'bg-gradient-to-r from-spot to-spot-hover'
                      : 'bg-gradient-to-r from-rose-500 to-rose-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-ink-muted">
                <span>
                  正解済み: {answeredCorrectlyCount}/{totalQuestions}問
                </span>
                <span>
                  正解率: {diffStats.accuracy}%（{diffStats.correct}/{diffStats.total}回答）
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

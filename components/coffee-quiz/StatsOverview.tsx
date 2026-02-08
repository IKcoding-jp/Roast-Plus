import { motion } from 'framer-motion';
import type { QuizStats } from '@/lib/coffee-quiz/types';

const TrendingUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

interface StatsOverviewProps {
  stats: QuizStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl shadow-lg p-5 border border-edge"
    >
      <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
        <span className="text-spot">
          <TrendingUpIcon />
        </span>
        全体統計
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-ground rounded-xl p-4 text-center border border-edge">
          <span className="text-3xl font-bold text-ink">
            {stats.totalQuestions}
          </span>
          <p className="text-ink-muted text-sm mt-1">総回答数</p>
        </div>
        <div className="bg-ground rounded-xl p-4 text-center border border-spot/20">
          <span className="text-3xl font-bold text-spot">
            {stats.averageAccuracy}%
          </span>
          <p className="text-spot/70 text-sm mt-1">平均正解率</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success-subtle rounded-xl p-4 text-center border border-success/20">
          <span className="text-2xl font-bold text-emerald-600">
            {stats.totalCorrect}
          </span>
          <p className="text-emerald-600/70 text-sm mt-1">正解</p>
        </div>
        <div className="bg-danger-subtle rounded-xl p-4 text-center border border-danger/20">
          <span className="text-2xl font-bold text-rose-500">
            {stats.totalIncorrect}
          </span>
          <p className="text-rose-500/70 text-sm mt-1">不正解</p>
        </div>
      </div>
    </motion.div>
  );
}

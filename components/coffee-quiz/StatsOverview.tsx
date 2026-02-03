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
      className="bg-white rounded-2xl shadow-lg p-5 border border-[#211714]/5"
    >
      <h2 className="font-bold text-[#211714] mb-4 flex items-center gap-2">
        <span className="text-[#EF8A00]">
          <TrendingUpIcon />
        </span>
        全体統計
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-[#211714]/5">
          <span className="text-3xl font-bold text-[#211714]">
            {stats.totalQuestions}
          </span>
          <p className="text-[#3A2F2B]/60 text-sm mt-1">総回答数</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-[#EF8A00]/20">
          <span className="text-3xl font-bold text-[#EF8A00]">
            {stats.averageAccuracy}%
          </span>
          <p className="text-[#EF8A00]/70 text-sm mt-1">平均正解率</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <span className="text-2xl font-bold text-emerald-600">
            {stats.totalCorrect}
          </span>
          <p className="text-emerald-600/70 text-sm mt-1">正解</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
          <span className="text-2xl font-bold text-rose-500">
            {stats.totalIncorrect}
          </span>
          <p className="text-rose-500/70 text-sm mt-1">不正解</p>
        </div>
      </div>
    </motion.div>
  );
}

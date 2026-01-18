'use client';

import { motion } from 'framer-motion';
import type { DailyGoal } from '@/lib/coffee-quiz/types';
import { getDailyGoalProgress } from '@/lib/coffee-quiz/gamification';

interface DailyGoalProgressProps {
  goal: DailyGoal | null;
  targetQuestions: number;
}

export function DailyGoalProgress({
  goal,
  targetQuestions,
}: DailyGoalProgressProps) {
  const progress = getDailyGoalProgress(goal);
  const completed = goal?.completedQuestions ?? 0;
  const correct = goal?.correctAnswers ?? 0;
  const isComplete = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border shadow-md ${
        isComplete
          ? 'bg-gradient-to-br from-emerald-50 to-green-100/50 border-emerald-200'
          : 'bg-white/90 backdrop-blur-sm border-[#211714]/5'
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isComplete ? { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              isComplete
                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                : 'bg-gradient-to-br from-[#EF8A00] to-[#D67A00]'
            }`}
          >
            <span className="text-xl">{isComplete ? '✅' : '🎯'}</span>
          </motion.div>
          <div>
            <span className="font-bold text-[#211714] block">今日の目標</span>
            <span className="text-xs text-[#3A2F2B]/60">
              {isComplete ? '達成おめでとう！' : 'あと少し頑張ろう'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-bold ${
              isComplete ? 'text-emerald-600' : 'text-[#EF8A00]'
            }`}
          >
            {completed}
          </span>
          <span className="text-[#3A2F2B]/60 text-sm"> / {targetQuestions}問</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="h-4 bg-[#211714]/5 rounded-full overflow-hidden mb-3 shadow-inner">
        <motion.div
          className={`h-full rounded-full relative ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-[#EF8A00] via-[#FF9A1A] to-[#EF8A00]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* シャイン効果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
      </div>

      {/* 統計 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 text-sm">✓</span>
            <span className="text-xs text-[#3A2F2B]/70">
              正解率: {completed > 0 ? Math.round((correct / completed) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#EF8A00]/10 rounded-lg">
          <span className="text-[#EF8A00] text-xs font-bold">+{goal?.xpEarned ?? 0}</span>
          <span className="text-[#EF8A00]/70 text-xs">XP</span>
        </div>
      </div>

      {/* 完了メッセージ */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-4 text-center py-3 bg-emerald-100/50 rounded-xl"
        >
          <span className="text-emerald-700 font-medium text-sm">
            🎉 今日の目標達成！お疲れ様でした
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

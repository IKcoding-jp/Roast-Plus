'use client';

import { motion } from 'framer-motion';
import type { DailyGoal } from '@/lib/coffee-quiz/types';
import { getDailyGoalProgress } from '@/lib/coffee-quiz/gamification';

interface DailyGoalProgressProps {
  goal: DailyGoal | null;
  targetQuestions: number;
}

// シンプルなターゲットアイコン
const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// チェックアイコン
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border ${
        isComplete
          ? 'bg-success-subtle border-emerald-500/30'
          : 'bg-surface border-edge'
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isComplete
              ? 'bg-emerald-600 text-white'
              : 'bg-spot-subtle text-spot'
          }`}>
            {isComplete ? <CheckIcon /> : <TargetIcon />}
          </div>
          <div>
            <span className={`font-semibold text-sm block ${
              isComplete ? 'text-emerald-800' : 'text-ink'
            }`}>今日の目標</span>
            <span className={`text-[11px] ${
              isComplete ? 'text-emerald-700' : 'text-ink-muted'
            }`}>
              {isComplete ? '達成' : 'あと少し'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-base font-bold ${
            isComplete ? 'text-emerald-700' : 'text-ink'
          }`}>
            {completed}
          </span>
          <span className={`text-sm ${
            isComplete ? 'text-emerald-500/70' : 'text-ink-muted'
          }`}> / {targetQuestions}</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className={`h-2 rounded-full overflow-hidden mb-2.5 ${
        isComplete ? 'bg-emerald-500/20' : 'bg-edge'
      }`}>
        <motion.div
          className={`h-full rounded-full ${
            isComplete ? 'bg-emerald-600' : 'bg-spot'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* 統計 */}
      <div className="flex items-center justify-between text-xs">
        <span className={isComplete ? 'text-emerald-700' : 'text-ink-muted'}>
          正解率 {completed > 0 ? Math.round((correct / completed) * 100) : 0}%
        </span>
        <span className={`font-medium ${
          isComplete ? 'text-emerald-700' : 'text-spot'
        }`}>
          +{goal?.xpEarned ?? 0} XP
        </span>
      </div>

      {/* 完了メッセージ */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center py-2 bg-emerald-500/15 rounded-lg"
        >
          <span className="text-emerald-800 font-medium text-xs">
            今日の目標達成
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

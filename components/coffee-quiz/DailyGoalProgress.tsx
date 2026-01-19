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
          ? 'bg-[#FFF5E6] border-[#EF8A00]/30'
          : 'bg-white border-[#211714]/5'
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isComplete
              ? 'bg-[#EF8A00] text-white'
              : 'bg-[#FDF8F0] text-[#EF8A00]'
          }`}>
            {isComplete ? <CheckIcon /> : <TargetIcon />}
          </div>
          <div>
            <span className={`font-semibold text-sm block ${
              isComplete ? 'text-[#B36800]' : 'text-[#211714]'
            }`}>今日の目標</span>
            <span className={`text-[11px] ${
              isComplete ? 'text-[#D67A00]' : 'text-[#3A2F2B]/60'
            }`}>
              {isComplete ? '達成' : 'あと少し'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-base font-bold ${
            isComplete ? 'text-[#D67A00]' : 'text-[#211714]'
          }`}>
            {completed}
          </span>
          <span className={`text-sm ${
            isComplete ? 'text-[#EF8A00]/70' : 'text-[#3A2F2B]/50'
          }`}> / {targetQuestions}</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className={`h-2 rounded-full overflow-hidden mb-2.5 ${
        isComplete ? 'bg-[#EF8A00]/20' : 'bg-[#211714]/10'
      }`}>
        <motion.div
          className={`h-full rounded-full ${
            isComplete ? 'bg-[#EF8A00]' : 'bg-[#EF8A00]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* 統計 */}
      <div className="flex items-center justify-between text-xs">
        <span className={isComplete ? 'text-[#D67A00]' : 'text-[#3A2F2B]/60'}>
          正解率 {completed > 0 ? Math.round((correct / completed) * 100) : 0}%
        </span>
        <span className={`font-medium ${
          isComplete ? 'text-[#D67A00]' : 'text-[#EF8A00]'
        }`}>
          +{goal?.xpEarned ?? 0} XP
        </span>
      </div>

      {/* 完了メッセージ */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center py-2 bg-[#EF8A00]/15 rounded-lg"
        >
          <span className="text-[#B36800] font-medium text-xs">
            今日の目標達成
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

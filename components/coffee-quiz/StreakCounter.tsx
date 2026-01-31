'use client';

import { motion } from 'framer-motion';
import type { StreakInfo } from '@/lib/coffee-quiz/types';
import { isStreakAtRisk } from '@/lib/coffee-quiz/gamification';

interface StreakCounterProps {
  streak: StreakInfo;
  compact?: boolean;
}

// シンプルな炎アイコン
const FlameIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export function StreakCounter({ streak, compact = false }: StreakCounterProps) {
  const isAtRisk = isStreakAtRisk(streak);
  const hasStreak = streak.currentStreak > 0;

  if (compact) {
    return (
      <div className={`bg-white rounded-xl p-3 border ${
        isAtRisk ? 'border-[#EF8A00] bg-[#EF8A00]/5' : 'border-gray-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
            hasStreak
              ? 'bg-[#EF8A00] text-white'
              : 'bg-[#211714]/5 text-[#3A2F2B]/40'
          }`}>
            <FlameIcon active={hasStreak} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${
                isAtRisk ? 'text-[#EF8A00]' : hasStreak ? 'text-[#211714]' : 'text-[#3A2F2B]/40'
              }`}>
                {streak.currentStreak}
              </span>
              <span className="text-xs text-[#3A2F2B]/60">日連続</span>
            </div>
            {isAtRisk && (
              <span className="text-[10px] text-[#EF8A00] font-medium">今日やろう</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border ${
        isAtRisk
          ? 'bg-[#EF8A00]/5 border-[#EF8A00]/20'
          : 'bg-white border-[#211714]/5'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* 炎アイコン */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          hasStreak
            ? 'bg-[#EF8A00] text-white'
            : 'bg-[#211714]/5 text-[#3A2F2B]/40'
        }`}>
          <FlameIcon active={hasStreak} />
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={streak.currentStreak}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-2xl font-bold ${
                isAtRisk ? 'text-[#EF8A00]' : 'text-[#211714]'
              }`}
            >
              {streak.currentStreak}
            </motion.span>
            <span className="text-[#3A2F2B]/60 text-sm">日連続</span>
          </div>

          {isAtRisk && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 px-2.5 py-1 bg-[#EF8A00]/10 rounded-md inline-block"
            >
              <span className="text-[#D67A00] font-medium text-xs">
                今日クイズをしないとストリークが切れます
              </span>
            </motion.div>
          )}

          {streak.longestStreak > streak.currentStreak && !isAtRisk && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[#3A2F2B]/50 text-xs">
                最長記録: {streak.longestStreak}日
              </span>
            </div>
          )}

          {streak.currentStreak >= streak.longestStreak && streak.currentStreak > 0 && (
            <div className="mt-1.5 px-2.5 py-1 bg-[#211714]/5 rounded-md inline-block">
              <span className="text-[#3A2F2B] text-xs font-medium">
                自己ベスト更新中
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import type { StreakInfo } from '@/lib/coffee-quiz/types';
import { isStreakAtRisk } from '@/lib/coffee-quiz/gamification';

interface StreakCounterProps {
  streak: StreakInfo;
  compact?: boolean;
}

export function StreakCounter({ streak, compact = false }: StreakCounterProps) {
  const isAtRisk = isStreakAtRisk(streak);

  if (compact) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-3 border shadow-sm ${
        isAtRisk
          ? 'border-orange-300 bg-orange-50/50'
          : 'border-[#211714]/5'
      }`}>
        <div className="flex items-center gap-3">
          <motion.div
            animate={streak.currentStreak > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
              streak.currentStreak > 0
                ? 'bg-gradient-to-br from-orange-400 to-red-500'
                : 'bg-[#211714]/10'
            }`}
          >
            <span className="text-xl">{streak.currentStreak > 0 ? '🔥' : '❄️'}</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${
                isAtRisk ? 'text-orange-500' : 'text-[#EF8A00]'
              }`}>
                {streak.currentStreak}
              </span>
              <span className="text-xs text-[#3A2F2B]/60">日連続</span>
            </div>
            {isAtRisk && (
              <span className="text-[10px] text-orange-500 font-medium">⚠️ 今日やろう！</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 border shadow-md ${
        isAtRisk
          ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
          : 'bg-gradient-to-br from-[#FDF8F0] to-[#F7F2EB] border-[#EF8A00]/10'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* 炎アイコン */}
        <motion.div
          animate={
            streak.currentStreak > 0
              ? {
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
            streak.currentStreak > 0
              ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500'
              : 'bg-[#211714]/10'
          }`}
        >
          <span className="text-4xl">{streak.currentStreak > 0 ? '🔥' : '❄️'}</span>
        </motion.div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <motion.span
              key={streak.currentStreak}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-3xl font-bold ${
                isAtRisk ? 'text-orange-500' : 'text-[#EF8A00]'
              }`}
            >
              {streak.currentStreak}
            </motion.span>
            <span className="text-[#3A2F2B]/70 text-base">日連続</span>
          </div>

          {isAtRisk && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-orange-100 rounded-lg"
            >
              <span className="text-orange-500 font-medium text-xs">
                ⚠️ 今日クイズをしないとストリークが切れます！
              </span>
            </motion.div>
          )}

          {streak.longestStreak > streak.currentStreak && !isAtRisk && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[#d4af37] text-sm">👑</span>
              <span className="text-[#3A2F2B]/60 text-xs">
                最長記録: {streak.longestStreak}日
              </span>
            </div>
          )}

          {streak.currentStreak >= streak.longestStreak && streak.currentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2 px-3 py-1 bg-[#d4af37]/10 rounded-lg"
            >
              <span className="text-[#d4af37] text-sm">👑</span>
              <span className="text-[#d4af37] text-xs font-medium">
                自己ベスト更新中！
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

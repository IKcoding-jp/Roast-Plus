'use client';

import { motion } from 'framer-motion';
import type { LevelInfo } from '@/lib/coffee-quiz/types';

interface LevelDisplayProps {
  level: LevelInfo;
  compact?: boolean;
}

export function LevelDisplay({ level, compact = false }: LevelDisplayProps) {
  const progress =
    level.xpToNextLevel > 0
      ? (level.currentXP / level.xpToNextLevel) * 100
      : 100;

  if (compact) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-[#211714]/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF8A00] to-[#D67A00] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">{level.level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#211714]">Lv.{level.level}</span>
              <span className="text-xs text-[#3A2F2B]/60">{level.currentXP}/{level.xpToNextLevel}</span>
            </div>
            <div className="h-2 bg-[#211714]/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#EF8A00] to-[#FF9A1A] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-[#FDF8F0] to-[#F7F2EB] rounded-2xl p-5 border border-[#EF8A00]/10 shadow-md"
    >
      <div className="flex items-center gap-4">
        {/* レベルバッジ */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-18 h-18 rounded-full bg-gradient-to-br from-[#EF8A00] via-[#FF9A1A] to-[#D67A00] flex items-center justify-center shadow-[0_4px_20px_rgba(239,138,0,0.3)]"
          >
            {/* インナーリング */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#211714] to-[#3A2F2B] flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{level.level}</span>
            </div>
          </motion.div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-[#EF8A00] text-xs font-bold px-3 py-0.5 rounded-full shadow-md border border-[#EF8A00]/20">
            Lv.
          </span>
        </div>

        {/* XP情報 */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[#3A2F2B]/70 text-sm">次のレベルまで</span>
            <span className="text-[#EF8A00] font-bold">
              {level.xpToNextLevel - level.currentXP} XP
            </span>
          </div>

          {/* プログレスバー */}
          <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border border-[#211714]/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#EF8A00] via-[#FF9A1A] to-[#EF8A00] rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* シャイン効果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-[#3A2F2B]/60">
            <span>{level.currentXP} XP</span>
            <span>累計 {level.totalXP} XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

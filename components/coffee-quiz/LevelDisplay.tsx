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
      <div className="bg-surface rounded-xl p-3 border border-edge">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-spot flex items-center justify-center text-white font-bold text-sm">
            {level.level}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-ink">Lv.{level.level}</span>
              <span className="text-xs text-ink-muted">{level.currentXP}/{level.xpToNextLevel}</span>
            </div>
            <div className="h-1.5 bg-edge rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-spot rounded-full"
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl p-4 border border-edge"
    >
      <div className="flex items-center gap-4">
        {/* レベルバッジ */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-spot flex items-center justify-center">
            <span className="text-white font-bold text-xl">{level.level}</span>
          </div>
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-spot-subtle text-ink-sub text-[10px] font-medium px-2 py-0.5 rounded-full">
            Lv.
          </span>
        </div>

        {/* XP情報 */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-ink-muted text-xs">次のレベルまで</span>
            <span className="text-ink font-semibold text-sm">
              {level.xpToNextLevel - level.currentXP} XP
            </span>
          </div>

          {/* プログレスバー */}
          <div className="h-2 bg-edge rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-spot rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[11px] text-ink-muted">
            <span>{level.currentXP} XP</span>
            <span>累計 {level.totalXP} XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

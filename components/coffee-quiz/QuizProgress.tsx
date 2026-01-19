'use client';

import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* 問題番号 */}
      <span className="text-white font-bold text-sm whitespace-nowrap">
        {current} / {total}
      </span>

      {/* プログレスバー */}
      <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

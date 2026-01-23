'use client';

import { motion } from 'framer-motion';

interface MasteryLabelProps {
  mastery: number; // 0-100
}

/**
 * 王冠アイコン
 */
function CrownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="flex-shrink-0"
    >
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

/**
 * マスターラベルコンポーネント
 * 定着率67%以上で「マスター」ラベルを表示
 * 67%未満は何も表示しない
 * ゴールド＆王冠デザインで高級感を演出
 */
export function MasteryLabel({ mastery }: MasteryLabelProps) {
  if (mastery < 67) {
    return null;
  }

  return (
    <motion.span
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full
                 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400
                 text-amber-900 font-semibold border border-amber-500/50 shadow-sm"
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      style={{ backgroundSize: '200% 100%' }}
    >
      <CrownIcon />
      マスター
    </motion.span>
  );
}

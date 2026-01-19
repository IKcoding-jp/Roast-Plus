'use client';

import { motion } from 'framer-motion';

interface MasteryDisplayProps {
  mastery: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * 定着率の色を取得
 * 0-33%: 赤系（学習中）
 * 34-66%: 黄/オレンジ系（定着中）
 * 67-100%: 緑系（定着済み）
 */
function getMasteryColor(mastery: number): {
  bg: string;
  bar: string;
  text: string;
  label: string;
} {
  if (mastery >= 67) {
    return {
      bg: 'bg-green-100',
      bar: 'bg-green-500',
      text: 'text-green-600',
      label: '定着済み',
    };
  }
  if (mastery >= 34) {
    return {
      bg: 'bg-amber-100',
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      label: '定着中',
    };
  }
  return {
    bg: 'bg-red-100',
    bar: 'bg-red-400',
    text: 'text-red-500',
    label: '学習中',
  };
}

/**
 * 定着率表示コンポーネント（フル版）
 * プログレスバーとパーセンテージを表示
 */
export function MasteryDisplay({
  mastery,
  size = 'md',
  showLabel = false,
}: MasteryDisplayProps) {
  const sizeConfig = {
    sm: {
      container: 'w-20',
      bar: 'h-1.5',
      text: 'text-[10px]',
      gap: 'gap-1',
    },
    md: {
      container: 'w-24',
      bar: 'h-2',
      text: 'text-xs',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'w-32',
      bar: 'h-2.5',
      text: 'text-sm',
      gap: 'gap-2',
    },
  };

  const config = sizeConfig[size];
  const color = getMasteryColor(mastery);

  return (
    <div className={`flex flex-col ${config.gap}`}>
      <div className={`flex items-center gap-1.5 ${config.container}`}>
        {/* プログレスバー */}
        <div className={`flex-1 ${config.bar} rounded-full overflow-hidden ${color.bg}`}>
          <motion.div
            className={`h-full rounded-full ${color.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${mastery}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        {/* パーセンテージ */}
        <span className={`${config.text} ${color.text} font-medium tabular-nums min-w-[2.5em] text-right`}>
          {mastery}%
        </span>
      </div>
      {showLabel && (
        <span className={`${config.text} ${color.text}`}>
          {color.label}
        </span>
      )}
    </div>
  );
}

/**
 * コンパクト版定着率表示
 * 問題一覧などで使用
 */
export function MasteryCompact({ mastery }: { mastery: number }) {
  const color = getMasteryColor(mastery);

  return (
    <div className="flex items-center gap-1">
      {/* 小さいプログレスバー */}
      <div className={`w-10 h-1.5 rounded-full overflow-hidden ${color.bg}`}>
        <div
          className={`h-full rounded-full ${color.bar}`}
          style={{ width: `${mastery}%` }}
        />
      </div>
      {/* パーセンテージ */}
      <span className={`text-[10px] ${color.text} font-medium tabular-nums min-w-[2em] text-right`}>
        {mastery}%
      </span>
    </div>
  );
}

/**
 * カテゴリ全体の平均定着率表示
 */
export function CategoryMasteryDisplay({
  averageMastery,
  totalQuestions,
}: {
  averageMastery: number;
  totalQuestions: number;
}) {
  const color = getMasteryColor(averageMastery);

  return (
    <div className="mt-1.5">
      <div className="h-1 rounded-full overflow-hidden bg-[#211714]/10">
        <motion.div
          className={`h-full rounded-full ${color.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${averageMastery}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-[10px] block mt-1 text-[#3A2F2B]/60">
        定着率 {averageMastery}%（{totalQuestions}問）
      </span>
    </div>
  );
}

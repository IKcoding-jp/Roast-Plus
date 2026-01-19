'use client';

import { motion } from 'framer-motion';

// インラインSVGアイコン
const CheckIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface CheckmarkDisplayProps {
  blueCheck: number;  // 0-3
  redCheck?: number;  // 0-3
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

/**
 * チェックマーク表示コンポーネント
 * 青チェック（正解履歴）または赤チェック（不正解履歴）を表示
 *
 * 表示例:
 * [✓✓_]  → 青2
 * [✓✓✓]  → 青3
 * [✗✗_]  → 赤2
 * [___]  → 0
 */
export function CheckmarkDisplay({
  blueCheck,
  redCheck = 0,
  size = 'md',
  showLabels = false,
}: CheckmarkDisplayProps) {
  const sizeConfig = {
    sm: {
      container: 'gap-0.5',
      box: 'w-4 h-4',
      icon: 10,
    },
    md: {
      container: 'gap-1',
      box: 'w-5 h-5',
      icon: 12,
    },
    lg: {
      container: 'gap-1.5',
      box: 'w-6 h-6',
      icon: 14,
    },
  };

  const config = sizeConfig[size];

  // 青チェックがある場合は青、なければ赤チェックを表示
  const isBlue = blueCheck > 0;
  const activeCount = isBlue ? blueCheck : redCheck;

  const renderChecks = () => {
    const maxChecks = 3;
    const checks = [];

    for (let i = 0; i < maxChecks; i++) {
      const isActive = i < activeCount;

      // 青の場合
      if (isBlue && isActive) {
        checks.push(
          <motion.div
            key={`check-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
            className={`${config.box} bg-blue-500 border-blue-400 border rounded-sm flex items-center justify-center`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <CheckIcon size={config.icon} className="text-white" />
            </motion.div>
          </motion.div>
        );
      }
      // 赤の場合
      else if (!isBlue && isActive) {
        checks.push(
          <motion.div
            key={`check-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
            className={`${config.box} bg-red-500 border-red-400 border rounded-sm flex items-center justify-center`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <XIcon size={config.icon} className="text-white" />
            </motion.div>
          </motion.div>
        );
      }
      // 空のボックス
      else {
        checks.push(
          <motion.div
            key={`check-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
            className={`${config.box} bg-[#211714]/5 border-[#211714]/10 border rounded-sm flex items-center justify-center`}
          />
        );
      }
    }

    return checks;
  };

  return (
    <div className="flex items-center gap-1">
      {showLabels && (
        <span className={`text-xs mr-1 ${isBlue ? 'text-blue-400' : redCheck > 0 ? 'text-red-400' : 'text-[#3A2F2B]/40'}`}>
          {isBlue ? '正解' : redCheck > 0 ? '不正解' : '-'}
        </span>
      )}
      <div className={`flex ${config.container}`}>
        {renderChecks()}
      </div>
    </div>
  );
}

/**
 * コンパクト版チェックマーク表示
 * 3つのボックスを表示（青/赤/空）
 */
export function CheckmarkCompact({
  blueCheck,
  redCheck = 0,
}: {
  blueCheck: number;
  redCheck?: number;
}) {
  const isBlue = blueCheck > 0;
  const activeCount = isBlue ? blueCheck : redCheck;
  const maxChecks = 3;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxChecks }).map((_, i) => {
        const isActive = i < activeCount;

        if (isBlue && isActive) {
          return (
            <div
              key={i}
              className="w-3 h-3 bg-blue-500 border border-blue-400 rounded-sm flex items-center justify-center"
            >
              <CheckIcon size={8} className="text-white" />
            </div>
          );
        }

        if (!isBlue && isActive) {
          return (
            <div
              key={i}
              className="w-3 h-3 bg-red-500 border border-red-400 rounded-sm flex items-center justify-center"
            >
              <XIcon size={8} className="text-white" />
            </div>
          );
        }

        return (
          <div
            key={i}
            className="w-3 h-3 bg-[#211714]/5 border border-[#211714]/10 rounded-sm"
          />
        );
      })}
    </div>
  );
}

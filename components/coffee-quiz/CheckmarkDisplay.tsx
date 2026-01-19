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

interface CheckmarkDisplayProps {
  blueCheck: number;  // 0-3
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

/**
 * チェックマーク表示コンポーネント
 * 青チェック（正解履歴）を表示
 *
 * 表示例:
 * [✓✓_]  → 青2
 * [✓✓✓]  → 青3
 */
export function CheckmarkDisplay({
  blueCheck,
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

  const renderChecks = (count: number) => {
    const maxChecks = 3;
    const checks = [];

    for (let i = 0; i < maxChecks; i++) {
      const isActive = i < count;
      const bgColor = isActive ? 'bg-blue-500' : 'bg-neutral-700/50';
      const borderColor = isActive ? 'border-blue-400' : 'border-neutral-600';

      checks.push(
        <motion.div
          key={`blue-${i}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
          className={`${config.box} ${bgColor} ${borderColor} border rounded-sm flex items-center justify-center`}
        >
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <CheckIcon
                size={config.icon}
                className="text-white"
              />
            </motion.div>
          )}
        </motion.div>
      );
    }

    return checks;
  };

  return (
    <div className="flex items-center gap-1">
      {showLabels && (
        <span className="text-xs text-blue-400 mr-1">正解</span>
      )}
      <div className={`flex ${config.container}`}>
        {renderChecks(blueCheck)}
      </div>
    </div>
  );
}

/**
 * コンパクト版チェックマーク表示
 * 数字のみを表示
 */
export function CheckmarkCompact({
  blueCheck,
}: {
  blueCheck: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {blueCheck > 0 ? (
        <span className="flex items-center gap-0.5 text-blue-400">
          <CheckIcon size={12} />
          {blueCheck}
        </span>
      ) : (
        <span className="text-neutral-500">-</span>
      )}
    </div>
  );
}

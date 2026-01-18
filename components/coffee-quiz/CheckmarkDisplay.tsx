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
  redCheck: number;   // 0-3
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

/**
 * チェックマーク表示コンポーネント
 * 青チェック（正解履歴）と赤チェック（間違い履歴）を表示
 *
 * 表示例:
 * [✓✓_] [___]  → 青2、赤0
 * [___] [✗✗✗]  → 青0、赤3
 */
export function CheckmarkDisplay({
  blueCheck,
  redCheck,
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

  const renderChecks = (count: number, type: 'blue' | 'red') => {
    const maxChecks = 3;
    const checks = [];

    for (let i = 0; i < maxChecks; i++) {
      const isActive = i < count;
      const bgColor = isActive
        ? type === 'blue'
          ? 'bg-blue-500'
          : 'bg-red-500'
        : 'bg-neutral-700/50';
      const borderColor = isActive
        ? type === 'blue'
          ? 'border-blue-400'
          : 'border-red-400'
        : 'border-neutral-600';

      checks.push(
        <motion.div
          key={`${type}-${i}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`
            ${config.box}
            ${bgColor}
            border ${borderColor}
            rounded-sm
            flex items-center justify-center
            transition-colors duration-200
          `}
        >
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {type === 'blue' ? (
                <CheckIcon
                  size={config.icon}
                  className="text-white"
                />
              ) : (
                <XIcon
                  size={config.icon}
                  className="text-white"
                />
              )}
            </motion.div>
          )}
        </motion.div>
      );
    }

    return checks;
  };

  return (
    <div className="flex items-center gap-2">
      {/* 青チェック（正解） */}
      <div className="flex items-center gap-1">
        {showLabels && (
          <span className="text-xs text-blue-400 mr-1">正解</span>
        )}
        <div className={`flex ${config.container}`}>
          {renderChecks(blueCheck, 'blue')}
        </div>
      </div>

      {/* 赤チェック（間違い） */}
      <div className="flex items-center gap-1">
        {showLabels && (
          <span className="text-xs text-red-400 mr-1">間違</span>
        )}
        <div className={`flex ${config.container}`}>
          {renderChecks(redCheck, 'red')}
        </div>
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
  redCheck,
}: {
  blueCheck: number;
  redCheck: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {blueCheck > 0 && (
        <span className="flex items-center gap-0.5 text-blue-400">
          <CheckIcon size={12} />
          {blueCheck}
        </span>
      )}
      {redCheck > 0 && (
        <span className="flex items-center gap-0.5 text-red-400">
          <XIcon size={12} />
          {redCheck}
        </span>
      )}
      {blueCheck === 0 && redCheck === 0 && (
        <span className="text-neutral-500">-</span>
      )}
    </div>
  );
}

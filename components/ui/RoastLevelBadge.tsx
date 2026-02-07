'use client';

import { forwardRef } from 'react';

/**
 * 焙煎度を表示する専用バッジコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <RoastLevelBadge level="深煎り" />
 * <RoastLevelBadge level="中深煎り" />
 * <RoastLevelBadge level="中煎り" />
 * <RoastLevelBadge level="浅煎り" />
 *
 * @example
 * // サイズ指定
 * <RoastLevelBadge level="深煎り" size="sm" />
 * <RoastLevelBadge level="深煎り" size="md" />
 * <RoastLevelBadge level="深煎り" size="lg" />
 */

export type RoastLevel = '深煎り' | '中深煎り' | '中煎り' | '浅煎り';

export interface RoastLevelBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** 焙煎度 */
  level: RoastLevel | string;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
}

// 焙煎度ごとの背景色（コーヒー豆の色を再現）
const ROAST_COLORS: Record<string, { bg: string; text: string }> = {
  '深煎り': { bg: '#120C0A', text: '#FFFFFF' },
  '中深煎り': { bg: '#4E3526', text: '#FFFFFF' },
  '中煎り': { bg: '#745138', text: '#FFFFFF' },
  '浅煎り': { bg: '#C78F5D', text: '#FFFFFF' },
};

// デフォルトの色（不明な焙煎度の場合）
const DEFAULT_COLOR = { bg: '#6B7280', text: '#FFFFFF' };

export const RoastLevelBadge = forwardRef<HTMLSpanElement, RoastLevelBadgeProps>(
  ({ level, size = 'md', className = '', ...props }, ref) => {
    // サイズスタイル
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-[9px]',
      md: 'px-3 py-1 text-xs',
      lg: 'px-4 py-1.5 text-sm',
    };

    // 焙煎度の色を取得
    const colors = ROAST_COLORS[level] || DEFAULT_COLOR;

    const badgeStyles = [
      'inline-flex items-center font-bold rounded-full uppercase tracking-wider',
      sizeStyles[size],
      'shadow-sm',
      className,
    ].filter(Boolean).join(' ');

    return (
      <span
        ref={ref}
        className={badgeStyles}
        style={{ backgroundColor: colors.bg, color: colors.text }}
        {...props}
      >
        {level}
      </span>
    );
  }
);

RoastLevelBadge.displayName = 'RoastLevelBadge';

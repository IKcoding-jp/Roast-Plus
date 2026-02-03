'use client';

import { forwardRef } from 'react';

/**
 * プログレスバーコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <ProgressBar value={75} />
 *
 * @example
 * // ラベル付き
 * <ProgressBar value={75} label="進捗" showValue />
 *
 * @example
 * // バリアントとサイズ
 * <ProgressBar value={50} variant="success" size="lg" />
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <ProgressBar value={80} isChristmasMode={isChristmasMode} />
 */

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 進捗値（0-100） */
  value: number;
  /** 最大値（デフォルト: 100） */
  max?: number;
  /** バーのスタイルバリエーション */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'coffee';
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ラベルテキスト */
  label?: string;
  /** 値を表示するか */
  showValue?: boolean;
  /** アニメーション有効 */
  animated?: boolean;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      variant = 'primary',
      size = 'md',
      label,
      showValue = false,
      animated = true,
      isChristmasMode = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // サイズスタイル
    const sizeStyles = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    // 通常モードのバリアントスタイル（バーの色）
    const normalBarStyles = {
      default: 'bg-gray-500',
      primary: 'bg-amber-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      coffee: 'bg-[#211714]',
    };

    // クリスマスモードのバリアントスタイル
    const christmasBarStyles = {
      default: 'bg-[#f8f1e7]/50',
      primary: 'bg-[#d4af37]',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      coffee: 'bg-[#211714]',
    };

    const barStyles = isChristmasMode ? christmasBarStyles : normalBarStyles;

    // トラック（背景）スタイル
    const trackStyles = isChristmasMode
      ? 'bg-white/10'
      : 'bg-gray-200';

    // ラベルスタイル
    const labelStyles = isChristmasMode
      ? 'text-[#f8f1e7]'
      : 'text-gray-700';

    const valueStyles = isChristmasMode
      ? 'text-[#f8f1e7]/70'
      : 'text-gray-500';

    return (
      <div ref={ref} className={className} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1">
            {label && (
              <span className={`text-sm font-medium ${labelStyles}`}>{label}</span>
            )}
            {showValue && (
              <span className={`text-sm ${valueStyles}`}>{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div
          className={`w-full rounded-full overflow-hidden ${trackStyles} ${sizeStyles[size]}`}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`h-full rounded-full ${barStyles[variant]} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

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

    // バリアントスタイル（バーの色）
    const barStyles = {
      default: 'bg-ink-muted',
      primary: 'bg-spot',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      coffee: 'bg-[#211714]',
    };

    return (
      <div ref={ref} className={className} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1">
            {label && (
              <span className="text-sm font-medium text-ink">{label}</span>
            )}
            {showValue && (
              <span className="text-sm text-ink-sub">{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div
          className={`w-full rounded-full overflow-hidden bg-ground ${sizeStyles[size]}`}
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

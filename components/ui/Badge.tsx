'use client';

import { forwardRef } from 'react';

/**
 * 統一されたバッジ（ラベル/タグ）コンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Badge>新着</Badge>
 *
 * @example
 * // バリアント
 * <Badge variant="primary">プライマリ</Badge>
 * <Badge variant="success">完了</Badge>
 * <Badge variant="warning">注意</Badge>
 * <Badge variant="danger">エラー</Badge>
 * <Badge variant="coffee">コーヒー</Badge>
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** バッジのスタイルバリエーション */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'coffee';
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    // サイズスタイル
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // CSS変数ベースの統一バリアントスタイル
    const variantStyles = {
      default: 'bg-ground text-ink',
      primary: 'bg-spot-subtle text-spot',
      secondary: 'bg-ground text-ink',
      success: 'bg-success-subtle text-success',
      warning: 'bg-warning-subtle text-warning',
      danger: 'bg-danger-subtle text-danger',
      coffee: 'bg-[#211714] text-white',
    };

    const badgeStyles = [
      'inline-flex items-center font-medium rounded-full',
      sizeStyles[size],
      variantStyles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={badgeStyles} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

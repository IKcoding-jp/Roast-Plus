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
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Badge variant="primary" isChristmasMode={isChristmasMode}>
 *   セール中
 * </Badge>
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** バッジのスタイルバリエーション */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'coffee';
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', isChristmasMode = false, className = '', children, ...props }, ref) => {
    // サイズスタイル
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // 通常モードのバリアントスタイル
    const normalVariantStyles = {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-amber-100 text-amber-800',
      secondary: 'bg-gray-200 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      coffee: 'bg-[#211714] text-white',
    };

    // クリスマスモードのバリアントスタイル
    const christmasVariantStyles = {
      default: 'bg-white/10 text-[#f8f1e7]',
      primary: 'bg-[#d4af37]/20 text-[#d4af37]',
      secondary: 'bg-white/20 text-[#f8f1e7]',
      success: 'bg-green-900/50 text-green-300',
      warning: 'bg-yellow-900/50 text-yellow-300',
      danger: 'bg-red-900/50 text-red-300',
      coffee: 'bg-[#211714] text-white border border-[#d4af37]/30',
    };

    const variantStyles = isChristmasMode ? christmasVariantStyles : normalVariantStyles;

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

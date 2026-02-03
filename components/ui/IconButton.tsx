'use client';

import { forwardRef } from 'react';

/**
 * アイコンボタンコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <IconButton onClick={handleClose} aria-label="閉じる">
 *   <HiX className="w-5 h-5" />
 * </IconButton>
 *
 * @example
 * // サイズバリエーション
 * <IconButton size="sm"><MdAdd /></IconButton>
 * <IconButton size="md"><MdAdd /></IconButton>
 * <IconButton size="lg"><MdAdd /></IconButton>
 *
 * @example
 * // バリアントとクリスマスモード
 * <IconButton variant="danger" isChristmasMode={isChristmasMode}>
 *   <MdDelete />
 * </IconButton>
 */

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのスタイルバリエーション */
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'ghost';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 丸いボタン（完全な円形） */
  rounded?: boolean;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      rounded = false,
      isChristmasMode = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // サイズスタイル
    const sizeStyles = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    // 通常モードのバリアントスタイル
    const normalVariantStyles = {
      default: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      primary: 'text-primary hover:text-primary-dark hover:bg-primary/10',
      danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
      success: 'text-green-500 hover:text-green-700 hover:bg-green-50',
      ghost: 'text-gray-400 hover:text-gray-600 hover:bg-gray-50',
    };

    // クリスマスモードのバリアントスタイル
    const christmasVariantStyles = {
      default: 'text-[#f8f1e7]/70 hover:text-[#f8f1e7] hover:bg-white/10',
      primary: 'text-[#d4af37] hover:text-[#e8c65f] hover:bg-[#d4af37]/10',
      danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
      success: 'text-green-400 hover:text-green-300 hover:bg-green-500/10',
      ghost: 'text-[#f8f1e7]/50 hover:text-[#f8f1e7]/70 hover:bg-white/5',
    };

    const variantStyles = isChristmasMode ? christmasVariantStyles : normalVariantStyles;

    const baseStyles = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const focusRingStyles = isChristmasMode ? 'focus:ring-[#d4af37]/50' : 'focus:ring-amber-500/50';
    const borderRadiusStyles = rounded ? 'rounded-full' : 'rounded-lg';
    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const buttonStyles = [
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      borderRadiusStyles,
      focusRingStyles,
      disabled ? disabledStyles : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

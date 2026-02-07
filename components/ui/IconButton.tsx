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
 * // バリアント
 * <IconButton variant="danger">
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
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      rounded = false,
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

    // バリアントスタイル（CSS変数ベース）
    const variantStyles = {
      default: 'text-ink-sub hover:text-ink hover:bg-ground',
      primary: 'text-spot hover:text-spot-hover hover:bg-spot-surface',
      danger: 'text-danger hover:text-danger/80 hover:bg-danger-subtle',
      success: 'text-success hover:text-success/80 hover:bg-success-subtle',
      ghost: 'text-ink-muted hover:text-ink-sub hover:bg-ground',
    };

    const baseStyles = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const focusRingStyles = 'focus:ring-spot/50';
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

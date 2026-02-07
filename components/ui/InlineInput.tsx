'use client';

import { forwardRef } from 'react';

/**
 * インライン編集用の軽量入力コンポーネント
 * テーブルセルやヘッダー内での編集に最適化
 *
 * @example
 * // テーブルヘッダー内での使用
 * <InlineInput
 *   value={teamName}
 *   onChange={(e) => setTeamName(e.target.value)}
 *   onKeyDown={(e) => e.key === 'Enter' && save()}
 *   autoFocus
 * />
 *
 * @example
 * // ダークバリアント
 * <InlineInput
 *   value={value}
 *   onChange={handleChange}
 *   variant="dark"
 * />
 */

export interface InlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 背景のバリエーション */
  variant?: 'light' | 'dark';
  /** テキストの配置 */
  textAlign?: 'left' | 'center' | 'right';
}

export const InlineInput = forwardRef<HTMLInputElement, InlineInputProps>(
  (
    {
      variant = 'light',
      textAlign = 'center',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full px-2 py-1 border rounded outline-none transition-all duration-200';

    const textAlignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const variantStyles = {
      light: 'bg-field border-edge-strong text-ink focus:border-spot focus:ring-1 focus:ring-spot',
      dark: 'bg-field border-spot text-ink focus:ring-2 focus:ring-spot/20',
    };

    const inputStyles = [
      baseStyles,
      textAlignStyles[textAlign],
      variantStyles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <input
        ref={ref}
        className={inputStyles}
        {...props}
      />
    );
  }
);

InlineInput.displayName = 'InlineInput';

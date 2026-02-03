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
 * // クリスマスモード
 * <InlineInput
 *   value={value}
 *   onChange={handleChange}
 *   isChristmasMode={isChristmasMode}
 *   variant="dark"
 * />
 */

export interface InlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 背景のバリエーション */
  variant?: 'light' | 'dark';
  /** テキストの配置 */
  textAlign?: 'left' | 'center' | 'right';
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const InlineInput = forwardRef<HTMLInputElement, InlineInputProps>(
  (
    {
      variant = 'light',
      textAlign = 'center',
      isChristmasMode = false,
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

    // 通常モード - ライト背景用
    const normalLightStyles = 'bg-white border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30';

    // 通常モード - ダーク背景用
    const normalDarkStyles = 'bg-white border-amber-500 text-gray-900 focus:ring-2 focus:ring-amber-500/30';

    // クリスマスモード - ライト背景用
    const christmasLightStyles = 'bg-white/10 border-[#d4af37]/40 text-[#f8f1e7] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30';

    // クリスマスモード - ダーク背景用
    const christmasDarkStyles = 'bg-[#1a1a1a] border-[#d4af37] text-[#f8f1e7] focus:ring-2 focus:ring-[#d4af37]/30';

    const getVariantStyles = () => {
      if (isChristmasMode) {
        return variant === 'dark' ? christmasDarkStyles : christmasLightStyles;
      }
      return variant === 'dark' ? normalDarkStyles : normalLightStyles;
    };

    const inputStyles = [
      baseStyles,
      textAlignStyles[textAlign],
      getVariantStyles(),
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

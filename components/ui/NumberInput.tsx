'use client';

import { forwardRef, useId } from 'react';

/**
 * 数値入力専用コンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <NumberInput
 *   label="幅"
 *   value={width}
 *   onChange={(e) => setWidth(parseInt(e.target.value))}
 *   suffix="px"
 * />
 *
 * @example
 * // 最小値・最大値の設定
 * <NumberInput
 *   label="高さ"
 *   value={height}
 *   onChange={(e) => setHeight(parseInt(e.target.value))}
 *   min={40}
 *   max={200}
 *   suffix="px"
 * />
 *
 * @example
 * // クリスマスモード
 * <NumberInput
 *   label="設定値"
 *   isChristmasMode={isChristmasMode}
 *   value={value}
 *   onChange={handleChange}
 * />
 */

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 入力フィールドのラベル */
  label?: string;
  /** 単位などの接尾辞 */
  suffix?: string;
  /** エラーメッセージ */
  error?: string;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, suffix, error, isChristmasMode = false, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseStyles = 'rounded-lg border-2 px-4 py-2 text-lg transition-all duration-200 min-h-[44px] text-center';

    const normalStyles = 'border-gray-200 text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30';

    const christmasStyles = 'bg-white/10 border-[#d4af37]/40 text-[#f8f1e7] placeholder:text-[#f8f1e7]/50 focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20';

    const errorStyles = isChristmasMode
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
      : 'border-red-500 focus:border-red-500 focus:ring-red-100';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const inputStyles = [
      baseStyles,
      isChristmasMode ? christmasStyles : normalStyles,
      error ? errorStyles : '',
      props.disabled ? disabledStyles : '',
      suffix ? '' : 'w-full',
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = isChristmasMode
      ? 'block text-sm font-medium text-[#f8f1e7] mb-2'
      : 'block text-sm font-medium text-gray-700 mb-2';

    const suffixStyles = isChristmasMode
      ? 'text-[#f8f1e7]/70 font-bold ml-2'
      : 'text-gray-500 font-bold ml-2';

    const errorTextStyles = isChristmasMode
      ? 'text-red-400 text-sm mt-1'
      : 'text-red-500 text-sm mt-1';

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}
        <div className="flex items-center">
          <input
            ref={ref}
            id={inputId}
            type="number"
            className={inputStyles}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {suffix && (
            <span className={suffixStyles}>{suffix}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className={errorTextStyles} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

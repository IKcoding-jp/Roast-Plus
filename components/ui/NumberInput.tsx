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
 */

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 入力フィールドのラベル */
  label?: string;
  /** 単位などの接尾辞 */
  suffix?: string;
  /** エラーメッセージ */
  error?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, suffix, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseStyles = 'rounded-lg border-2 px-4 py-2 text-lg transition-all duration-200 min-h-[44px] text-center';

    const themeStyles = 'bg-field border-edge text-ink placeholder:text-ink-muted hover:border-edge-strong focus:border-spot focus:bg-field focus:outline-none focus:ring-2 focus:ring-spot-subtle';

    const errorStyles = 'border-error focus:border-error focus:ring-error-ring';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const inputStyles = [
      baseStyles,
      themeStyles,
      error ? errorStyles : '',
      props.disabled ? disabledStyles : '',
      suffix ? '' : 'w-full',
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = 'block text-sm font-medium text-ink mb-2';

    const suffixStyles = 'text-ink-sub font-bold ml-2';

    const errorTextStyles = 'text-error text-sm mt-1';

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

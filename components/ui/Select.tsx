'use client';

import { forwardRef, useId } from 'react';

/**
 * 統一されたセレクトボックスコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Select
 *   label="焙煎度"
 *   options={[
 *     { value: 'light', label: 'ライト' },
 *     { value: 'medium', label: 'ミディアム' },
 *     { value: 'dark', label: 'ダーク' },
 *   ]}
 *   value={roastLevel}
 *   onChange={(e) => setRoastLevel(e.target.value)}
 * />
 *
 * @example
 * // プレースホルダー付き
 * <Select
 *   label="産地"
 *   placeholder="選択してください"
 *   options={originOptions}
 *   value={origin}
 *   onChange={(e) => setOrigin(e.target.value)}
 * />
 *
 * @example
 * // エラー表示
 * <Select
 *   label="カテゴリ"
 *   options={categoryOptions}
 *   error="カテゴリを選択してください"
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 * />
 */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** セレクトボックスのラベル */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** 選択肢の配列 */
  options: SelectOption[];
  /** プレースホルダー（最初の空の選択肢） */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    const baseStyles = 'w-full rounded-lg border-2 px-4 py-3 text-lg transition-all duration-200 min-h-[44px] appearance-none bg-no-repeat bg-right pr-10';

    const themeStyles = 'border-edge text-ink bg-field hover:border-edge-strong focus:border-spot focus:outline-none focus:ring-2 focus:ring-spot-subtle';

    const errorStyles = 'border-error focus:border-error focus:ring-error-ring';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const selectStyles = [
      baseStyles,
      themeStyles,
      'select-icon',
      error ? errorStyles : '',
      props.disabled ? disabledStyles : '',
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = 'block text-sm font-medium text-ink mb-2';

    const errorTextStyles = 'text-error text-sm mt-1';

    const optionStyles = 'bg-overlay text-ink';

    return (
      <div>
        {label && (
          <label htmlFor={selectId} className={labelStyles}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectStyles}
            style={{ backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" className={optionStyles}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className={optionStyles}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p id={`${selectId}-error`} className={errorTextStyles} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

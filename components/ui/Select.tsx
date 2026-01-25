'use client';

import { forwardRef } from 'react';

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
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Select
 *   label="抽出方法"
 *   options={brewingMethods}
 *   isChristmasMode={isChristmasMode}
 *   value={method}
 *   onChange={(e) => setMethod(e.target.value)}
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
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, isChristmasMode = false, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'w-full rounded-lg border-2 px-4 py-3 text-lg transition-all duration-200 min-h-[44px] appearance-none bg-no-repeat bg-right pr-10';

    // ドロップダウン矢印のSVG（data URI）
    const arrowIcon = isChristmasMode
      ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")"
      : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")";

    const normalStyles = 'border-gray-200 text-gray-900 bg-white hover:border-gray-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100';

    const christmasStyles = 'bg-white/10 border-[#d4af37]/40 text-[#f8f1e7] focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20';

    const errorStyles = isChristmasMode
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
      : 'border-red-500 focus:border-red-500 focus:ring-red-100';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const selectStyles = [
      baseStyles,
      isChristmasMode ? christmasStyles : normalStyles,
      error ? errorStyles : '',
      props.disabled ? disabledStyles : '',
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = isChristmasMode
      ? 'block text-sm font-medium text-[#f8f1e7] mb-2'
      : 'block text-sm font-medium text-gray-700 mb-2';

    const errorTextStyles = isChristmasMode
      ? 'text-red-400 text-sm mt-1'
      : 'text-red-500 text-sm mt-1';

    const optionStyles = isChristmasMode
      ? 'bg-[#0a2f1a] text-[#f8f1e7]'
      : 'bg-white text-gray-900';

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
            style={{ backgroundImage: arrowIcon, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
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

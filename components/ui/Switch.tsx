'use client';

import { forwardRef, useId } from 'react';

/**
 * 統一されたスイッチ（トグル）コンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Switch
 *   label="通知"
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 * />
 *
 * @example
 * // ラベルなし（アイコンと組み合わせる場合）
 * <Switch
 *   checked={darkMode}
 *   onChange={(e) => setDarkMode(e.target.checked)}
 *   aria-label="ダークモード切替"
 * />
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Switch
 *   label="クリスマスモード"
 *   checked={isChristmasMode}
 *   onChange={toggleChristmasMode}
 *   isChristmasMode={isChristmasMode}
 * />
 */

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** スイッチのラベル */
  label?: string;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, size = 'md', isChristmasMode = false, className = '', id, disabled, checked, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    // サイズ設定
    const sizeStyles = {
      sm: { track: 'w-8 h-4', thumb: 'h-3 w-3', translate: 'translate-x-4' },
      md: { track: 'w-11 h-6', thumb: 'h-5 w-5', translate: 'translate-x-5' },
      lg: { track: 'w-14 h-7', thumb: 'h-6 w-6', translate: 'translate-x-7' },
    };

    const currentSize = sizeStyles[size];

    // トラック（背景）スタイル
    const trackStyles = isChristmasMode
      ? checked
        ? 'bg-[#d4af37]'
        : 'bg-white/20'
      : checked
        ? 'bg-amber-600'
        : 'bg-gray-300';

    // つまみスタイル
    const thumbStyles = isChristmasMode
      ? 'bg-white shadow-md'
      : 'bg-white shadow-md';

    const labelStyles = isChristmasMode
      ? 'text-[#f8f1e7] font-medium'
      : 'text-gray-900 font-medium';

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${switchId}-label` : undefined}
          onClick={() => {
            if (!disabled && props.onChange) {
              const event = {
                target: { checked: !checked },
              } as React.ChangeEvent<HTMLInputElement>;
              props.onChange(event);
            }
          }}
          className={`
            relative inline-flex shrink-0 items-center rounded-full
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isChristmasMode ? 'focus:ring-[#d4af37]/50' : 'focus:ring-amber-500/50'}
            ${currentSize.track}
            ${trackStyles}
            ${disabledStyles}
          `}
          disabled={disabled}
        >
          <span
            className={`
              inline-block rounded-full transition-transform duration-200 ease-in-out
              ${currentSize.thumb}
              ${thumbStyles}
              ${checked ? currentSize.translate : 'translate-x-0.5'}
            `}
          />
        </button>
        {/* Hidden input for form compatibility */}
        <input
          ref={ref}
          id={switchId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          {...props}
        />
        {label && (
          <label
            id={`${switchId}-label`}
            htmlFor={switchId}
            className={`${labelStyles} ${disabledStyles}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

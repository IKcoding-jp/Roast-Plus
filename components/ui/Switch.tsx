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
 */

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** スイッチのラベル */
  label?: string;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, size = 'md', className = '', id, disabled, checked, ...props }, ref) => {
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
    const trackStyles = checked
      ? 'bg-spot'
      : 'bg-edge-strong';

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
            focus:ring-spot/50
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
              bg-white shadow-md
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
          onChange={props.onChange || (() => {})}
          disabled={disabled}
        />
        {label && (
          <label
            id={`${switchId}-label`}
            htmlFor={switchId}
            className={`text-ink font-medium ${disabledStyles}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

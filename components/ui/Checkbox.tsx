'use client';

import { forwardRef, useId } from 'react';

/**
 * 統一されたチェックボックスコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Checkbox
 *   label="利用規約に同意する"
 *   checked={agreed}
 *   onChange={(e) => setAgreed(e.target.checked)}
 * />
 */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** チェックボックスのラベル */
  label?: string;
  /** ラベルの説明文 */
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const checkboxStyles = 'h-5 w-5 rounded border-2 border-edge-strong bg-field text-spot focus:ring-2 focus:ring-spot/30 focus:ring-offset-0 checked:bg-spot checked:border-spot';

    const labelStyles = 'text-ink font-medium';

    const descriptionStyles = 'text-ink-muted text-sm';

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`${checkboxStyles} ${disabledStyles} mt-0.5 transition-colors`}
          disabled={disabled}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`${labelStyles} ${disabledStyles}`}
              >
                {label}
              </label>
            )}
            {description && (
              <span className={descriptionStyles}>{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

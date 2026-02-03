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
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Checkbox
 *   label="通知を受け取る"
 *   checked={notify}
 *   onChange={(e) => setNotify(e.target.checked)}
 *   isChristmasMode={isChristmasMode}
 * />
 */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** チェックボックスのラベル */
  label?: string;
  /** ラベルの説明文 */
  description?: string;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, isChristmasMode = false, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const checkboxStyles = isChristmasMode
      ? 'h-5 w-5 rounded border-2 border-[#d4af37]/60 bg-white/10 text-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:ring-offset-0 checked:bg-[#d4af37] checked:border-[#d4af37]'
      : 'h-5 w-5 rounded border-2 border-gray-300 bg-white text-amber-600 focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-0 checked:bg-amber-600 checked:border-amber-600';

    const labelStyles = isChristmasMode
      ? 'text-[#f8f1e7] font-medium'
      : 'text-gray-900 font-medium';

    const descriptionStyles = isChristmasMode
      ? 'text-[#f8f1e7]/70 text-sm'
      : 'text-gray-500 text-sm';

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

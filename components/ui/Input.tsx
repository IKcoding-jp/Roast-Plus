'use client';

import { forwardRef } from 'react';

/**
 * 統一されたテキスト入力コンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Input
 *   label="名前"
 *   placeholder="山田太郎"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 *
 * @example
 * // エラー表示
 * <Input
 *   label="メールアドレス"
 *   type="email"
 *   error="有効なメールアドレスを入力してください"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Input
 *   label="豆の名前"
 *   isChristmasMode={isChristmasMode}
 *   value={beanName}
 *   onChange={(e) => setBeanName(e.target.value)}
 * />
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 入力フィールドのラベル */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isChristmasMode = false, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'w-full rounded-lg border-2 px-4 py-3.5 text-lg transition-all duration-200 shadow-sm min-h-[44px]';

    const normalStyles = 'border-gray-200 text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100';

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
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = isChristmasMode
      ? 'block text-sm font-medium text-[#f8f1e7] mb-2'
      : 'block text-sm font-medium text-gray-700 mb-2';

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
        <input
          ref={ref}
          id={inputId}
          className={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className={errorTextStyles} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

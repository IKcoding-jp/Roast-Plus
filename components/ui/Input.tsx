'use client';

import { forwardRef, useState, useId } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

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
  /** パスワード表示/非表示トグルを表示（type="password"時のみ有効） */
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isChristmasMode = false, showPasswordToggle = false, className = '', id, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    // パスワードトグルが有効で、元のtypeがpasswordの場合
    const isPasswordField = type === 'password' && showPasswordToggle;
    const inputType = isPasswordField && showPassword ? 'text' : type;

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

    const toggleButtonStyles = isChristmasMode
      ? 'text-[#d4af37]/70 hover:text-[#d4af37]'
      : 'text-gray-400 hover:text-gray-600';

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`${inputStyles} ${isPasswordField ? 'pr-12' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${toggleButtonStyles}`}
              aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
            >
              {showPassword ? (
                <HiEyeOff className="h-5 w-5" />
              ) : (
                <HiEye className="h-5 w-5" />
              )}
            </button>
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

Input.displayName = 'Input';

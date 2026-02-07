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
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 入力フィールドのラベル */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** パスワード表示/非表示トグルを表示（type="password"時のみ有効） */
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, showPasswordToggle = false, className = '', id, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    // パスワードトグルが有効で、元のtypeがpasswordの場合
    const isPasswordField = type === 'password' && showPasswordToggle;
    const inputType = isPasswordField && showPassword ? 'text' : type;

    const baseStyles = 'w-full rounded-lg border-2 px-4 py-3.5 text-lg transition-all duration-200 shadow-sm min-h-[44px]';

    const themeStyles = 'bg-field border-edge text-ink placeholder:text-ink-muted hover:border-edge-strong focus:border-spot focus:bg-field focus:outline-none focus:ring-2 focus:ring-spot-subtle';

    const errorStyles = 'border-error focus:border-error focus:ring-error-ring';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const inputStyles = [
      baseStyles,
      themeStyles,
      error ? errorStyles : '',
      props.disabled ? disabledStyles : '',
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = 'block text-sm font-medium text-ink mb-2';

    const errorTextStyles = 'text-error text-sm mt-1';

    const toggleButtonStyles = 'text-spot/70 hover:text-spot';

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

'use client';

import { forwardRef, useId } from 'react';

/**
 * 統一されたテキストエリアコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Textarea
 *   label="メモ"
 *   placeholder="焙煎に関するメモを入力"
 *   value={memo}
 *   onChange={(e) => setMemo(e.target.value)}
 * />
 *
 * @example
 * // 行数指定
 * <Textarea
 *   label="詳細説明"
 *   rows={6}
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 * />
 *
 * @example
 * // エラー表示
 * <Textarea
 *   label="コメント"
 *   error="コメントを入力してください"
 *   value={comment}
 *   onChange={(e) => setComment(e.target.value)}
 * />
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** テキストエリアのラベル */
  label?: string;
  /** エラーメッセージ */
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const baseStyles = 'w-full rounded-lg border-2 px-4 py-3 text-lg transition-all duration-200 resize-none';

    const themeStyles = 'bg-field border-edge text-ink placeholder:text-ink-muted hover:border-edge-strong focus:border-spot focus:outline-none focus:ring-2 focus:ring-spot-subtle';

    const errorStyles = 'border-error focus:border-error focus:ring-error-ring';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const textareaStyles = [
      baseStyles,
      themeStyles,
      error ? errorStyles : '',
      props.disabled ? disabledStyles : '',
      className,
    ].filter(Boolean).join(' ');

    const labelStyles = 'block text-sm font-medium text-ink mb-2';

    const errorTextStyles = 'text-error text-sm mt-1';

    return (
      <div>
        {label && (
          <label htmlFor={textareaId} className={labelStyles}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className={errorTextStyles} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

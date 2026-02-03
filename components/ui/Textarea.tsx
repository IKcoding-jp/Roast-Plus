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
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Textarea
 *   label="テイスティングノート"
 *   isChristmasMode={isChristmasMode}
 *   value={notes}
 *   onChange={(e) => setNotes(e.target.value)}
 * />
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** テキストエリアのラベル */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, isChristmasMode = false, className = '', id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const baseStyles = 'w-full rounded-lg border-2 px-4 py-3 text-lg transition-all duration-200 resize-none';

    const normalStyles = 'border-gray-200 text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30';

    const christmasStyles = 'bg-white/10 border-[#d4af37]/40 text-[#f8f1e7] placeholder:text-[#f8f1e7]/50 focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20';

    const errorStyles = isChristmasMode
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
      : 'border-red-500 focus:border-red-500 focus:ring-red-100';

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    const textareaStyles = [
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

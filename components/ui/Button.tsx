'use client';

import { forwardRef } from 'react';

/**
 * 統一されたボタンコンポーネント
 *
 * @example
 * // プライマリボタン（デフォルト）
 * <Button onClick={handleSubmit}>送信する</Button>
 *
 * @example
 * // セカンダリボタン（キャンセル）
 * <Button variant="secondary" onClick={handleCancel}>キャンセル</Button>
 *
 * @example
 * // 危険なアクション（削除）
 * <Button variant="danger" onClick={handleDelete}>削除</Button>
 *
 * @example
 * // アウトラインボタン
 * <Button variant="outline" onClick={handleView}>詳細表示</Button>
 *
 * @example
 * // ゴーストボタン（テキストリンク風）
 * <Button variant="ghost" onClick={handleMore}>詳しく見る</Button>
 *
 * @example
 * // サイズバリエーション
 * <Button size="sm">小</Button>
 * <Button size="md">中（デフォルト）</Button>
 * <Button size="lg">大</Button>
 *
 * @example
 * // ローディング状態
 * <Button loading={isSubmitting}>送信中...</Button>
 *
 * @example
 * // フル幅
 * <Button fullWidth>フル幅ボタン</Button>
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Button isChristmasMode={isChristmasMode} onClick={handleAction}>アクション</Button>
 *
 * @example
 * // バッジ付きボタン（通知やフィルター数表示に使用）
 * <Button badge={3} onClick={handleFilter}>フィルター</Button>
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのスタイルバリエーション */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'coffee';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ローディング状態 */
  loading?: boolean;
  /** フル幅表示 */
  fullWidth?: boolean;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
  /** バッジに表示する数値（0以下の場合は非表示） */
  badge?: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      isChristmasMode = false,
      badge,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // ベーススタイル
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors min-h-[44px]';

    // サイズスタイル
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    // 通常モードのバリアントスタイル
    const normalVariantStyles = {
      primary: 'bg-amber-600 text-white hover:bg-amber-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      outline: 'border-2 border-amber-500 text-amber-600 bg-transparent hover:bg-amber-50',
      ghost: 'text-amber-600 hover:text-amber-700',
      coffee: 'bg-[#211714] text-white hover:bg-[#2d1f1b]',
    };

    // クリスマスモードのバリアントスタイル
    const christmasVariantStyles = {
      primary: 'bg-[#6d1a1a] text-white hover:bg-[#8b2323] border border-[#d4af37]/40',
      secondary: 'bg-[#3a3a3a] text-[#f8f1e7] hover:bg-[#4a4a4a]',
      danger: 'bg-red-800 text-white hover:bg-red-900',
      success: 'bg-green-800 text-white hover:bg-green-900',
      outline: 'border-2 border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37]/10',
      ghost: 'text-[#d4af37] hover:text-[#e8c65f]',
      coffee: 'bg-[#211714] text-white hover:bg-[#2d1f1b] border border-[#d4af37]/30',
    };

    const variantStyles = isChristmasMode ? christmasVariantStyles : normalVariantStyles;

    // 無効・ローディング状態のスタイル
    const disabledStyles = 'opacity-50 cursor-not-allowed';

    // フル幅スタイル
    const fullWidthStyles = fullWidth ? 'w-full' : '';

    // バッジスタイル
    const badgeStyles = isChristmasMode
      ? 'absolute -top-1.5 -right-1.5 bg-[#d4af37] text-[#1a1a1a] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white'
      : 'absolute -top-1.5 -right-1.5 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white';

    const buttonStyles = [
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      (disabled || loading) ? disabledStyles : '',
      fullWidthStyles,
      className,
    ].filter(Boolean).join(' ');

    const showBadge = badge !== undefined && badge > 0;

    return (
      <button
        ref={ref}
        className={`${buttonStyles} ${showBadge ? 'relative' : ''}`}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
        {showBadge && (
          <span className={badgeStyles} aria-label={`${badge}件`}>
            {badge}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

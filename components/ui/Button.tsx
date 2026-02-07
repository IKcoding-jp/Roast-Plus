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
 * // バッジ付きボタン（通知やフィルター数表示に使用）
 * <Button badge={3} onClick={handleFilter}>フィルター</Button>
 *
 * @example
 * // サーフェスボタン（白背景+影、フィルターや比較ボタンに使用）
 * <Button variant="surface" onClick={handleFilter}>フィルター</Button>
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのスタイルバリエーション */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'outline' | 'ghost' | 'coffee' | 'surface';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ローディング状態 */
  loading?: boolean;
  /** フル幅表示 */
  fullWidth?: boolean;
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

    // バリアントスタイル（CSS変数ベース）
    const variantStyles = {
      primary: 'bg-btn-primary text-white hover:bg-btn-primary-hover',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      danger: 'bg-danger text-white hover:bg-danger/90',
      success: 'bg-success text-white hover:bg-success/90',
      warning: 'bg-warning text-page hover:bg-warning/90',
      info: 'bg-info text-white hover:bg-info-hover',
      outline: 'border-2 border-spot text-spot bg-transparent hover:bg-spot-surface',
      ghost: 'text-spot hover:text-spot-hover',
      coffee: 'bg-[#211714] text-white hover:bg-[#2d1f1b]',
      surface: 'bg-surface text-ink shadow-card hover:bg-ground border border-edge',
    };

    // 無効・ローディング状態のスタイル
    const disabledStyles = 'opacity-50 cursor-not-allowed';

    // フル幅スタイル
    const fullWidthStyles = fullWidth ? 'w-full' : '';

    // バッジスタイル
    const badgeStyles = 'absolute -top-1.5 -right-1.5 bg-spot text-page rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white';

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

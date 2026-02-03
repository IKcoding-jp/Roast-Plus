'use client';

import { forwardRef } from 'react';

/**
 * 空状態表示コンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <EmptyState
 *   title="データがありません"
 *   description="新しいアイテムを追加してください。"
 * />
 *
 * @example
 * // アイコン付き
 * <EmptyState
 *   icon={<HiDocumentText className="h-12 w-12" />}
 *   title="記録がありません"
 *   description="焙煎記録を追加しましょう。"
 * />
 *
 * @example
 * // アクションボタン付き
 * <EmptyState
 *   title="試飲記録がありません"
 *   description="最初の記録を追加しましょう。"
 *   action={<Button onClick={handleAdd}>追加する</Button>}
 * />
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <EmptyState
 *   title="データがありません"
 *   isChristmasMode={isChristmasMode}
 * />
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** アイコン要素 */
  icon?: React.ReactNode;
  /** タイトル */
  title: string;
  /** 説明文 */
  description?: string;
  /** アクションボタン等 */
  action?: React.ReactNode;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      size = 'md',
      isChristmasMode = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // サイズスタイル
    const sizeStyles = {
      sm: {
        container: 'py-6',
        icon: 'mb-2',
        title: 'text-base',
        description: 'text-sm',
      },
      md: {
        container: 'py-10',
        icon: 'mb-3',
        title: 'text-lg',
        description: 'text-base',
      },
      lg: {
        container: 'py-16',
        icon: 'mb-4',
        title: 'text-xl',
        description: 'text-base',
      },
    };

    const currentSize = sizeStyles[size];

    // カラースタイル
    const iconStyles = isChristmasMode
      ? 'text-[#d4af37]/50'
      : 'text-gray-300';

    const titleStyles = isChristmasMode
      ? 'text-[#f8f1e7]'
      : 'text-gray-700';

    const descriptionStyles = isChristmasMode
      ? 'text-[#f8f1e7]/60'
      : 'text-gray-500';

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center text-center ${currentSize.container} ${className}`}
        {...props}
      >
        {icon && (
          <div className={`${iconStyles} ${currentSize.icon}`}>
            {icon}
          </div>
        )}
        <h3 className={`font-semibold ${titleStyles} ${currentSize.title}`}>
          {title}
        </h3>
        {description && (
          <p className={`mt-1 ${descriptionStyles} ${currentSize.description} max-w-sm`}>
            {description}
          </p>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

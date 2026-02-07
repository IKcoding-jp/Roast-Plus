'use client';

import { forwardRef } from 'react';

/**
 * 統一されたカードコンポーネント
 *
 * @example
 * // 基本カード
 * <Card>
 *   <h3 className="text-lg font-bold">カードタイトル</h3>
 *   <p className="text-ink-sub">説明文</p>
 * </Card>
 *
 * @example
 * // ホバー効果付きカード（クリック可能）
 * <Card variant="hoverable" onClick={handleClick}>
 *   <h3 className="text-lg font-bold">クリック可能なカード</h3>
 *   <p className="text-ink-sub">ホバーするとシャドウが変化</p>
 * </Card>
 *
 * @example
 * // アクションカード（ホームページ用）
 * <Card variant="action" onClick={handleAction}>
 *   <div className="flex flex-col items-center gap-3">
 *     <IconComponent className="h-8 w-8" />
 *     <span className="font-bold">アクション名</span>
 *   </div>
 * </Card>
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** カードのスタイルバリエーション */
  variant?: 'default' | 'hoverable' | 'action' | 'coffee' | 'table' | 'guide';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    // バリアントスタイル（CSS変数ベース）
    const variantStyles = {
      default: 'bg-surface rounded-2xl shadow-card border border-edge p-4',
      hoverable: 'bg-surface rounded-2xl shadow-card border border-edge p-4 hover:shadow-card-hover hover:border-edge-strong transition-all cursor-pointer',
      action: 'bg-surface rounded-2xl shadow-card-glow p-5 hover:shadow-card-hover hover:-translate-y-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spot focus-visible:ring-offset-2',
      coffee: 'bg-[#211714] text-white rounded-2xl shadow-md p-4',
      table: 'bg-overlay rounded-xl shadow-card border border-edge overflow-hidden',
      guide: 'bg-overlay rounded-xl shadow-card border border-edge p-6 text-center',
    };

    const cardStyles = [
      variantStyles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={cardStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

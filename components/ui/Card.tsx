'use client';

import { forwardRef } from 'react';

/**
 * 統一されたカードコンポーネント
 *
 * @example
 * // 基本カード
 * <Card>
 *   <h3 className="text-lg font-bold">カードタイトル</h3>
 *   <p className="text-gray-600">説明文</p>
 * </Card>
 *
 * @example
 * // ホバー効果付きカード（クリック可能）
 * <Card variant="hoverable" onClick={handleClick}>
 *   <h3 className="text-lg font-bold">クリック可能なカード</h3>
 *   <p className="text-gray-600">ホバーするとシャドウが変化</p>
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
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Card variant="hoverable" isChristmasMode={isChristmasMode}>
 *   <h3>クリスマス仕様のカード</h3>
 * </Card>
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** カードのスタイルバリエーション */
  variant?: 'default' | 'hoverable' | 'action' | 'coffee' | 'table' | 'guide';
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', isChristmasMode = false, className = '', children, ...props }, ref) => {
    // 通常モードのバリアントスタイル
    const normalVariantStyles = {
      default: 'bg-white rounded-2xl shadow-md border border-gray-100 p-4',
      hoverable: 'bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer',
      action: 'bg-white/95 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      coffee: 'bg-[#211714] text-white rounded-2xl shadow-md p-4',
      table: 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
      guide: 'bg-white rounded-xl shadow-sm border border-orange-100 p-6 text-center',
    };

    // クリスマスモードのバリアントスタイル
    const christmasVariantStyles = {
      default: 'bg-white/5 rounded-2xl border border-[#d4af37]/40 p-4 shadow-[0_0_15px_rgba(212,175,55,0.1)]',
      hoverable: 'bg-white/5 rounded-2xl border border-[#d4af37]/40 p-4 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:bg-white/10 hover:border-[#d4af37]/70 transition-all cursor-pointer',
      action: 'bg-white/5 rounded-2xl border border-[#d4af37]/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-[#d4af37]/70 hover:-translate-y-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a0e]',
      coffee: 'bg-[#211714] text-white rounded-2xl shadow-md p-4 border border-[#d4af37]/20',
      table: 'bg-[#0a2f1a] rounded-xl border border-[#d4af37]/30 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.1)]',
      guide: 'bg-[#0a2f1a] rounded-xl border border-[#d4af37]/30 p-6 text-center shadow-[0_0_15px_rgba(212,175,55,0.1)]',
    };

    const variantStyles = isChristmasMode ? christmasVariantStyles : normalVariantStyles;

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

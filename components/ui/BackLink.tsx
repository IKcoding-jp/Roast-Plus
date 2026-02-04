'use client';

import Link from 'next/link';
import { CaretLeft } from 'phosphor-react';

/**
 * 戻るリンクコンポーネント
 *
 * ページ上部に配置する「一覧に戻る」「前のページに戻る」などのナビゲーションリンク。
 * クリスマスモード対応。
 *
 * @example
 * // 基本的な使用
 * <BackLink href="/tasting">一覧に戻る</BackLink>
 *
 * @example
 * // クリスマスモード対応
 * <BackLink href="/tasting" isChristmasMode={isChristmasMode}>一覧に戻る</BackLink>
 *
 * @example
 * // アイコンのみ（コンパクト）
 * <BackLink href="/" variant="icon-only" isChristmasMode={isChristmasMode} />
 */

export interface BackLinkProps {
  /** リンク先URL */
  href: string;
  /** リンクテキスト（icon-onlyの場合は不要） */
  children?: React.ReactNode;
  /** バリアント */
  variant?: 'default' | 'icon-only';
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
  /** 追加のクラス名 */
  className?: string;
  /** aria-label（icon-onlyの場合に必須） */
  'aria-label'?: string;
  /** title属性 */
  title?: string;
}

export function BackLink({
  href,
  children,
  variant = 'default',
  isChristmasMode = false,
  className = '',
  'aria-label': ariaLabel,
  title,
}: BackLinkProps) {
  if (variant === 'icon-only') {
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] ${
          isChristmasMode
            ? 'text-[#f8f1e7]/70 hover:text-[#f8f1e7] hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        } ${className}`}
        title={title || '戻る'}
        aria-label={ariaLabel || '戻る'}
      >
        <CaretLeft size={24} weight="bold" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 transition-colors font-bold text-sm uppercase tracking-widest ${
        isChristmasMode
          ? 'text-[#f8f1e7]/70 hover:text-[#f8f1e7]'
          : 'text-gray-600 hover:text-gray-800'
      } ${className}`}
      title={title}
      aria-label={ariaLabel}
    >
      <CaretLeft
        size={20}
        weight="bold"
        className="group-hover:-translate-x-1 transition-transform"
      />
      {children}
    </Link>
  );
}

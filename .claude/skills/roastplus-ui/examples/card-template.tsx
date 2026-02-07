'use client';

/**
 * ローストプラス カードコンポーネントテンプレート
 *
 * 用途: グリッド表示、リスト表示、ダッシュボードなどで使用
 * パターン: 基本カード、ボタンカード、二重ボーダーカード
 *
 * 使用方法:
 * 1. 必要なパターンを選択
 * 2. props を定義
 * 3. JSX を追加
 *
 * テーマ対応:
 * CSS変数ベースのテーマシステムを使用。
 * text-ink, text-ink-sub, bg-surface, bg-ground, border-edge 等のクラスは
 * 親要素の .christmas クラスにより自動的に配色が切り替わる。
 */

import React from 'react';

/**
 * ========== パターン1: 基本カード ==========
 * リストやグリッド内で使用する基本的なカード
 */
interface BasicCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  isClickable?: boolean;
}

export function BasicCard({
  title,
  description,
  children,
  onClick,
  isClickable = false,
}: BasicCardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-md border border-edge p-4 sm:p-6 transition-all ${
        isClickable || onClick
          ? 'hover:shadow-lg hover:border-edge-strong hover:-translate-y-1 cursor-pointer'
          : ''
      }`}
      onClick={onClick}
      role={isClickable || onClick ? 'button' : undefined}
      tabIndex={isClickable || onClick ? 0 : undefined}
    >
      {/* タイトル */}
      <h3 className="text-lg font-bold text-ink mb-2">
        {title}
      </h3>

      {/* 説明文 */}
      {description && (
        <p className="text-ink-sub text-sm mb-4">
          {description}
        </p>
      )}

      {/* 子要素 */}
      {children}
    </div>
  );
}

/**
 * ========== パターン2: ボタンカード（ホームページスタイル） ==========
 * ホームページのアクション選択に使用
 */
interface ButtonCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export function ButtonCard({
  icon,
  title,
  description,
  onClick,
  badge,
}: ButtonCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 shadow-2xl transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-surface text-ink shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-spot"
    >
      {/* バッジ */}
      {badge && (
        <div className="absolute -top-1 -right-1 z-20 animate-pulse-scale">
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-bold text-white shadow-lg bg-gradient-to-r from-yellow-400 to-amber-600 ring-2 ring-white/20">
            {badge}
          </span>
        </div>
      )}

      {/* アイコン */}
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-spot-subtle text-spot group-hover:scale-110 transition-all">
        <div className="h-8 w-8 relative z-10">
          {icon}
        </div>
      </span>

      {/* テキスト */}
      <div className="space-y-1 text-center relative z-10">
        <p className="font-bold text-base md:text-lg text-ink">
          {title}
        </p>
        <p className="text-xs md:text-sm text-ink-muted">
          {description}
        </p>
      </div>
    </button>
  );
}

/**
 * ========== パターン3: カード（テーマ対応） ==========
 * CSS変数によるテーマ自動切り替え対応カード
 */
interface ThemableCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function ThemableCard({
  title,
  description,
  children,
  onClick,
}: ThemableCardProps) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-6 transition-all cursor-pointer bg-surface border-edge shadow-md hover:shadow-lg hover:border-edge-strong"
      onClick={onClick}
    >
      {/* タイトル */}
      <h3 className="text-lg font-bold mb-2 text-ink">
        {title}
      </h3>

      {/* 説明文 */}
      {description && (
        <p className="text-sm text-ink-muted">
          {description}
        </p>
      )}

      {/* 子要素 */}
      {children}
    </div>
  );
}

/**
 * ========== パターン4: 二重ボーダーカード ==========
 * 視覚的な強調が必要なカード（特集、重要情報など）
 */
interface DoubleCardProps {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function DoubleCard({
  icon,
  title,
  children,
}: DoubleCardProps) {
  return (
    <div className="rounded-2xl border-4 border-amber-950 p-1">
      <div className="rounded-lg border-2 border-amber-500 bg-gradient-to-r from-stone-50 via-amber-50/30 to-stone-100 p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="text-3xl flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className="text-xl font-bold text-amber-900">
            {title}
          </h3>
        </div>

        {/* コンテンツ */}
        <div className="text-amber-800">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * ========== パターン5: ボタンカード（テーマ対応） ==========
 * ホームページボタンカードのテーマ対応版
 */
interface ThemableButtonCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export function ThemableButtonCard({
  icon,
  title,
  description,
  onClick,
  badge,
}: ThemableButtonCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-surface border border-edge shadow-2xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-spot"
    >
      {/* バッジ */}
      {badge && (
        <div className="absolute -top-1 -right-1 z-20 animate-pulse-scale">
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-bold shadow-lg text-white bg-gradient-to-r from-yellow-400 to-amber-600 ring-2 ring-white/20">
            {badge}
          </span>
        </div>
      )}

      {/* アイコン */}
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 bg-spot-subtle text-spot border border-spot/30 group-hover:scale-110">
        <div className="h-8 w-8 relative z-10">
          {icon}
        </div>
      </span>

      {/* テキスト */}
      <div className="space-y-1 text-center relative z-10">
        <p className="font-bold text-base md:text-lg text-ink group-hover:text-spot">
          {title}
        </p>
        <p className="text-xs md:text-sm text-ink-muted">
          {description}
        </p>
      </div>
    </button>
  );
}

/**
 * ========== 使用例 ==========
 *
 * 基本カード:
 * <BasicCard
 *   title="タイトル"
 *   description="説明文"
 *   onClick={() => console.log('clicked')}
 *   isClickable
 * >
 *   {/* 子要素 */}
 * </BasicCard>
 *
 * ボタンカード:
 * <ButtonCard
 *   icon={<FaIcon className="h-8 w-8" />}
 *   title="タイトル"
 *   description="説明文"
 *   onClick={() => router.push('/path')}
 *   badge="New!"
 * />
 *
 * テーマ対応カード:
 * <ThemableCard title="タイトル">
 *   {/* コンテンツ */}
 * </ThemableCard>
 *
 * ========== パターン選択ガイド ==========
 *
 * BasicCard:
 * - リスト内での表示
 * - 簡潔な情報表示
 * - クリック可能なアイテム
 *
 * ButtonCard:
 * - ホームページのアクション選択
 * - 大きなカード表示
 * - アイコン + テキスト
 *
 * ThemableCard:
 * - テーマ対応カード
 * - CSS変数による自動配色切り替え
 *
 * DoubleCard:
 * - 特集情報の強調表示
 * - 重要なお知らせ
 * - 視覚的な強調が必要
 *
 * ThemableButtonCard:
 * - ホームページのテーマ対応版
 * - CSS変数による自動配色切り替え
 *
 * ========== テーマシステム ==========
 *
 * CSS変数ベースのテーマを使用:
 * - text-ink: メインテキスト色
 * - text-ink-sub: サブテキスト色
 * - text-ink-muted: 淡いテキスト色
 * - text-spot: アクセント色
 * - bg-surface: カード背景色
 * - bg-ground: セクション背景色
 * - bg-spot-subtle: アクセント薄背景色
 * - border-edge: ボーダー色
 * - border-edge-strong: 強調ボーダー色
 *
 * .christmas クラスが親要素にある場合、
 * これらのCSS変数が自動的にクリスマスカラーに切り替わる。
 *
 * ========== アクセシビリティ ==========
 *
 * 実装済み:
 * - [ ] クリック可能なカード: role="button"
 * - [ ] ボタンカード: タッチターゲット 44px 以上
 * - [ ] フォーカスリング: focus-visible 対応
 * - [ ] キーボード操作: Enter キーで実行
 */

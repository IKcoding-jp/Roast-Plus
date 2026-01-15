'use client';

/**
 * ローストプラス カードコンポーネントテンプレート
 *
 * 用途: グリッド表示、リスト表示、ダッシュボードなどで使用
 * パターン: 基本カード、ボタンカード（ホームページ）、二重ボーダーカード
 *
 * 使用方法:
 * 1. 必要なパターンを選択
 * 2. props を定義
 * 3. JSX を追加
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
      className={`bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 transition-all ${
        isClickable || onClick
          ? 'hover:shadow-lg hover:border-gray-300 hover:-translate-y-1 cursor-pointer'
          : ''
      }`}
      onClick={onClick}
      role={isClickable || onClick ? 'button' : undefined}
      tabIndex={isClickable || onClick ? 0 : undefined}
    >
      {/* タイトル */}
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        {title}
      </h3>

      {/* 説明文 */}
      {description && (
        <p className="text-gray-600 text-sm mb-4">
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
      className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 shadow-2xl transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-white/95 text-[#1F2A44] shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-amber-600 focus-visible:ring-offset-[#F5F2EB]"
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
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-600/10 text-amber-600 group-hover:bg-amber-600/15 transition-all">
        <div className="h-8 w-8 relative z-10">
          {icon}
        </div>
      </span>

      {/* テキスト */}
      <div className="space-y-1 text-center relative z-10">
        <p className="font-bold text-base md:text-lg text-slate-900">
          {title}
        </p>
        <p className="text-xs md:text-sm text-slate-500">
          {description}
        </p>
      </div>
    </button>
  );
}

/**
 * ========== パターン3: カード（クリスマスモード対応） ==========
 * 通常モード・クリスマスモード両対応カード
 */
interface ThemableCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  isChristmasMode: boolean;
  onClick?: () => void;
}

export function ThemableCard({
  title,
  description,
  children,
  isChristmasMode,
  onClick,
}: ThemableCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 transition-all cursor-pointer ${
        isChristmasMode
          ? 'bg-white/5 border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
          : 'bg-white border-gray-100 shadow-md hover:shadow-lg hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {/* タイトル */}
      <h3 className={`text-lg font-bold mb-2 ${
        isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'
      }`}>
        {title}
      </h3>

      {/* 説明文 */}
      {description && (
        <p className={`text-sm ${
          isChristmasMode ? 'text-[#f8f1e7]/60' : 'text-gray-600'
        }`}>
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
 * ========== パターン5: ボタンカード（クリスマスモード対応） ==========
 * ホームページボタンカードのクリスマスモード対応版
 */
interface ThemableButtonCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isChristmasMode: boolean;
  badge?: string;
}

export function ThemableButtonCard({
  icon,
  title,
  description,
  onClick,
  isChristmasMode,
  badge,
}: ThemableButtonCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isChristmasMode
          ? 'bg-white/5 border border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70 shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-visible:ring-[#d4af37] focus-visible:ring-offset-[#051a0e]'
          : 'bg-white/95 shadow-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-amber-600 focus-visible:ring-offset-[#F5F2EB]'
      }`}
    >
      {/* バッジ */}
      {badge && (
        <div className="absolute -top-1 -right-1 z-20 animate-pulse-scale">
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-bold shadow-lg ring-2 ${
            isChristmasMode
              ? 'text-[#051a0e] bg-[#d4af37]'
              : 'text-white bg-gradient-to-r from-yellow-400 to-amber-600'
          } ring-white/20`}>
            {badge}
          </span>
        </div>
      )}

      {/* アイコン */}
      <span className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
        isChristmasMode
          ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
          : 'bg-amber-600/10 text-amber-600 group-hover:bg-amber-600/15'
      }`}>
        <div className="h-8 w-8 relative z-10">
          {icon}
        </div>
      </span>

      {/* テキスト */}
      <div className={`space-y-1 text-center relative z-10 ${
        isChristmasMode ? 'text-[#f8f1e7]' : 'text-[#1F2A44]'
      }`}>
        <p className={`font-bold text-base md:text-lg ${
          isChristmasMode ? 'group-hover:text-[#d4af37]' : 'text-slate-900'
        }`}>
          {title}
        </p>
        <p className={`text-xs md:text-sm ${
          isChristmasMode
            ? 'text-[#f8f1e7]/60 group-hover:text-[#f8f1e7]/90'
            : 'text-slate-500'
        }`}>
          {description}
        </p>
      </div>

      {/* クリスマスモード: カード下部のゴールドライン */}
      {isChristmasMode && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      )}
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
 * クリスマスモード対応:
 * <ThemableCard
 *   title="タイトル"
 *   isChristmasMode={isChristmasMode}
 * >
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
 * - 通常モード・クリスマスモード両対応
 * - 配色の切り替えが必要
 *
 * DoubleCard:
 * - 特集情報の強調表示
 * - 重要なお知らせ
 * - 視覚的な強調が必要
 *
 * ThemableButtonCard:
 * - ホームページの両モード対応
 * - 複雑な配色切り替えが必要
 *
 * ========== アクセシビリティ ==========
 *
 * 実装済み:
 * - [ ] クリック可能なカード: role="button"
 * - [ ] ボタンカード: タッチターゲット 44px 以上
 * - [ ] フォーカスリング: focus-visible 対応
 * - [ ] キーボード操作: Enter キーで実行
 */

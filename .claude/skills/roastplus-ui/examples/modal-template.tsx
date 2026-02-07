'use client';

/**
 * ローストプラス モーダル・ダイアログテンプレート
 *
 * 用途: 確認、選択、情報表示などのモーダルダイアログ
 * パターン: 基本モーダル、確認ダイアログ、警告ダイアログ
 *
 * 使用方法:
 * 1. 状態管理（isOpen, onClose）を提供
 * 2. テンプレートをコピー
 * 3. 必要なパターンを選択して実装
 *
 * テーマ対応:
 * CSS変数ベースのテーマシステムを使用。
 * text-ink, bg-surface, border-edge 等のクラスは
 * 親要素の .christmas クラスにより自動的に配色が切り替わる。
 */

import { useEffect } from 'react';

/**
 * ========== パターン1: 基本モーダル ==========
 * 単純な情報表示や確認に使用
 */
interface BasicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
}

export function BasicModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
}: BasicModalProps) {
  // Escapeキーで閉じる
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* モーダル */}
      <div className="bg-surface rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 border border-edge">
        {/* タイトル */}
        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-4">
          {title}
        </h2>

        {/* メッセージ */}
        <p className="text-base sm:text-lg text-ink-sub mb-6">
          {message}
        </p>

        {/* ボタングループ */}
        <div className="flex gap-3 sm:gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-base sm:text-lg min-h-[44px]"
          >
            閉じる
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors text-base sm:text-lg min-h-[44px]"
            >
              確認
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ========== パターン2: 確認ダイアログ ==========
 * はい/いいえの選択が必要なダイアログ
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '確認',
  cancelText = 'キャンセル',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-lg shadow-xl p-6 sm:p-8 max-w-lg w-full mx-4 border border-edge">
        {/* タイトル */}
        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-4">
          {title}
        </h2>

        {/* メッセージ */}
        <p className="text-base sm:text-lg text-ink-sub mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* ボタングループ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          {/* キャンセルボタン */}
          <button
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="px-4 sm:px-6 py-3 bg-[#00b8d4] text-white rounded-lg font-semibold hover:bg-[#00a0b8] transition-colors text-sm sm:text-base min-h-[44px] whitespace-nowrap flex-1 sm:flex-none"
          >
            {cancelText}
          </button>

          {/* 確認ボタン */}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 sm:px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors text-sm sm:text-base min-h-[44px] whitespace-nowrap flex-1 sm:flex-none"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ========== パターン3: 警告ダイアログ ==========
 * 危険な操作の確認に使用（削除など）
 */
interface WarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
}

export function WarningDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
}: WarningDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 border-t-4 border-red-500">
        {/* 警告アイコン */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600">
            {title}
          </h2>
        </div>

        {/* メッセージ */}
        <p className="text-base text-ink-sub mb-6">
          {message}
        </p>

        {/* ボタングループ */}
        <div className="flex gap-3 sm:gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors min-h-[44px]"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors min-h-[44px]"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ========== パターン4: 入力ダイアログ ==========
 * ユーザー入力が必要なダイアログ
 */
interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  value?: string;
}

export function InputDialog({
  isOpen,
  onClose,
  title,
  label,
  placeholder,
  onConfirm,
  value: initialValue = '',
}: InputDialogProps) {
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      const handleEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && value.trim()) {
          onConfirm(value);
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      window.addEventListener('keydown', handleEnter);
      return () => {
        window.removeEventListener('keydown', handleEscape);
        window.removeEventListener('keydown', handleEnter);
      };
    }
  }, [isOpen, onClose, value, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 border border-edge">
        {/* タイトル */}
        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-4">
          {title}
        </h2>

        {/* 入力フィールド */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-2">
            {label}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border-2 border-edge px-4 py-3 text-ink focus:border-spot focus:outline-none focus:ring-2 focus:ring-spot-subtle transition-all"
            autoFocus
          />
        </div>

        {/* ボタングループ */}
        <div className="flex gap-3 sm:gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors min-h-[44px]"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              if (value.trim()) {
                onConfirm(value);
                onClose();
              }
            }}
            disabled={!value.trim()}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ========== 使用例 ==========
 *
 * 親コンポーネントでの使用:
 *
 * export default function Page() {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>
 *         モーダルを開く
 *       </button>
 *
 *       <BasicModal
 *         isOpen={isModalOpen}
 *         onClose={() => setIsModalOpen(false)}
 *         title="タイトル"
 *         message="メッセージ"
 *         onConfirm={() => console.log('確認')}
 *       />
 *     </>
 *   );
 * }
 *
 * ========== テーマ対応 ==========
 *
 * CSS変数ベースのテーマシステム:
 * - text-ink: メインテキスト色
 * - text-ink-sub: サブテキスト色
 * - bg-surface: モーダル背景色
 * - border-edge: ボーダー色
 *
 * data-theme="christmas" 属性がhtml要素にある場合、
 * CSS変数が自動的にクリスマスカラーに切り替わる。
 * コンポーネント側でのテーマ判定は不要。
 *
 * ========== キーボード操作 ==========
 *
 * - Escape キー: モーダルを閉じる
 * - Enter キー: 確認（入力ダイアログの場合）
 *
 * これらは useEffect で自動的に設定されています。
 */

// React インポート（InputDialogで使用）
import React from 'react';

/**
 * ========== アクセシビリティ ==========
 *
 * 実装済み:
 * - [ ] Escape キーでクローズ可能
 * - [ ] キーボード操作（Enter で送信）
 * - [ ] ボタンは 44px 以上（タッチターゲット）
 * - [ ] コントラスト比確認済み
 */

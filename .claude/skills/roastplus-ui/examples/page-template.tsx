'use client';

/**
 * ローストプラス スクロール可能ページテンプレート
 *
 * 用途: リスト、設定、詳細表示など、内容がスクロール可能なページ
 * ページタイプ: スクロール可能
 *
 * 使用方法:
 * 1. このテンプレートをコピーして新規ページファイルを作成
 * 2. コンポーネント名、タイトル、コンテンツを置き換え
 * 3. 不要なセクションは削除
 *
 * テーマ対応:
 * CSS変数ベースのテーマシステムを使用。
 * text-ink, bg-surface, border-edge 等のクラスは
 * 親要素の .christmas クラスにより自動的に配色が切り替わる。
 */

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';

/**
 * ページコンポーネント
 */
export default function YourPageName() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  // ローディング表示
  if (authLoading) return <Loading />;

  // ログイン画面へのリダイレクト
  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F5' }}>
      {/* コンテナ：最大幅、パディング、中央配置 */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {/* ========== ヘッダーセクション ========== */}
        <header className="mb-6 sm:mb-8">
          {/* パターン1: シンプルヘッダー（戻るボタン + タイトル） */}
          <div className="flex items-center gap-4">
            {/* 戻るボタン */}
            <Link
              href="/"
              className="px-3 py-2 text-ink-sub hover:text-ink hover:bg-ground rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6" />
            </Link>

            {/* タイトル */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink">
              ページタイトル
            </h1>
          </div>

          {/* オプション: サブタイトルや説明文 */}
          {/* <p className="text-ink-sub text-sm mt-2">ページの説明文</p> */}
        </header>

        {/* ========== メインコンテンツセクション ========== */}
        <main className="space-y-6">
          {/* パターン1: 基本カード */}
          <div className="bg-surface rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-bold text-ink mb-4">セクションタイトル</h2>
            <p className="text-ink-sub mb-4">
              ここにコンテンツを配置します。説明文、リスト、フォームなど。
            </p>

            {/* リスト例 */}
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-ink">
                <span className="w-2 h-2 bg-spot rounded-full" />
                リスト項目1
              </li>
              <li className="flex items-center gap-2 text-ink">
                <span className="w-2 h-2 bg-spot rounded-full" />
                リスト項目2
              </li>
              <li className="flex items-center gap-2 text-ink">
                <span className="w-2 h-2 bg-spot rounded-full" />
                リスト項目3
              </li>
            </ul>
          </div>

          {/* パターン2: フォームセクション */}
          <div className="bg-surface rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-bold text-ink mb-4">フォームセクション</h2>
            <form className="space-y-4">
              {/* テキスト入力 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  テキスト入力
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-edge px-4 py-3 text-ink focus:border-spot focus:outline-none focus:ring-2 focus:ring-spot-subtle transition-all"
                  placeholder="入力してください"
                />
              </div>

              {/* セレクトボックス */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  選択肢を選ぶ
                </label>
                <select className="w-full rounded-md border border-edge px-4 py-2.5 text-ink focus:border-spot focus:outline-none focus:ring-2 focus:ring-spot min-h-[44px]">
                  <option value="">選択してください</option>
                  <option value="1">オプション1</option>
                  <option value="2">オプション2</option>
                </select>
              </div>

              {/* テキストエリア */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  複数行入力
                </label>
                <textarea
                  className="w-full rounded-lg border-2 border-edge px-4 py-3 text-ink focus:border-spot focus:outline-none focus:ring-2 focus:ring-spot-subtle transition-all"
                  rows={4}
                  placeholder="複数行入力できます"
                />
              </div>

              {/* ボタングループ */}
              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="reset"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors min-h-[44px]"
                >
                  リセット
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors min-h-[44px]"
                >
                  送信
                </button>
              </div>
            </form>
          </div>

          {/* パターン3: 情報ブロック */}
          <div className="bg-spot-subtle rounded-lg border-2 border-spot/30 p-4 sm:p-6">
            <h3 className="text-lg font-bold text-spot mb-2">情報ブロック</h3>
            <p className="text-ink-sub">
              重要な情報やお知らせなどを目立たせるブロック。
            </p>
          </div>
        </main>

        {/* ========== フッター（オプション） ========== */}
        <footer className="mt-8 pt-6 border-t border-edge text-center text-sm text-ink-muted">
          <p>© 2026 Roast Plus. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

/**
 * ========== テンプレート使用ガイド ==========
 *
 * ステップ1: ファイルをコピー
 * - このテンプレートを app/[feature]/page.tsx にコピー
 *
 * ステップ2: 必要な箇所を置き換え
 * - YourPageName → 実際のコンポーネント名
 * - ページタイトル → 実際のタイトル
 * - コンテンツ → 実際のコンテンツ
 *
 * ステップ3: 不要なセクションを削除
 * - フォームセクションが不要な場合は削除
 * - 情報ブロックが不要な場合は削除
 * - フッターが不要な場合は削除
 *
 * ステップ4: 色とスタイルをカスタマイズ（必要に応じて）
 * - max-w-4xl: 幅を変更する場合は max-w-2xl, max-w-6xl などに変更
 * - amber-600: ブランドカラーを変更する場合は color-schemes.md を参照
 *
 * ========== テーマ対応 ==========
 *
 * CSS変数ベースのテーマシステム:
 * - text-ink, text-ink-sub, text-ink-muted: テキスト色
 * - text-spot: アクセント色
 * - bg-surface, bg-ground: 背景色
 * - bg-spot-subtle: アクセント薄背景色
 * - border-edge, border-edge-strong: ボーダー色
 *
 * data-theme="christmas" 属性がhtml要素にある場合、
 * CSS変数が自動的にクリスマスカラーに切り替わる。
 * コンポーネント側でのテーマ判定は不要。
 *
 * ========== レスポンシブデザイン確認 ==========
 *
 * 確認事項:
 * - [ ] モバイル (320px): テキスト読みやすい、タッチターゲット44px以上
 * - [ ] タブレット (768px): sm: クラスが適用されている
 * - [ ] デスクトップ (1024px): lg: クラスが適用されている
 * - [ ] 最大幅 (max-w-4xl): 余白は均等か
 *
 * ========== アクセシビリティ ==========
 *
 * 確認事項:
 * - [ ] リンク/ボタン: aria-label で説明がある
 * - [ ] フォーム: label が関連付けられている
 * - [ ] タッチターゲット: 最小 44px 以上
 * - [ ] カラーコントラスト: 背景とテキストのコントラスト比が4.5:1以上
 */

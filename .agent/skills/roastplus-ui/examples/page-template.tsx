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
 * 4. クリスマスモード対応が必要な場合は、色の切り替えロジックを追加
 */

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';

// 必要に応じてインポート
// import { useChristmasMode } from '@/hooks/useChristmasMode';

/**
 * ページコンポーネント
 */
export default function YourPageName() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  // クリスマスモード対応が必要な場合
  // const { isChristmasMode } = useChristmasMode();

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
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6" />
            </Link>

            {/* タイトル */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              ページタイトル
            </h1>
          </div>

          {/* オプション: サブタイトルや説明文 */}
          {/* <p className="text-gray-600 text-sm mt-2">ページの説明文</p> */}
        </header>

        {/* ========== メインコンテンツセクション ========== */}
        <main className="space-y-6">
          {/* パターン1: 基本カード */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">セクションタイトル</h2>
            <p className="text-gray-600 mb-4">
              ここにコンテンツを配置します。説明文、リスト、フォームなど。
            </p>

            {/* リスト例 */}
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-amber-600 rounded-full" />
                リスト項目1
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-amber-600 rounded-full" />
                リスト項目2
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-amber-600 rounded-full" />
                リスト項目3
              </li>
            </ul>
          </div>

          {/* パターン2: フォームセクション */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">フォームセクション</h2>
            <form className="space-y-4">
              {/* テキスト入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テキスト入力
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                  placeholder="入力してください"
                />
              </div>

              {/* セレクトボックス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選択肢を選ぶ
                </label>
                <select className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]">
                  <option value="">選択してください</option>
                  <option value="1">オプション1</option>
                  <option value="2">オプション2</option>
                </select>
              </div>

              {/* テキストエリア */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  複数行入力
                </label>
                <textarea
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
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
          <div className="bg-amber-50 rounded-lg border-2 border-amber-200 p-4 sm:p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-2">情報ブロック</h3>
            <p className="text-amber-800">
              重要な情報やお知らせなどを目立たせるブロック。
            </p>
          </div>
        </main>

        {/* ========== フッター（オプション） ========== */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
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
 * ========== クリスマスモード対応 ==========
 *
 * クリスマスモード対応が必要な場合:
 *
 * 1. useChristmasMode をインポート
 * 2. const { isChristmasMode } = useChristmasMode();
 * 3. 背景色とテキスト色を条件分岐
 *
 * 例:
 * <div className={`${
 *   isChristmasMode
 *     ? 'bg-[#051a0e] text-[#f8f1e7]'
 *     : 'bg-white text-gray-900'
 * }`}>
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

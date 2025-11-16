'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import LoginPage from '@/app/login/page';

export default function FontSettingsPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/settings"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="設定に戻る"
                aria-label="設定に戻る"
              >
                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              フォント設定
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              フォント設定について
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                アプリで使用するフォントファミリーとフォントサイズを調整できます。設定はアプリ全体に適用されます。
              </p>
              
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="text-base font-medium text-gray-800 mb-3">
                  要件
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  <li>フォントファミリーの選択（複数のフォントから選択可能）</li>
                  <li>フォントサイズの調整（スライダーまたは数値入力で調整可能）</li>
                  <li>設定がアプリ全体に適用される</li>
                  <li>フォントの変更は即座に反映される</li>
                  <li>選択したフォント設定はユーザー設定として保存される</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


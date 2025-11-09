'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type TabType = 'login' | 'signup';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 新規登録時はパスワード確認
    if (activeTab === 'signup') {
      if (password !== confirmPassword) {
        setError('パスワードが一致しません');
        return;
      }
    }
    
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = 'エラーが発生しました';

      switch (errorCode) {
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません';
          break;
        case 'auth/user-disabled':
          errorMessage = 'このアカウントは無効化されています';
          break;
        case 'auth/user-not-found':
          errorMessage = 'アカウントが見つかりません';
          break;
        case 'auth/wrong-password':
          errorMessage = 'パスワードが正しくありません';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'メールアドレスもしくはパスワードが違います';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスは既に使用されています';
          break;
        case 'auth/weak-password':
          errorMessage = 'パスワードが弱すぎます（6文字以上）';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました';
          break;
        default:
          errorMessage = err.message || 'エラーが発生しました';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1EB] px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
          ローストプラス
        </h1>

        {/* タブ */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setConfirmPassword('');
            }}
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
              activeTab === 'signup'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* パスワード */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                minLength={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* パスワード確認（新規登録時のみ） */}
          {activeTab === 'signup' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                パスワード（確認）
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="6文字以上"
                  required
                  minLength={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-orange-500 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '処理中...' : activeTab === 'login' ? 'ログイン' : '新規登録'}
          </button>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      setLoading(false);
      return;
    }

    // 新規登録時はパスワード確認をチェック
    if (!isLogin) {
      if (!confirmPassword) {
        setError('パスワード確認を入力してください');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('パスワードが一致しません');
        setLoading(false);
        return;
      }
    }

    const result = isLogin
      ? await login(email, password)
      : await signup(email, password);

    if (!result.success) {
      let errorMessage = 'エラーが発生しました';
      if (result.error) {
        if (result.error.includes('auth/invalid-credential')) {
          errorMessage = 'メールアドレスまたはパスワードが間違っています';
        } else if (result.error.includes('auth/user-not-found')) {
          errorMessage = 'メールアドレスまたはパスワードが間違っています';
        } else if (result.error.includes('auth/wrong-password')) {
          errorMessage = 'メールアドレスまたはパスワードが間違っています';
        } else if (result.error.includes('auth/email-already-in-use')) {
          errorMessage = 'このメールアドレスは既に使用されています';
        } else if (result.error.includes('auth/weak-password')) {
          errorMessage = 'パスワードが弱すぎます';
        } else if (result.error.includes('auth/invalid-email')) {
          errorMessage = 'メールアドレスの形式が正しくありません';
        } else {
          errorMessage = result.error;
        }
      }
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ローストプラス
        </h1>

        <div className="mb-6">
          <div className="flex gap-2 sm:gap-3 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base flex items-center justify-center ${
                isLogin
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded transition-colors text-sm sm:text-base flex items-center justify-center ${
                !isLogin
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              新規登録
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="example@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              パスワード
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 pr-10 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="6文字以上"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
                aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
              >
                {showPassword ? (
                  <HiEyeOff className="w-5 h-5" />
                ) : (
                  <HiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                パスワード確認
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 pr-10 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="パスワードを再入力"
                  required={!isLogin}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
                  aria-label={showConfirmPassword ? 'パスワード確認を非表示' : 'パスワード確認を表示'}
                >
                  {showConfirmPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm sm:text-base">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && password !== confirmPassword && confirmPassword !== '')}
            className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white text-sm sm:text-base rounded hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading
              ? '処理中...'
              : isLogin
                ? 'ログイン'
                : '新規登録'}
          </button>
        </form>
      </div>
    </div>
  );
}


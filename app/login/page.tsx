'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loading } from '@/components/Loading';
import { Input, Button } from '@/components/ui';

type TabType = 'login' | 'signup';

function LoginForm() {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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
      // returnUrlがあればそのURLに、なければホームにリダイレクト
      const returnUrl = searchParams.get('returnUrl');
      const redirectUrl = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/';
      router.push(redirectUrl);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const errorCode = errorObj.code;
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
          errorMessage = errorObj.message || 'エラーが発生しました';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-8 flex flex-col items-center bg-[#1a1412] py-6 rounded-xl shadow-inner">
          <h1 className="text-4xl font-bold text-white tracking-tight font-[var(--font-playfair)]">
            Roast<span className="text-amber-500">Plus</span>
          </h1>
        </div>

        {/* タブ */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${activeTab === 'signup'
              ? 'bg-amber-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
              }`}
          >
            新規登録
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setConfirmPassword('');
            }}
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${activeTab === 'login'
              ? 'bg-amber-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
              }`}
          >
            ログイン
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* メールアドレス */}
          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@example.com"
            required
          />

          {/* パスワード */}
          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6文字以上"
            required
            minLength={6}
            showPasswordToggle
          />

          {/* パスワード確認（新規登録時のみ） */}
          {activeTab === 'signup' && (
            <Input
              label="パスワード（確認）"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="6文字以上"
              required
              minLength={6}
              showPasswordToggle
            />
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* 送信ボタン */}
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            fullWidth
          >
            {activeTab === 'login' ? 'ログイン' : '新規登録'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
            ローストプラス
          </h1>
          <Loading fullScreen={false} />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

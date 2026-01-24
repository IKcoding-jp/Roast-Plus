'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { saveUserData, getUserData } from '@/lib/firestore';
import { createConsentData, needsConsent } from '@/lib/consent';
import { Loading } from '@/components/Loading';

export default function ConsentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(true);

  const canSubmit = termsAgreed && privacyAgreed && !isSubmitting;

  // 既に同意済みかチェック
  useEffect(() => {
    async function checkExistingConsent() {
      if (!user) return;

      try {
        const userData = await getUserData(user.uid);
        if (!needsConsent(userData.userConsent)) {
          // 同意済みならホームへリダイレクト
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('同意状態の確認に失敗:', error);
      }

      setCheckingConsent(false);
    }

    if (!authLoading && user) {
      checkExistingConsent();
    } else if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;

    setIsSubmitting(true);

    try {
      // 既存のユーザーデータを取得
      const existingData = await getUserData(user.uid);
      const consentData = createConsentData();
      // userConsentを追加して保存
      await saveUserData(user.uid, { ...existingData, userConsent: consentData });
      router.replace('/');
    } catch (error) {
      console.error('同意の保存に失敗:', error);
      alert('同意の保存に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  if (authLoading || checkingConsent) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ご利用の前に
            </h1>
            <p className="text-gray-600">
              RoastPlusをご利用いただくには、以下の規約に同意していただく必要があります。
            </p>
          </div>

          {/* チェックボックス */}
          <div className="space-y-4 mb-6">
            {/* 利用規約 */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
              </div>
              <span className="text-gray-700 group-hover:text-gray-900">
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  利用規約
                </Link>
                に同意する
              </span>
            </label>

            {/* プライバシーポリシー */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
              </div>
              <span className="text-gray-700 group-hover:text-gray-900">
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  プライバシーポリシー
                </Link>
                に同意する
              </span>
            </label>
          </div>

          {/* 同意ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              canSubmit
                ? 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '処理中...' : '同意して続ける'}
          </button>

          {/* 注意書き */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            同意しない場合、本サービスをご利用いただけません。
          </p>
        </div>
      </div>
    </div>
  );
}

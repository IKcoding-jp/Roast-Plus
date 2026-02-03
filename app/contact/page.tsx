'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiArrowLeft, HiMail, HiExclamationCircle } from 'react-icons/hi';
import { ContactSuccessScreen } from '@/components/contact/ContactSuccessScreen';
import { ContactFormFields } from '@/components/contact/ContactFormFields';
import {
  sendContactEmail,
  isEmailJSConfigured,
  ContactFormData,
} from '@/lib/emailjs';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    type: 'question',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // メールアドレスの検証
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }

    // お問い合わせ内容の検証
    if (!formData.message.trim()) {
      errors.message = 'お問い合わせ内容を入力してください';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'お問い合わせ内容は10文字以上で入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    if (!isEmailJSConfigured()) {
      setStatus('error');
      setErrorMessage('お問い合わせ機能の設定が完了していません。直接メールでお問い合わせください。');
      return;
    }

    setStatus('sending');

    try {
      await sendContactEmail(formData);
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        type: 'question',
        message: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '送信に失敗しました');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 入力時にそのフィールドのエラーをクリア
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (status === 'success') {
    return <ContactSuccessScreen />;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/settings"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="戻る"
                aria-label="戻る"
              >
                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              お問い合わせ
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* エラーメッセージ */}
            {status === 'error' && errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <HiExclamationCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">エラーが発生しました</p>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                  <p className="text-red-600 text-sm mt-2">
                    直接メールでのお問い合わせ:{' '}
                    <a
                      href="mailto:kensaku.ikeda04@gmail.com"
                      className="underline hover:no-underline"
                    >
                      kensaku.ikeda04@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <ContactFormFields
                formData={formData}
                validationErrors={validationErrors}
                onInputChange={handleInputChange}
              />

              {/* 送信ボタン */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      送信中...
                    </>
                  ) : (
                    <>
                      <HiMail className="h-5 w-5" />
                      送信する
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 運営者情報 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                直接メールでのお問い合わせ:{' '}
                <a
                  href="mailto:kensaku.ikeda04@gmail.com"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  kensaku.ikeda04@gmail.com
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

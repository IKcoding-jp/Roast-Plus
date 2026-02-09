'use client';

import { useState } from 'react';
import { HiMail, HiExclamationCircle } from 'react-icons/hi';
import { ContactSuccessScreen } from '@/components/contact/ContactSuccessScreen';
import { ContactFormFields } from '@/components/contact/ContactFormFields';
import { Button, Card, BackLink } from '@/components/ui';
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
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-page">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <BackLink href="/settings" variant="icon-only" aria-label="戻る" title="戻る" />
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-ink sm:flex-1 text-center">
              お問い合わせ
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <Card className="p-6">
            {/* エラーメッセージ */}
            {status === 'error' && errorMessage && (
              <div className="mb-6 p-4 bg-danger-subtle border border-danger rounded-lg flex items-start gap-3">
                <HiExclamationCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-danger font-medium">エラーが発生しました</p>
                  <p className="text-danger text-sm mt-1">{errorMessage}</p>
                  <p className="text-danger text-sm mt-2">
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
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={status === 'sending'}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    '送信中...'
                  ) : (
                    <>
                      <HiMail className="h-5 w-5" />
                      送信する
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* 運営者情報 */}
            <div className="mt-8 pt-6 border-t border-edge">
              <p className="text-sm text-ink-muted text-center">
                直接メールでのお問い合わせ:{' '}
                <a
                  href="mailto:kensaku.ikeda04@gmail.com"
                  className="text-spot hover:text-spot-hover underline"
                >
                  kensaku.ikeda04@gmail.com
                </a>
              </p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

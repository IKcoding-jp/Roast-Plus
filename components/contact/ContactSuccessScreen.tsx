'use client';

import Link from 'next/link';
import { HiCheckCircle, HiArrowLeft } from 'react-icons/hi';
import { Card } from '@/components/ui';

export function ContactSuccessScreen() {
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-page">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <HiCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-4">送信完了</h1>
          <p className="text-ink-sub mb-6">
            お問い合わせありがとうございます。
            <br />
            内容を確認のうえ、ご返信いたします。
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center px-6 py-3 bg-spot text-white rounded-lg hover:bg-spot-hover transition-colors font-medium"
          >
            <HiArrowLeft className="h-5 w-5 mr-2" />
            設定に戻る
          </Link>
        </Card>
      </div>
    </div>
  );
}

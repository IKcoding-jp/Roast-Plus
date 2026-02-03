'use client';

import Link from 'next/link';
import { HiCheckCircle, HiArrowLeft } from 'react-icons/hi';

export function ContactSuccessScreen() {
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <HiCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">送信完了</h1>
          <p className="text-gray-600 mb-6">
            お問い合わせありがとうございます。
            <br />
            内容を確認のうえ、ご返信いたします。
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            <HiArrowLeft className="h-5 w-5 mr-2" />
            設定に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

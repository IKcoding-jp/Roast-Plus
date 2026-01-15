'use client';

import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import Link from 'next/link';
import { IoSparkles } from 'react-icons/io5';

export default function CoffeeTriviaPage() {
  const { user, loading } = useAuth();
  useAppLifecycle();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          title="戻る"
          aria-label="戻る"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-gray-800">コーヒー雑学・クイズ</h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-to-br from-[#EF8A00]/10 to-[#EF8A00]/5 rounded-full">
              <IoSparkles className="h-20 w-20 text-[#EF8A00]" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">開発中です</h2>
            <p className="text-gray-600">
              コーヒーに関する雑学やクイズを楽しめる機能を準備中です。
              <br />
              もうしばらくお待ちください。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

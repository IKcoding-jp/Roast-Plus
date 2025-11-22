'use client';

import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiRefresh, HiReply } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import Link from 'next/link';
import { useState } from 'react';

export default function CounterPage() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const updateCount = (delta: number) => {
    const newCount = Math.max(0, count + delta);
    if (newCount !== count) {
      setHistory((prev) => [...prev, count]);
      setCount(newCount);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousValue = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCount(previousValue);
    }
  };

  const handleReset = () => {
    if (count !== 0) {
      setHistory((prev) => [...prev, count]);
      setCount(0);
    }
  };

  const Button = ({
    delta,
    label,
    isPlus
  }: {
    delta: number;
    label: string;
    isPlus: boolean;
  }) => (
    <button
      onClick={() => updateCount(delta)}
      className={`
        flex items-center justify-center w-full h-20 rounded-xl text-2xl font-bold shadow-sm transition-all active:scale-95
        ${isPlus
          ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700'
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 active:bg-gray-50'
        }
      `}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-[#F7F7F5]">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <header className="mb-6 flex items-center justify-between relative">
          <Link
            href="/"
            className="absolute left-0 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="戻る"
            aria-label="戻る"
          >
            <HiArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="w-full text-center text-xl font-bold text-gray-800">
            カウンター
          </h1>
        </header>

        <main className="flex-1 flex flex-col justify-center space-y-8">
          {/* Count Display */}
          <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[200px]">
            <span className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">Count</span>
            <div className="text-9xl font-black text-gray-800 tabular-nums leading-none tracking-tight">
              {count}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Main Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Button delta={-10} label="-10" isPlus={false} />
              <Button delta={10} label="+10" isPlus={true} />

              <Button delta={-5} label="-5" isPlus={false} />
              <Button delta={5} label="+5" isPlus={true} />

              <Button delta={-1} label="-1" isPlus={false} />
              <Button delta={1} label="+1" isPlus={true} />
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className={`
                  flex items-center justify-center gap-2 h-14 rounded-lg font-medium transition-colors
                  ${history.length === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
              >
                <HiReply className="h-5 w-5" />
                ひとつ戻す
              </button>
              <button
                onClick={handleReset}
                disabled={count === 0}
                className={`
                  flex items-center justify-center gap-2 h-14 rounded-lg font-medium transition-colors
                  ${count === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-red-500 hover:bg-red-50 active:bg-red-100'
                  }
                `}
              >
                <HiRefresh className="h-5 w-5" />
                リセット
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

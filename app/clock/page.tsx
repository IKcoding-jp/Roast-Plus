'use client';

import { useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function formatTime(date: Date): { h: string; m: string; s: string } {
  return {
    h: String(date.getHours()).padStart(2, '0'),
    m: String(date.getMinutes()).padStart(2, '0'),
    s: String(date.getSeconds()).padStart(2, '0'),
  };
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_NAMES[date.getDay()];
  return `${y}/${m}/${d} (${day})`;
}

function useCurrentTime() {
  const subscribe = useCallback((callback: () => void) => {
    const timer = setInterval(callback, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSnapshot = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  }, []);

  const getServerSnapshot = useCallback(() => '', []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!snapshot) return null;
  return new Date();
}

export default function ClockPage() {
  const now = useCurrentTime();

  if (!now) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          <span className="text-gray-500 text-lg">読み込み中...</span>
        </div>
      </div>
    );
  }

  const time = formatTime(now);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white select-none relative">
      {/* ヘッダー：戻るボタン */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link
          href="/"
          className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="ホームに戻る"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
      </div>

      {/* 時計表示エリア */}
      <div className="text-center">
        {/* デジタル時計 */}
        <time
          className="flex items-baseline justify-center gap-1 leading-none"
          style={{ fontFamily: 'var(--font-inter), sans-serif', fontFeatureSettings: '"tnum"' }}
          dateTime={now.toISOString()}
        >
          <span
            className="font-black text-[#211714]"
            style={{ fontSize: 'clamp(6rem, 28vw, 28vw)' }}
          >
            {time.h}
          </span>
          <span
            className="font-black text-amber-600"
            style={{ fontSize: 'clamp(4rem, 18vw, 18vw)' }}
          >
            :
          </span>
          <span
            className="font-black text-[#211714]"
            style={{ fontSize: 'clamp(6rem, 28vw, 28vw)' }}
          >
            {time.m}
          </span>
          <span
            className="font-black text-amber-600/70 ml-1"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 10vw)' }}
          >
            {time.s}
          </span>
        </time>

        {/* 日付表示 */}
        <p
          className="mt-4 sm:mt-6 text-gray-400 tracking-widest"
          style={{ fontSize: 'clamp(1.2rem, 4vw, 3rem)', fontFamily: 'var(--font-inter), sans-serif' }}
        >
          {formatDate(now)}
        </p>

        {/* アクセントライン */}
        <div className="mt-6 sm:mt-8 mx-auto w-24 sm:w-32 h-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 opacity-60" />
      </div>
    </div>
  );
}

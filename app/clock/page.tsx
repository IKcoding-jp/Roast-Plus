'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_NAMES[date.getDay()];
  return `${y}/${m}/${d} (${day})`;
}

export default function ClockPage() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a2e]">
        <span className="text-white text-2xl">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1a1a2e] select-none relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-white/60 hover:text-white/90 transition-colors p-2 rounded-lg"
        aria-label="ホームに戻る"
      >
        <IoArrowBack size={28} />
      </Link>

      <div className="text-center">
        <time
          className="block font-mono font-bold tracking-wider text-[#00e5ff] leading-none"
          style={{
            fontSize: 'clamp(5rem, 20vw, 16rem)',
            textShadow: '0 0 30px rgba(0, 229, 255, 0.4), 0 0 60px rgba(0, 229, 255, 0.2)',
          }}
          dateTime={now.toISOString()}
        >
          {formatTime(now)}
        </time>
        <p
          className="mt-4 font-mono text-white/70 tracking-widest"
          style={{
            fontSize: 'clamp(1.2rem, 4vw, 3rem)',
          }}
        >
          {formatDate(now)}
        </p>
      </div>
    </div>
  );
}

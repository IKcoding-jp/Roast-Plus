'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiArrowLeft, HiPlay, HiArrowsPointingOut } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import { splashPatterns } from '@/components/splash/patterns';

// ─── プレビューカード ───

function PreviewCard({
  pattern,
  onFullscreen,
}: {
  pattern: (typeof splashPatterns)[number];
  onFullscreen: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    setPhase(0);
    setIsPlaying(true);

    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setIsPlaying(false), 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // 初回自動再生
  useEffect(() => {
    const timer = setTimeout(() => {
      play();
    }, pattern.id * 400);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { Component } = pattern;

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
      {/* プレビューエリア */}
      <div
        className="relative flex items-center justify-center h-48"
        style={{ backgroundColor: '#261a14' }}
      >
        <Component phase={phase} compact />
      </div>

      {/* 情報エリア */}
      <div className="p-4 flex items-center justify-between bg-[#1a1210]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#EF8A00]">#{pattern.id}</span>
            <h3 className="text-sm font-bold text-white">{pattern.name}</h3>
          </div>
          <p className="text-xs text-white/50 mt-0.5">{pattern.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={play}
            disabled={isPlaying}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EF8A00]/20 text-[#EF8A00] hover:bg-[#EF8A00]/30 transition-colors disabled:opacity-30"
            aria-label="リプレイ"
            title="リプレイ"
          >
            <HiPlay className="h-4 w-4" />
          </button>
          <button
            onClick={onFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            aria-label="フルスクリーン"
            title="フルスクリーン"
          >
            <HiArrowsPointingOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── フルスクリーンプレビュー ───

function FullscreenPreview({
  pattern,
  onClose,
}: {
  pattern: (typeof splashPatterns)[number];
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0);

  const startAnimation = useCallback(() => {
    setPhase(0);
    setTimeout(() => setPhase(1), 100);
    setTimeout(() => setPhase(2), 600);
    setTimeout(() => setPhase(3), 1000);
  }, []);

  useEffect(() => {
    queueMicrotask(() => startAnimation());
  }, [startAnimation]);

  const { Component } = pattern;

  return (
    <>
      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#261a14' }}
      >
        <Component phase={phase} />

        {/* コントロール */}
        <div className="absolute bottom-8 flex gap-3">
          <button
            onClick={startAnimation}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EF8A00]/20 text-[#EF8A00] text-sm hover:bg-[#EF8A00]/30 transition-colors"
          >
            <HiPlay className="h-4 w-4" />
            リプレイ
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
          >
            閉じる
          </button>
        </div>

        {/* パターン名表示 */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <span className="text-xs font-mono text-[#EF8A00]">#{pattern.id}</span>
          <span className="text-sm text-white/60">{pattern.name}</span>
        </div>
      </div>
    </>
  );
}

// ─── メインページ ───

export default function SplashPreviewPage() {
  const router = useRouter();
  const [fullscreenPattern, setFullscreenPattern] = useState<(typeof splashPatterns)[number] | null>(null);

  return (
    <>
      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: '#1a1210' }}>
        {/* ヘッダー */}
        <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl" style={{ backgroundColor: '#261a14ee' }}>
          <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                aria-label="ホームに戻る"
              >
                <HiArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-white">Splash Animation Preview</h1>
                <p className="text-xs text-white/40">アニメーションパターンを比較（本番はランダム再生）</p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#EF8A00]/60">DEV ONLY</span>
          </div>
        </header>

        {/* グリッド */}
        <main className="mx-auto max-w-5xl px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {splashPatterns.map((pattern) => (
              <PreviewCard
                key={pattern.id}
                pattern={pattern}
                onFullscreen={() => setFullscreenPattern(pattern)}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            各カードの ▶ でリプレイ、⛶ でフルスクリーンプレビュー
          </p>
        </main>
      </div>

      {/* フルスクリーンモーダル */}
      {fullscreenPattern && (
        <FullscreenPreview
          pattern={fullscreenPattern}
          onClose={() => setFullscreenPattern(null)}
        />
      )}
    </>
  );
}

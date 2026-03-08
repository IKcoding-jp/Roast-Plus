'use client';

import dynamic from 'next/dynamic';

// SplashScreenはクライアントのみでレンダリング（SSR無効化でハイドレーションミスマッチを回避）
const SplashScreen = dynamic(
  () => import('@/components/SplashScreen').then((mod) => mod.SplashScreen),
  { ssr: false }
);

export function SplashScreenWrapper() {
  return <SplashScreen />;
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { splashPatterns } from '@/components/splash/patterns';

const SPLASH_DISPLAY_TIME = 2800;
const SPLASH_SHOWN_KEY = 'roastplus_splash_shown';
export const REPLAY_SPLASH_EVENT = 'replay-splash';

function pickRandomIndex() {
  return Math.floor(Math.random() * splashPatterns.length);
}

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [phase, setPhase] = useState(0);
  const [patternIndex, setPatternIndex] = useState(0);

  const startSplash = useCallback(() => {
    setPatternIndex(pickRandomIndex());
    setPhase(0);
    setIsFadingOut(false);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const index = pickRandomIndex();
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    if (splashShown !== 'true') {
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
      queueMicrotask(() => {
        setPatternIndex(index);
        setIsVisible(true);
      });
    } else {
      queueMicrotask(() => setPatternIndex(index));
    }
  }, []);

  // カスタムイベントでスプラッシュを再生
  useEffect(() => {
    const handleReplay = () => startSplash();
    window.addEventListener(REPLAY_SPLASH_EVENT, handleReplay);
    return () => window.removeEventListener(REPLAY_SPLASH_EVENT, handleReplay);
  }, [startSplash]);

  useEffect(() => {
    if (!isVisible) return;

    const phase1 = setTimeout(() => setPhase(1), 100);
    const phase2 = setTimeout(() => setPhase(2), 600);
    const phase3 = setTimeout(() => setPhase(3), 1000);

    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, SPLASH_DISPLAY_TIME);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DISPLAY_TIME + 500);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const { Component } = splashPatterns[patternIndex];

  return (
    <>
      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundColor: '#261a14' }}
      >
        <Component phase={phase} />
      </div>
    </>
  );
}

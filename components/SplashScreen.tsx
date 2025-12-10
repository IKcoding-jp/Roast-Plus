'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const SPLASH_DISPLAY_TIME = 3000; // 3秒
const SPLASH_SHOWN_KEY = 'roastplus_splash_shown'; // セッション開始時のフラグ

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    if (splashShown === 'true') {
      return false;
    }
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    return true;
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isTextVisible, setIsTextVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let isMounted = true;
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/Loading coffee bean.json');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setAnimationData(data);
          }
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      }
    };

    loadAnimation();

    const textFadeInTimer = setTimeout(() => {
      setIsTextVisible(true);
    }, 200);

    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, SPLASH_DISPLAY_TIME);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DISPLAY_TIME + 300);

    return () => {
      isMounted = false;
      clearTimeout(textFadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#F5F1EB' }}
    >
      <div className="text-center space-y-8">
        {/* タイトルを上に */}
        <div
          className={`transition-opacity duration-500 ${
            isTextVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-[#2C1810] tracking-[0.1em] leading-tight">
              ローストプラス
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-16 bg-[#8B7355] opacity-30"></div>
              <p className="text-xs text-[#6B5B52] font-light tracking-[0.3em] uppercase">
                Roast Plus
              </p>
              <div className="h-px w-16 bg-[#8B7355] opacity-30"></div>
            </div>
          </div>
        </div>
        {/* アニメーションを下に */}
        <div className="flex justify-center">
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}


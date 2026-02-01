'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const SPLASH_DISPLAY_TIME = 3000; // 3秒
const SPLASH_SHOWN_KEY = 'roastplus_splash_shown'; // セッション開始時のフラグ

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // クライアントマウント時にsessionStorageをチェックし、初回訪問時のみスプラッシュを表示
  // サーバー/クライアント共にisVisible=falseで開始することでHydrationミスマッチを回避
  useEffect(() => {
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    if (splashShown !== 'true') {
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorageとの初期同期のため必要
      setIsVisible(true);
    }
  }, []);
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      style={{ backgroundColor: '#1a1412' }}
    >
      <div className="text-center space-y-8">
        {/* タイトルを上に */}
        <div
          className={`transition-opacity duration-500 ${isTextVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-[0.05em] leading-tight font-[var(--font-playfair)]">
              Roast<span className="text-[#EF8A00]">Plus</span>
            </h1>
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


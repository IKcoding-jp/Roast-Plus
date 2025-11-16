'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { PiCoffeeBeanFill } from 'react-icons/pi';

const SPLASH_DISPLAY_TIME = 3000; // 3秒

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Lottieアニメーションを読み込む
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/Loading coffee bean.json');
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      }
    };

    loadAnimation();

    // スプラッシュ画面を表示
    setIsVisible(true);
    
    // フェードインアニメーション
    setTimeout(() => {
      setIsFadingIn(true);
    }, 50);

    // 3秒後にフェードアウト開始
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, SPLASH_DISPLAY_TIME);

    // フェードアウト完了後に非表示
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DISPLAY_TIME + 300); // フェードアウトアニメーション時間を考慮

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#F7F7F5' }}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          )}
        </div>
        <div
          className={`flex items-center justify-center gap-3 transition-opacity duration-500 ${
            isFadingIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <PiCoffeeBeanFill className="h-10 w-10 text-amber-600 flex-shrink-0" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 bg-clip-text text-transparent tracking-wide">
            ローストプラス
          </h1>
        </div>
      </div>
    </div>
  );
}


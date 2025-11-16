'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const SPLASH_DISPLAY_TIME = 3000; // 3秒

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [isTextVisible, setIsTextVisible] = useState(false);

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

    // テキストを少し遅れてフェードイン（控えめなアニメーション）
    const textFadeInTimer = setTimeout(() => {
      setIsTextVisible(true);
    }, 200);

    // 3秒後にフェードアウト開始
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, SPLASH_DISPLAY_TIME);

    // フェードアウト完了後に非表示
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DISPLAY_TIME + 300); // フェードアウトアニメーション時間を考慮

    return () => {
      clearTimeout(textFadeInTimer);
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
      style={{ backgroundColor: '#F5F1EB' }}
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
      </div>
    </div>
  );
}


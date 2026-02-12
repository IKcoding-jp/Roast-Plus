'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = '読み込み中...', fullScreen = true }: LoadingProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ファイル名にスペースがあるため、URLエンコードしてfetchで読み込む
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/Loading coffee bean.json');
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
        } else {
          console.error('Failed to load Lottie animation');
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, []);

  const containerClass = fullScreen
    ? 'flex min-h-screen items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClass} style={{ backgroundColor: '#F7F7F5' }}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {isLoading || !animationData ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              <div className="text-gray-400">読み込み中...</div>
            </div>
          ) : (
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          )}
        </div>
        {message && (
          <div className="text-lg text-gray-600">{message}</div>
        )}
      </div>
    </div>
  );
}


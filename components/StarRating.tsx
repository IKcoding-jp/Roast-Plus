'use client';

import { useState, useEffect, useRef } from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  size = 'md',
  showValue = true,
  className = '',
}: StarRatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observerで表示領域に入ったことを検知
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1, // 10%以上表示されたら検知
        rootMargin: '0px',
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // 評価なしの場合
  if (rating === 0) {
    return (
      <div ref={containerRef} className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-gray-500">評価なし</span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // サイズに応じたクラス
  const starSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  const gapClass = {
    sm: 'gap-0.5',
    md: 'gap-0.5',
    lg: 'gap-1',
  }[size];

  const marginClass = {
    sm: 'ml-1',
    md: 'ml-1',
    lg: 'ml-2',
  }[size];

  // 星の配列を生成（順番にアニメーションするため）
  const stars: Array<{ type: 'full' | 'half' | 'empty'; index: number }> = [];
  
  // 満点の星
  for (let i = 0; i < fullStars; i++) {
    stars.push({ type: 'full', index: i });
  }
  
  // 半星
  if (hasHalfStar) {
    stars.push({ type: 'half', index: fullStars });
  }
  
  // 空の星
  for (let i = 0; i < emptyStars; i++) {
    stars.push({ type: 'empty', index: fullStars + (hasHalfStar ? 1 : 0) + i });
  }

  return (
    <div 
      ref={containerRef} 
      className={`flex items-center ${gapClass} ${className}`}
    >
      {stars.map((star, index) => {
        const starChar = star.type === 'full' ? '★' : star.type === 'half' ? '☆' : '★';
        const starColor = star.type === 'empty' ? 'text-gray-300' : 'text-yellow-400';
        const delay = index * 0.1; // 0.1秒間隔で順次表示

        return (
          <span
            key={`${star.type}-${star.index}`}
            className={`${starColor} ${starSizeClass}`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0)',
              transition: isVisible
                ? `opacity 0.3s ease-out ${delay}s, transform 0.3s ease-out ${delay}s`
                : 'none',
            }}
          >
            {starChar}
          </span>
        );
      })}
      {showValue && (
        <span
          className={`${marginClass} text-sm font-semibold text-gray-700`}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: isVisible
              ? `opacity 0.3s ease-out ${stars.length * 0.1 + 0.1}s`
              : 'none',
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}


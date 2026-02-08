'use client';

import { memo, useState } from 'react';

type Flake = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  opacity: number;
  swayClass: string;
};

export const Snowfall = memo(function Snowfall() {
  const [snowflakes] = useState<Flake[]>(() => {
    const flakeCount = 25;
    return Array.from({ length: flakeCount }).map((_, i) => {
      const depthRand = Math.random();
      let size: number;
      let duration: string;
      let opacity: number;

      if (depthRand < 0.3) {
        // 背景層(30%) - 小さく、遅く、薄い
        size = 3 + Math.random() * 3;
        duration = `${14 + Math.random() * 8}s`;
        opacity = 0.25;
      } else if (depthRand < 0.7) {
        // 中間層(40%)
        size = 5 + Math.random() * 4;
        duration = `${10 + Math.random() * 5}s`;
        opacity = 0.45;
      } else {
        // 前景層(30%) - 大きく、速く、濃い
        size = 7 + Math.random() * 5;
        duration = `${7 + Math.random() * 3}s`;
        opacity = 0.65;
      }

      // 3種類のゆらゆらパターンをランダムに割り当て
      const swayVariants = ['sway-a', 'sway-b', 'sway-c'] as const;
      const swayClass = swayVariants[i % 3];

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration,
        size: Math.round(size),
        opacity,
        swayClass,
      };
    });
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-5vh);
          }
          100% {
            transform: translateY(105vh);
          }
        }
        @keyframes sway-a {
          0%, 100% {
            translate: 0 0;
          }
          25% {
            translate: 18px 0;
          }
          75% {
            translate: -12px 0;
          }
        }
        @keyframes sway-b {
          0%, 100% {
            translate: 0 0;
          }
          25% {
            translate: -15px 0;
          }
          75% {
            translate: 20px 0;
          }
        }
        @keyframes sway-c {
          0%, 100% {
            translate: 0 0;
          }
          33% {
            translate: 12px 0;
          }
          66% {
            translate: -18px 0;
          }
        }
        .snowflake {
          position: absolute;
          top: -10px;
          animation: snowfall linear infinite;
          will-change: transform, translate;
          contain: layout style;
        }
        .sway-a {
          animation: snowfall linear infinite, sway-a ease-in-out infinite;
        }
        .sway-b {
          animation: snowfall linear infinite, sway-b ease-in-out infinite;
        }
        .sway-c {
          animation: snowfall linear infinite, sway-c ease-in-out infinite;
        }
      `}</style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className={`snowflake ${flake.swayClass}`}
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            borderRadius: '50%',
            backgroundColor: `rgba(255, 255, 255, ${flake.opacity})`,
            animationDelay: `${flake.delay}, ${flake.delay}`,
            animationDuration: `${flake.duration}, ${3 + flake.id % 3}s`,
          }}
        />
      ))}
    </div>
  );
});

'use client';

import { useState } from 'react';

type Flake = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
  blur: string;
  depth: number;
};

export const Snowfall = () => {
  const [snowflakes] = useState<Flake[]>(() => {
    const flakeCount = 60;
    return Array.from({ length: flakeCount }).map((_, i) => {
      const depth = Math.floor(Math.random() * 3); // 0: back, 1: mid, 2: front
      let size = '2px';
      let duration = '15s';
      let blur = '0px';
      let opacity = 0.6;

      if (depth === 0) {
        size = `${1 + Math.random() * 2}px`;
        duration = `${15 + Math.random() * 10}s`;
        blur = '1px';
        opacity = 0.3;
      } else if (depth === 2) {
        size = `${4 + Math.random() * 4}px`;
        duration = `${5 + Math.random() * 5}s`;
        blur = '0px';
        opacity = 0.8;
      } else {
        size = `${2 + Math.random() * 3}px`;
        duration = `${8 + Math.random() * 7}s`;
        blur = '0px';
        opacity = 0.6;
      }

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration,
        size,
        opacity,
        blur,
        depth,
      };
    });
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) translateX(20px) rotate(180deg);
          }
          100% {
            transform: translateY(110vh) translateX(-10px) rotate(360deg);
          }
        }
        .snowflake {
          position: absolute;
          top: -10px;
          background: white;
          border-radius: 50%;
          filter: drop-shadow(0 0 2px white);
          animation: fall linear infinite;
        }
      `}</style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            filter: `blur(${flake.blur}) drop-shadow(0 0 2px rgba(255,255,255,0.5))`,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            zIndex: flake.depth,
          }}
        />
      ))}
    </div>
  );
};

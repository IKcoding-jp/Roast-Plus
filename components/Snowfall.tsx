'use client';

import { memo, useState } from 'react';

type SnowflakeShape = 'simple' | 'medium' | 'complex';

type Flake = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
  blur: string;
  depth: number;
  shape: SnowflakeShape;
};

// SVG雪の結晶コンポーネント(3種類)
const SimpleSnowflake = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const MediumSnowflake = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
    <line x1="9" y1="5" x2="11" y2="7" />
    <line x1="15" y1="5" x2="13" y2="7" />
    <line x1="9" y1="19" x2="11" y2="17" />
    <line x1="15" y1="19" x2="13" y2="17" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const ComplexSnowflake = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <line x1="1" y1="12" x2="23" y2="12" />
    <line x1="4" y1="4" x2="20" y2="20" />
    <line x1="20" y1="4" x2="4" y2="20" />
    <line x1="8" y1="4" x2="10" y2="6" />
    <line x1="16" y1="4" x2="14" y2="6" />
    <line x1="12" y1="4" x2="10" y2="6" />
    <line x1="12" y1="4" x2="14" y2="6" />
    <line x1="8" y1="20" x2="10" y2="18" />
    <line x1="16" y1="20" x2="14" y2="18" />
    <line x1="12" y1="20" x2="10" y2="18" />
    <line x1="12" y1="20" x2="14" y2="18" />
    <line x1="4" y1="9" x2="6" y2="11" />
    <line x1="4" y1="15" x2="6" y2="13" />
    <line x1="20" y1="9" x2="18" y2="11" />
    <line x1="20" y1="15" x2="18" y2="13" />
  </svg>
);

const SnowflakeShape = ({ shape, size }: { shape: SnowflakeShape; size: number }) => {
  switch (shape) {
    case 'simple':
      return <SimpleSnowflake size={size} />;
    case 'medium':
      return <MediumSnowflake size={size} />;
    case 'complex':
      return <ComplexSnowflake size={size} />;
  }
};

const getRandomShape = (): SnowflakeShape => {
  const rand = Math.random();
  if (rand < 0.4) return 'simple';      // 40%
  if (rand < 0.75) return 'medium';     // 35%
  return 'complex';                     // 25%
};

export const Snowfall = memo(function Snowfall() {
  const [snowflakes] = useState<Flake[]>(() => {
    const flakeCount = 60;
    return Array.from({ length: flakeCount }).map((_, i) => {
      const depthRand = Math.random();
      let sizeMin: number, sizeMax: number;
      let duration: string;
      let blur: string;
      let opacity: number;
      let depthValue: number;

      if (depthRand < 0.3) {
        // 背景層(30%)
        depthValue = 0;
        sizeMin = 12; sizeMax = 18;
        duration = `${15 + Math.random() * 10}s`;
        blur = '2px';
        opacity = 0.3;
      } else if (depthRand < 0.7) {
        // 中間層(40%)
        depthValue = 1;
        sizeMin = 18; sizeMax = 28;
        duration = `${10 + Math.random() * 5}s`;
        blur = '1px';
        opacity = 0.5;
      } else {
        // 前景層(30%)
        depthValue = 2;
        sizeMin = 28; sizeMax = 40;
        duration = `${7 + Math.random() * 3}s`;
        blur = '0px';
        opacity = 0.7;
      }

      const size = `${Math.floor(sizeMin + Math.random() * (sizeMax - sizeMin))}px`;

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration,
        size,
        opacity,
        blur,
        depth: depthValue,
        shape: getRandomShape(),
      };
    });
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <style jsx>{`
        @keyframes fall-and-swing {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(25vh) translateX(15px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(20px) rotate(270deg);
          }
          100% {
            transform: translateY(110vh) translateX(-5px) rotate(360deg);
          }
        }
        .snowflake {
          position: absolute;
          top: -10px;
          color: white;
          animation: fall-and-swing linear infinite;
          will-change: transform;
          pointer-events: none;
        }
      `}</style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            filter: `blur(${flake.blur}) drop-shadow(0 0 5px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 3px rgba(212, 175, 55, 0.4))`,
            opacity: flake.opacity,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            zIndex: flake.depth,
          }}
        >
          <SnowflakeShape shape={flake.shape} size={parseInt(flake.size)} />
        </div>
      ))}
    </div>
  );
});

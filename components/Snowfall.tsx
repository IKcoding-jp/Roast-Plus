'use client';

import { useEffect, useState } from 'react';

export const Snowfall = () => {
    const [snowflakes, setSnowflakes] = useState<{ id: number; left: string; delay: string; duration: string; size: string; opacity: number }[]>([]);

    useEffect(() => {
        const flakes = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${5 + Math.random() * 10}s`,
            size: `${2 + Math.random() * 4}px`,
            opacity: 0.3 + Math.random() * 0.5,
        }));
        setSnowflakes(flakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(0);
          }
          100% {
            transform: translateY(110vh) translateX(20px);
          }
        }
        .snowflake {
          position: absolute;
          top: -10px;
          background: white;
          border-radius: 50%;
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
                        animationDelay: flake.delay,
                        animationDuration: flake.duration,
                    }}
                />
            ))}
        </div>
    );
};

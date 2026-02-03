'use client';

import React from 'react';
import { formatTime } from '@/lib/drip-guide/formatTime';

interface TimerDisplayProps {
    currentTime: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ currentTime }) => {
    return (
        <div className="text-center mb-4 sm:mb-6 flex-shrink-0 -mt-4 sm:mt-0">
            <div
                className="text-8xl sm:text-7xl md:text-8xl lg:text-9xl tabular-nums font-bold text-gray-800 tracking-tighter leading-none"
                style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
                {formatTime(currentTime)}
            </div>
        </div>
    );
};

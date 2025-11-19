'use client';

import { useState, useEffect } from 'react';
import { RoastTimerState } from '@/types';
import { formatTimeAsMinutesAndSeconds } from '@/lib/roastTimerUtils';

interface RoastTimerDisplayProps {
    state: RoastTimerState | null;
}

export function RoastTimerDisplay({ state }: RoastTimerDisplayProps) {
    const [circleSize, setCircleSize] = useState(340);
    const strokeWidth = 16;

    // 画面サイズに応じて円のサイズを調整（スマホでは控えめに、デスクトップでは大きく表示）
    useEffect(() => {
        const updateSize = () => {
            // 画面の高さを考慮してサイズを決定
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // スマホ（640px未満）の場合は控えめなサイズ
            if (viewportWidth < 640) {
                if (viewportHeight >= 900) {
                    setCircleSize(300);
                } else if (viewportHeight >= 700) {
                    setCircleSize(280);
                } else {
                    setCircleSize(260);
                }
            } else if (viewportHeight >= 900) {
                // 大きな画面
                if (viewportWidth >= 1024) {
                    setCircleSize(480); // lg以上
                } else if (viewportWidth >= 768) {
                    setCircleSize(440); // md以上
                } else {
                    setCircleSize(400); // sm以上
                }
            } else if (viewportHeight >= 700) {
                // 中程度の画面
                if (viewportWidth >= 1024) {
                    setCircleSize(440);
                } else if (viewportWidth >= 768) {
                    setCircleSize(400);
                } else {
                    setCircleSize(360);
                }
            } else {
                // 小さな画面
                if (viewportWidth >= 768) {
                    setCircleSize(360);
                } else {
                    setCircleSize(320);
                }
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const isRunning = state?.status === 'running';
    const isPaused = state?.status === 'paused';
    const isCompleted = state?.status === 'completed';

    // 円形プログレスバーの計算
    const getProgress = () => {
        if (!state || state.duration === 0) return 0;
        const progress = (state.elapsed / state.duration) * 100;
        return Math.min(100, Math.max(0, progress));
    };

    const progress = getProgress();
    const remaining = state ? Math.max(0, state.remaining) : 0;

    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // 色の決定
    const getProgressColor = () => {
        if (isCompleted) return '#10b981';
        if (isPaused) return '#f59e0b';
        if (isRunning) return '#d97706';
        return '#d1d5db';
    };

    const progressColor = getProgressColor();

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">
            <div className="relative flex items-center justify-center">
                {/* 背景の円 */}
                <svg
                    width={circleSize}
                    height={circleSize}
                    viewBox={`0 0 ${circleSize} ${circleSize}`}
                    className="transform -rotate-90"
                >
                    <circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* プログレスバー */}
                    <circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        fill="none"
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-100 ease-linear"
                    />
                </svg>

                {/* 中央のテキスト */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-gray-500 text-lg sm:text-xl font-medium mb-1 sm:mb-2">
                        {isCompleted
                            ? '焙煎完了'
                            : isPaused
                                ? '一時停止中'
                                : isRunning
                                    ? '残り時間'
                                    : '待機中'}
                    </div>
                    <div
                        className={`font-bold tabular-nums tracking-tight leading-none ${isCompleted ? 'text-emerald-500' : isPaused ? 'text-amber-500' : 'text-gray-800'
                            }`}
                        style={{
                            fontSize: circleSize >= 400 ? '6rem' : circleSize >= 300 ? '5rem' : '4rem',
                        }}
                    >
                        {formatTimeAsMinutesAndSeconds(remaining)}
                    </div>
                    {(isRunning || isPaused) && (
                        <div className="text-gray-400 text-base sm:text-lg mt-2 sm:mt-4 font-medium">
                            {Math.round(progress)}% 完了
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

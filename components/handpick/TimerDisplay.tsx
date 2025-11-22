/**
 * ハンドピックタイマーの残り時間表示コンポーネント
 * リング状の進捗バーとして表示
 */

'use client';

import { useState, useEffect } from 'react';
import { formatTime, type TimerPhase } from '@/lib/handpickTimerUtils';

interface TimerDisplayProps {
    remainingSeconds: number;
    phase: TimerPhase;
    isRunning: boolean;
    totalSeconds: number; // フェーズごとの合計時間
}

export function TimerDisplay({ remainingSeconds, phase, isRunning, totalSeconds }: TimerDisplayProps) {
    const [circleSize, setCircleSize] = useState(340);
    const strokeWidth = 16;

    // 画面サイズに応じて円のサイズを調整（1画面レイアウト対応）
    useEffect(() => {
        const updateSize = () => {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // 1画面レイアウトに収まるよう、控えめなサイズに調整
            if (viewportWidth >= 1024) {
                // デスクトップ・大型iPad横向き
                if (viewportHeight >= 900) {
                    setCircleSize(380);
                } else if (viewportHeight >= 700) {
                    setCircleSize(340);
                } else {
                    setCircleSize(300);
                }
            } else if (viewportWidth >= 768) {
                // iPad縦向き・中型タブレット
                if (viewportHeight >= 900) {
                    setCircleSize(340);
                } else if (viewportHeight >= 700) {
                    setCircleSize(300);
                } else {
                    setCircleSize(260);
                }
            } else if (viewportWidth >= 640) {
                // 大きめスマホ横向き
                if (viewportHeight >= 600) {
                    setCircleSize(280);
                } else {
                    setCircleSize(240);
                }
            } else {
                // スマホ縦向き
                if (viewportHeight >= 700) {
                    setCircleSize(260);
                } else if (viewportHeight >= 600) {
                    setCircleSize(220);
                } else {
                    setCircleSize(200);
                }
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 進捗計算
    const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // フェーズごとの色設定（アンバー/オレンジ系）
    const getProgressColor = () => {
        if (phase === 'idle') return '#d1d5db'; // gray
        if (phase === 'first') return '#f59e0b'; // amber-500
        if (phase === 'second') return '#d97706'; // amber-600
        return '#d1d5db';
    };

    const progressColor = getProgressColor();

    return (
        <div className="flex items-center justify-center">
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
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                {/* 中央のテキスト */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                        className="font-black tabular-nums tracking-tight leading-none text-gray-800"
                        style={{
                            fontSize: circleSize >= 340 ? '5.5rem' : circleSize >= 280 ? '4.5rem' : circleSize >= 220 ? '3.5rem' : '3rem',
                        }}
                    >
                        {formatTime(remainingSeconds)}
                    </div>
                    {phase !== 'idle' && (
                        <div className="text-gray-400 text-base sm:text-lg mt-2 font-medium">
                            {Math.round(progress)}% 完了
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

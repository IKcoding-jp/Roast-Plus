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
    totalSeconds: number; // フェーズごとの合計時間
    onSkip?: () => void;
    isRunning?: boolean;
}

export function TimerDisplay({ remainingSeconds, phase, totalSeconds, onSkip }: TimerDisplayProps) {
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
                    setCircleSize(480); // iPad用に大きく
                } else if (viewportHeight >= 700) {
                    setCircleSize(440); // iPad用に大きく
                } else {
                    setCircleSize(400); // iPad用に大きく
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
                    setCircleSize(320);
                } else if (viewportHeight >= 600) {
                    setCircleSize(280);
                } else {
                    setCircleSize(260);
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
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>

                {/* 中央のテキスト */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                        className="font-black tabular-nums tracking-tight leading-none text-gray-800"
                        style={{
                            fontSize: circleSize >= 440 ? '7rem' : circleSize >= 400 ? '6.5rem' : circleSize >= 340 ? '5.5rem' : circleSize >= 280 ? '4.5rem' : circleSize >= 260 ? '4rem' : '3.5rem',
                        }}
                    >
                        {formatTime(remainingSeconds)}
                    </div>
                    {phase !== 'idle' && (
                        <>
                            <div className="text-gray-400 text-lg sm:text-lg mt-2 font-medium">
                                {Math.round(progress)}% 完了
                            </div>
                            {onSkip && (
                                <button
                                    onClick={onSkip}
                                    className="mt-2 px-4 py-1.5 text-sm sm:text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 min-h-[44px]"
                                >
                                    スキップ
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-4 sm:h-4">
                                        <path d="M4.5 3.25a.75.75 0 00-1.125.65v12.2a.75.75 0 001.125.65l9.75-6.1a.75.75 0 000-1.3l-9.75-6.1zM15.25 3.25a.75.75 0 00-.75.75v12a.75.75 0 001.5 0v-12a.75.75 0 00-.75-.75z" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

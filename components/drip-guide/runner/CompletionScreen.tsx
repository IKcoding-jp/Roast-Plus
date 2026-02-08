'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { Button } from '@/components/ui';

interface CompletionScreenProps {
    onReset: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ onReset }) => {
    const [animationData, setAnimationData] = useState<unknown>(null);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        const loadAnimation = async () => {
            try {
                const response = await fetch('/animations/Break Time.json');
                if (response.ok) {
                    const data = await response.json();
                    setAnimationData(data);
                } else {
                    console.error('Failed to load Lottie animation');
                }
            } catch (error) {
                console.error('Error loading Lottie animation:', error);
            }
        };

        loadAnimation();
    }, []);

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(0.5);
        }
    }, [animationData]);

    return (
        <div className="flex flex-col items-center justify-center h-[100dvh] text-center p-6 bg-surface">
            <div className="mb-6 flex items-center justify-center">
                {animationData ? (
                    <Lottie
                        lottieRef={lottieRef}
                        animationData={animationData}
                        loop={false}
                        style={{ width: 160, height: 160 }}
                        onDOMLoaded={() => {
                            lottieRef.current?.setSpeed(0.5);
                        }}
                    />
                ) : (
                    <div className="w-40 h-40 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-spot border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            <h2 className="text-3xl font-bold text-ink mb-2">抽出完了！</h2>
            <p className="text-ink-sub mb-8">お疲れ様でした。美味しいコーヒーを楽しみましょう。</p>

            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={onReset}
                    className="!rounded-full"
                >
                    もう一度淹れる
                </Button>
                <Link href="/drip-guide">
                    <Button
                        variant="primary"
                        className="!rounded-full"
                    >
                        一覧に戻る
                    </Button>
                </Link>
            </div>
        </div>
    );
};

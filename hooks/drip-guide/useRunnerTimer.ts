import { useEffect, useRef } from 'react';

interface UseRunnerTimerProps {
    isRunning: boolean;
    isManualMode: boolean;
    totalDurationSec: number;
    onTick: (updater: (prev: number) => number) => void;
    onComplete: () => void;
}

/**
 * ドリップガイドのタイマーロジックを管理するカスタムフック
 */
export const useRunnerTimer = ({
    isRunning,
    isManualMode,
    totalDurationSec,
    onTick,
    onComplete,
}: UseRunnerTimerProps) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isRunning) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            return;
        }

        timerRef.current = setInterval(() => {
            onTick((prev) => {
                const next = prev + 1;
                if (!isManualMode && next >= totalDurationSec) {
                    onComplete();
                    return totalDurationSec;
                }
                return next;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isManualMode, totalDurationSec, onTick, onComplete]);

    return timerRef;
};

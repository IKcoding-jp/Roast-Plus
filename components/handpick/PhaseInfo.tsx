/**
 * フェーズ情報とメッセージ表示コンポーネント
 */

'use client';

import { getPhaseName, getPhaseMessage, type TimerPhase } from '@/lib/handpickTimerUtils';

interface PhaseInfoProps {
    phase: TimerPhase;
    isRunning: boolean;
}

export function PhaseInfo({ phase, isRunning }: PhaseInfoProps) {
    const phaseName = getPhaseName(phase);
    const message = getPhaseMessage(phase, isRunning);

    // フェーズごとの背景色
    const getPhaseColor = () => {
        if (phase === 'first') return 'bg-amber-50 border-amber-200';
        if (phase === 'second') return 'bg-orange-50 border-orange-200';
        return 'bg-gray-50 border-gray-200';
    };

    return (
        <div className={`rounded-2xl border-2 p-4 ${getPhaseColor()} transition-colors duration-300`}>
            <div className="text-center space-y-2">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {phaseName}
                </div>
                <div className="text-lg font-bold text-gray-800">
                    {message}
                </div>
            </div>
        </div>
    );
}

/**
 * ハンドピックタイマーのメインコンポーネント
 * 3ブロック構成（上部・中央・下部）で縦スクロール不要な1画面UI
 */

'use client';

import { useHandpickTimer } from '@/hooks/useHandpickTimer';
import { TimerDisplay } from './TimerDisplay';
import { getPhaseName, getPhaseMessage } from '@/lib/handpickTimerUtils';
import { BeanOriginInput } from './BeanOriginInput';
import { TimeSettingInput } from './TimeSettingInput';
import { TimerControls } from './TimerControls';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';

export function HandpickTimerMain() {
    const { state, start, pause, resume, reset, setBeanOrigin, setSoundEnabled, setFirstMinutes, setSecondMinutes } =
        useHandpickTimer();

    // 現在のフェーズの合計時間を取得（秒単位）
    const getTotalSeconds = () => {
        if (state.phase === 'first') return state.firstMinutes * 60;
        if (state.phase === 'second') return state.secondMinutes * 60;
        return 0;
    };

    const phaseName = getPhaseName(state.phase);
    const message = getPhaseMessage(state.phase, state.isRunning);

    return (
        <div className="h-screen flex flex-col bg-[#F7F7F5] overflow-hidden">
            {/* 上部エリア（コンパクト） */}
            <div className="flex-none px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 items-stretch">
                    <BeanOriginInput
                        value={state.beanOrigin}
                        onChange={setBeanOrigin}
                        disabled={state.isRunning}
                    />
                    <TimeSettingInput
                        firstMinutes={state.firstMinutes}
                        secondMinutes={state.secondMinutes}
                        onFirstChange={setFirstMinutes}
                        onSecondChange={setSecondMinutes}
                        disabled={state.isRunning}
                    />
                </div>
            </div>

            {/* 中央エリア（メイン表示、最も大きい） */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
                <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-2 sm:space-y-3 lg:space-y-4">
                    {/* フェーズ名 */}
                    <div className="text-center">
                        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-500 uppercase tracking-wider">
                            {phaseName}
                        </h2>
                    </div>

                    {/* タイマー表示 */}
                    <TimerDisplay
                        remainingSeconds={state.remainingSeconds}
                        phase={state.phase}
                        isRunning={state.isRunning}
                        totalSeconds={getTotalSeconds()}
                    />
                </div>
            </div>

            {/* 下部エリア（情報と操作） */}
            <div className="flex-none px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
                <div className="max-w-5xl mx-auto space-y-2 sm:space-y-3">
                    {/* サウンド切り替えボタン（作業メッセージの上） */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setSoundEnabled(!state.soundEnabled)}
                            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-sm border transition-all flex items-center justify-center gap-2 ${state.soundEnabled
                                    ? 'bg-[#EF8A00] text-white border-[#EF8A00]'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                        >
                            {state.soundEnabled ? <HiVolumeUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <HiVolumeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                            <span className="hidden sm:inline">{state.soundEnabled ? '音あり' : '音なし'}</span>
                        </button>
                    </div>

                    {/* サイクル数と作業メッセージを横並び */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {/* サイクル数（コンパクト版） */}
                        <div className="bg-white/80 rounded-lg border border-gray-100 px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-gray-600">今日のサイクル数</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-black text-[#EF8A00] tabular-nums">{state.cycleCount}</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-400">セット</span>
                            </div>
                        </div>

                        {/* 作業メッセージ（コンパクト版） */}
                        <div className={`rounded-lg border px-3 py-2 sm:px-4 sm:py-2.5 transition-colors duration-300 flex items-center justify-center ${state.phase === 'first' ? 'bg-amber-50/80 border-amber-200' :
                            state.phase === 'second' ? 'bg-orange-50/80 border-orange-200' :
                                'bg-gray-50/80 border-gray-200'
                            }`}>
                            <p className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 text-center leading-tight">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* 操作ボタン */}
                    <TimerControls
                        phase={state.phase}
                        isRunning={state.isRunning}
                        soundEnabled={state.soundEnabled}
                        onStart={start}
                        onPause={pause}
                        onResume={resume}
                        onReset={reset}
                        onToggleSound={() => setSoundEnabled(!state.soundEnabled)}
                    />
                </div>
            </div>
        </div>
    );
}

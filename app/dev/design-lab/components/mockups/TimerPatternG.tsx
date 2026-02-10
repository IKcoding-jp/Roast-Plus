'use client';

import { ArrowLeft, ArrowCounterClockwise, Play, X, Drop, Timer } from 'phosphor-react';

// --- Mock Data ---
const MOCK_STEPS = [
  { id: '1', title: '蒸らし（味：40%）', description: '粉全体にまんべんなく注いで、均一に湿らせます', startTimeSec: 0, targetTotalWater: 30, note: '蒸らしのお湯を入れたタイミングでタイマーを開始してください。' },
  { id: '2', title: '2投目（味：40%）', description: '中心から外へ円を描くように注ぐ', startTimeSec: 45, targetTotalWater: 60 },
  { id: '3', title: '濃度調整（60%）', description: '中心に細く注ぐ', startTimeSec: 90, targetTotalWater: 150 },
];
const MOCK_CURRENT_TIME = 30;
const MOCK_CURRENT_STEP_INDEX = 0;
const MOCK_RECIPE_NAME = '4:6メソッド（粕谷 哲）';
const MOCK_TOTAL_DURATION = 135;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerPatternG() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const overallProgress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;

  // ステップ内の経過
  const stepStart = currentStep.startTimeSec;
  const stepEnd = nextStep ? nextStep.startTimeSec : MOCK_TOTAL_DURATION;
  const stepProgress = (MOCK_CURRENT_TIME - stepStart) / (stepEnd - stepStart);
  const secondsUntilNext = stepEnd - MOCK_CURRENT_TIME;

  return (
    <div className="max-w-sm mx-auto">
      <div className="h-[667px] rounded-3xl border-2 border-edge overflow-hidden flex flex-col bg-ground">
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-4 py-3 bg-surface border-b border-edge">
          <div className="flex items-center gap-2">
            <button className="p-1 text-ink/60">
              <ArrowLeft size={20} weight="bold" />
            </button>
            <span className="text-sm font-medium text-ink truncate max-w-[160px]">
              {MOCK_RECIPE_NAME}
            </span>
          </div>
          <span className="text-sm font-semibold text-spot">
            Step {MOCK_CURRENT_STEP_INDEX + 1}/{MOCK_STEPS.length}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col px-5 pt-5 pb-3 overflow-y-auto">
          {/* Timer */}
          <div className="text-center mb-4">
            <div
              className="text-7xl font-bold text-ink tracking-tight tabular-nums leading-none"
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
              {formatTime(MOCK_CURRENT_TIME)}
            </div>
          </div>

          {/* Current Step Card */}
          <div className="rounded-2xl border-2 border-spot bg-surface p-4 shadow-sm mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-spot flex items-center justify-center">
                <Drop size={14} weight="fill" className="text-white" />
              </div>
              <span className="text-base font-bold text-ink">
                {currentStep.title}
              </span>
            </div>
            {currentStep.targetTotalWater && (
              <div className="mb-1.5">
                <span
                  className="text-3xl font-bold text-spot tabular-nums"
                  style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                >
                  {currentStep.targetTotalWater}g
                </span>
                <span className="text-sm text-ink/50 ml-1">まで注ぐ</span>
              </div>
            )}
            <p className="text-sm text-ink/70 leading-relaxed">
              {currentStep.description}
            </p>
            {currentStep.note && (
              <p className="text-xs text-ink/40 mt-1.5 italic">
                {currentStep.note}
              </p>
            )}
          </div>

          {/* Countdown to Next Step - 主役 */}
          {nextStep && (
            <div className="rounded-xl bg-surface border border-edge p-3 mb-3">
              {/* カウントダウンバー */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-spot/10 flex items-center justify-center flex-shrink-0">
                  <Timer size={18} weight="bold" className="text-spot" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-ink/60">次のステップまで</span>
                    <span
                      className="text-2xl font-bold text-spot tabular-nums"
                      style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                    >
                      {secondsUntilNext}<span className="text-sm font-semibold">秒</span>
                    </span>
                  </div>
                  {/* プログレスバー（残り時間を視覚化） */}
                  <div className="w-full h-2 rounded-full bg-ground overflow-hidden">
                    <div
                      className="h-full rounded-full bg-spot transition-all"
                      style={{ width: `${(1 - stepProgress) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 次のステップ情報 */}
              <div className="flex items-center gap-2 pl-11">
                <div className="w-5 h-5 rounded-full bg-ink/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-ink/50">
                    {MOCK_CURRENT_STEP_INDEX + 2}
                  </span>
                </div>
                <span className="text-sm font-semibold text-ink/60">
                  {nextStep.title}
                </span>
                {nextStep.targetTotalWater && (
                  <span className="text-xs text-ink/40">
                    / {nextStep.targetTotalWater}gまで
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Remaining steps */}
          {MOCK_CURRENT_STEP_INDEX + 2 < MOCK_STEPS.length && (
            <p className="text-xs text-ink/40 text-center">
              + 残り {MOCK_STEPS.length - MOCK_CURRENT_STEP_INDEX - 2} ステップ
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex-none px-4 pb-1">
          <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-spot/40"
              style={{ width: `${overallProgress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            <span className="text-[10px] text-ink/30 tabular-nums">
              {formatTime(MOCK_CURRENT_TIME)}
            </span>
            <span className="text-[10px] text-ink/30 tabular-nums">
              {formatTime(MOCK_TOTAL_DURATION)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-none flex items-center justify-center gap-8 px-4 py-3 bg-surface border-t border-edge">
          <button className="p-3 rounded-full text-ink/50 hover:bg-ground transition-colors">
            <ArrowCounterClockwise size={22} weight="bold" />
          </button>
          <button className="p-4 rounded-full bg-spot text-white shadow-md">
            <Play size={28} weight="fill" className="ml-0.5" />
          </button>
          <button className="p-3 rounded-full text-ink/50 hover:bg-ground transition-colors">
            <X size={22} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

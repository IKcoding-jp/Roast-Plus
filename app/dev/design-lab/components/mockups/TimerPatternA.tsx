'use client';

import { ArrowLeft, ArrowCounterClockwise, Pause, X, Drop } from 'phosphor-react';

// --- Mock Data ---
const MOCK_STEPS = [
  {
    id: '1',
    title: '蒸らし',
    description: '中心からゆっくり40g注ぐ',
    startTimeSec: 0,
    targetTotalWater: 40,
    note: '30秒待ちます',
  },
  {
    id: '2',
    title: '2回目の注ぎ',
    description: '中心から外へ円を描くように注ぐ',
    startTimeSec: 30,
    targetTotalWater: 120,
  },
  {
    id: '3',
    title: '3回目の注ぎ',
    description: '中心から外へ円を描くように注ぐ',
    startTimeSec: 120,
    targetTotalWater: 180,
  },
  {
    id: '4',
    title: '4回目の注ぎ',
    description: '細く中心に注ぐ',
    startTimeSec: 180,
    targetTotalWater: 240,
  },
  {
    id: '5',
    title: '待ち',
    description: 'ドリッパーを外すまで待つ',
    startTimeSec: 210,
  },
];
const MOCK_CURRENT_TIME = 60;
const MOCK_CURRENT_STEP_INDEX = 1;
const MOCK_RECIPE_NAME = 'V60 スタンダード';
const MOCK_TOTAL_DURATION = 270;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerPatternA() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const progress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;
  const timeUntilNext = nextStep
    ? nextStep.startTimeSec - MOCK_CURRENT_TIME
    : 0;

  return (
    <div className="max-w-sm mx-auto">
      <div
        className="h-[667px] rounded-3xl border-2 border-edge overflow-hidden flex flex-col bg-ground"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-edge">
          <div className="flex items-center gap-2">
            <button className="p-1 text-ink/60 hover:text-ink">
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
        <div className="flex-1 flex flex-col items-center px-5 pt-6 pb-4 overflow-y-auto gap-4">
          {/* Timer Display */}
          <div className="text-center">
            <div
              className="text-6xl font-bold text-ink tracking-tight"
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
              {formatTime(MOCK_CURRENT_TIME)}
            </div>
            {nextStep && (
              <p className="text-xs text-ink/50 mt-1">
                次のステップまで {timeUntilNext}秒
              </p>
            )}
          </div>

          {/* Current Step Card */}
          <div className="w-full rounded-2xl border-2 border-spot bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-spot flex items-center justify-center">
                <Drop size={14} weight="fill" className="text-white" />
              </div>
              <span className="text-base font-bold text-ink">
                {currentStep.title}
              </span>
            </div>
            {currentStep.targetTotalWater && (
              <div className="mb-2">
                <span
                  className="text-3xl font-bold text-spot"
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
              <p className="text-xs text-ink/50 mt-2 italic">
                {currentStep.note}
              </p>
            )}
          </div>

          {/* Next Step Card (semi-transparent) */}
          {nextStep && (
            <div className="w-full rounded-xl border border-edge bg-surface/50 p-3 opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-ink/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-ink/60">
                    {MOCK_CURRENT_STEP_INDEX + 2}
                  </span>
                </div>
                <span className="text-sm font-semibold text-ink/70">
                  {nextStep.title}
                </span>
              </div>
              <p className="text-xs text-ink/50 ml-7">
                {formatTime(nextStep.startTimeSec)} 開始
                {nextStep.targetTotalWater && ` / ${nextStep.targetTotalWater}g`}
              </p>
            </div>
          )}

          {/* Upcoming Steps Indicator */}
          {MOCK_CURRENT_STEP_INDEX + 2 < MOCK_STEPS.length && (
            <p className="text-xs text-ink/40">
              + 残り {MOCK_STEPS.length - MOCK_CURRENT_STEP_INDEX - 2} ステップ
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-1">
          <div className="w-full h-2 rounded-full bg-ground overflow-hidden">
            <div
              className="h-full rounded-full bg-spot transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            <span className="text-[10px] text-ink/40">
              {formatTime(MOCK_CURRENT_TIME)}
            </span>
            <span className="text-[10px] text-ink/40">
              {formatTime(MOCK_TOTAL_DURATION)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 px-4 py-4 bg-surface border-t border-edge">
          <button className="p-3 rounded-full text-ink/50 hover:text-ink hover:bg-ground transition-colors">
            <ArrowCounterClockwise size={22} weight="bold" />
          </button>
          <button className="p-4 rounded-full bg-spot text-white shadow-md hover:opacity-90 transition-opacity">
            <Pause size={28} weight="fill" />
          </button>
          <button className="p-3 rounded-full text-ink/50 hover:text-ink hover:bg-ground transition-colors">
            <X size={22} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

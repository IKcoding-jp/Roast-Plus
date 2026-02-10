'use client';

import { ArrowLeft, ArrowCounterClockwise, Pause, X } from 'phosphor-react';

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

export default function TimerPatternB() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const progress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;

  return (
    <div className="max-w-sm mx-auto">
      <div className="h-[667px] rounded-3xl border-2 border-edge overflow-hidden flex flex-col bg-ground">
        {/* Header - minimal */}
        <div className="flex items-center justify-between px-4 py-3">
          <button className="p-1 text-ink/40 hover:text-ink">
            <ArrowLeft size={20} weight="bold" />
          </button>
          <span className="text-xs text-ink/40 font-medium">
            {MOCK_RECIPE_NAME}
          </span>
          <div className="w-7" />
        </div>

        {/* Main Content - centered focus */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-4">
          {/* Timer - hero size */}
          <div
            className="text-8xl font-bold text-ink tracking-tighter leading-none"
            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
          >
            {formatTime(MOCK_CURRENT_TIME)}
          </div>

          {/* Step Name - large */}
          <h2 className="text-3xl font-bold text-ink mt-5">
            {currentStep.title}
          </h2>

          {/* Water Target Badge */}
          {currentStep.targetTotalWater && (
            <div className="mt-4 px-6 py-2.5 rounded-full bg-spot/10 border border-spot/30">
              <span
                className="text-2xl font-bold text-spot"
                style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
              >
                {currentStep.targetTotalWater}g
              </span>
              <span className="text-sm text-spot/70 ml-1.5">まで</span>
            </div>
          )}

          {/* Description */}
          <p className="text-lg text-ink/60 mt-4 text-center leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="px-5 pb-4 space-y-3">
          {/* Progress Bar with Step Count */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-spot transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-ink/40 whitespace-nowrap">
                {MOCK_CURRENT_STEP_INDEX + 1}/{MOCK_STEPS.length}
              </span>
            </div>
          </div>

          {/* Next Step Preview */}
          {nextStep && (
            <p className="text-xs text-ink/35 text-center">
              次: {nextStep.title}
              {nextStep.startTimeSec !== undefined &&
                ` (${formatTime(nextStep.startTimeSec)})`}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-10 px-4 py-5 border-t border-edge/50">
          <button className="p-3 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors">
            <ArrowCounterClockwise size={22} weight="bold" />
          </button>
          <button className="p-5 rounded-full bg-spot text-white shadow-lg hover:opacity-90 transition-opacity">
            <Pause size={30} weight="fill" />
          </button>
          <button className="p-3 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors">
            <X size={22} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

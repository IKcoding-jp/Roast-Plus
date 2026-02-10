'use client';

import { ArrowLeft, ArrowCounterClockwise, Pause, X, Drop, Check } from 'phosphor-react';

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

export default function TimerPatternE() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const prevStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX - 1];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const progress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;
  const timeUntilNext = nextStep
    ? nextStep.startTimeSec - MOCK_CURRENT_TIME
    : 0;

  return (
    <div className="max-w-sm mx-auto">
      <div className="h-[667px] rounded-3xl border-2 border-edge overflow-hidden flex flex-col bg-ground">
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
        </div>

        {/* Timer + Step indicator */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div
            className="text-4xl font-bold text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
          >
            {formatTime(MOCK_CURRENT_TIME)}
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-spot">
              Step {MOCK_CURRENT_STEP_INDEX + 1}/{MOCK_STEPS.length}
            </span>
            {nextStep && (
              <p className="text-xs text-ink/50 mt-0.5">
                次のステップまで {timeUntilNext}秒
              </p>
            )}
          </div>
        </div>

        {/* Slider Area */}
        <div className="flex-1 flex flex-col justify-center px-2 overflow-hidden">
          <div className="flex items-stretch gap-3" style={{ marginLeft: '-20px', marginRight: '-20px' }}>
            {/* Previous Step (peeking from left) */}
            {prevStep ? (
              <div className="w-[60px] min-w-[60px] rounded-xl border border-edge bg-surface/60 p-2 flex flex-col justify-center opacity-50">
                <div className="w-5 h-5 rounded-full bg-spot/30 flex items-center justify-center mx-auto mb-1">
                  <Check size={12} weight="bold" className="text-spot" />
                </div>
                <p className="text-[10px] font-medium text-ink/50 text-center leading-tight truncate">
                  {prevStep.title}
                </p>
              </div>
            ) : (
              <div className="w-[60px] min-w-[60px]" />
            )}

            {/* Current Step (center, large) */}
            <div className="flex-1 rounded-2xl border-2 border-spot bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-spot flex items-center justify-center">
                  <Drop size={16} weight="fill" className="text-white" />
                </div>
                <span className="text-base font-bold text-ink">
                  {currentStep.title}
                </span>
              </div>
              {currentStep.targetTotalWater && (
                <div className="mb-3">
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

              {/* Dot Indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {MOCK_STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    className={`rounded-full transition-all ${
                      i === MOCK_CURRENT_STEP_INDEX
                        ? 'w-5 h-2 bg-spot'
                        : i < MOCK_CURRENT_STEP_INDEX
                          ? 'w-2 h-2 bg-spot/40'
                          : 'w-2 h-2 bg-ink/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next Step (peeking from right) */}
            {nextStep ? (
              <div className="w-[60px] min-w-[60px] rounded-xl border border-edge bg-surface/60 p-2 flex flex-col justify-center opacity-50">
                <div className="w-5 h-5 rounded-full bg-ink/15 flex items-center justify-center mx-auto mb-1">
                  <span className="text-[10px] font-semibold text-ink/50">
                    {MOCK_CURRENT_STEP_INDEX + 2}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-ink/50 text-center leading-tight truncate">
                  {nextStep.title}
                </p>
              </div>
            ) : (
              <div className="w-[60px] min-w-[60px]" />
            )}
          </div>
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

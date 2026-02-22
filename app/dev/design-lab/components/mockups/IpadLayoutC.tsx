'use client';

import { ArrowLeft, ArrowCounterClockwise, Play, X, Drop, CaretRight } from 'phosphor-react';

const MOCK_STEPS = [
  { id: '1', title: '蒸らし（味：40%）', description: '粉全体にまんべんなく注いで、均一に湿らせます', startTimeSec: 0, targetTotalWater: 30, note: '蒸らしのお湯を入れたタイミングでタイマーを開始してください。' },
  { id: '2', title: '2投目（味：40%）', description: '中心から外へ円を描くように注ぐ', startTimeSec: 45, targetTotalWater: 60 },
  { id: '3', title: '濃度調整（60%）', description: '中心に細く注ぐ', startTimeSec: 90, targetTotalWater: 150 },
  { id: '4', title: '仕上げ①（強度）', description: '外側から内側に向かって注ぐ', startTimeSec: 130, targetTotalWater: 200 },
  { id: '5', title: '仕上げ②（強度）', description: '中心から注いで完成', startTimeSec: 170, targetTotalWater: 250 },
];

const MOCK_CURRENT_TIME = 30;
const MOCK_CURRENT_STEP_INDEX = 0;
const MOCK_RECIPE_NAME = '4:6メソッド（粕谷 哲）';
const MOCK_TOTAL_DURATION = 210;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Option C: タイマーをヘッダー統合 / 説明左・注水量右の2カラム
export default function IpadLayoutC() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const overallProgress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;

  const stepStart = currentStep.startTimeSec;
  const stepEnd = nextStep ? nextStep.startTimeSec : MOCK_TOTAL_DURATION;
  const stepProgress = (MOCK_CURRENT_TIME - stepStart) / (stepEnd - stepStart);
  const secondsUntilNext = stepEnd - MOCK_CURRENT_TIME;
  const remainingStepsAfterNext = MOCK_STEPS.length - MOCK_CURRENT_STEP_INDEX - 2;

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="mb-2 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-spot text-white text-xs font-bold">Option C</span>
        <span className="text-xs text-ink-muted">タイマーをヘッダー統合・説明左＋注水量右の2カラム</span>
      </div>

      {/* iPad landscape frame */}
      <div className="h-[580px] rounded-2xl border-2 border-edge overflow-hidden flex flex-col bg-ground shadow-lg">

        {/* Combined header: back + step counter + timer + progress */}
        <div className="flex-none bg-surface/80 border-b border-edge px-6 py-3">
          <div className="flex items-center gap-6">
            <button className="p-1.5 rounded-full text-ink-muted hover:text-ink-sub transition-colors flex-none">
              <ArrowLeft size={18} weight="bold" />
            </button>

            {/* Timer — prominent in header */}
            <div className="flex items-baseline gap-2 flex-none">
              <span className="text-[3.5rem] font-extrabold text-ink tracking-[-0.04em] tabular-nums leading-none font-nunito">
                {formatTime(MOCK_CURRENT_TIME)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-ink-muted font-medium">{MOCK_RECIPE_NAME}</span>
                <span className="text-[10px] font-bold text-ink-muted tracking-[0.12em] uppercase">
                  Step {MOCK_CURRENT_STEP_INDEX + 1} / {MOCK_STEPS.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[4px] rounded-full bg-edge overflow-hidden">
                  <div
                    className="h-full rounded-full bg-spot/60 transition-all duration-1000 ease-linear"
                    style={{ width: `${overallProgress * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink-muted tabular-nums font-medium whitespace-nowrap">
                  {formatTime(MOCK_CURRENT_TIME)} / {formatTime(MOCK_TOTAL_DURATION)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-column content */}
        <div className="flex-1 flex min-h-0">

          {/* Left column: Step title + description + note */}
          <div className="flex-1 flex flex-col justify-center px-8 py-6 border-r border-edge/40">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-spot flex items-center justify-center shadow-sm">
                <Drop size={18} weight="fill" className="text-white" />
              </div>
              <span className="text-[19px] font-bold text-ink leading-tight">
                {currentStep.title}
              </span>
            </div>

            <p className="text-[15px] text-ink-sub leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {currentStep.note && (
              <p className="text-xs text-ink-muted leading-relaxed italic">
                {currentStep.note}
              </p>
            )}

            {/* Next step preview */}
            {nextStep && (
              <div className="mt-6 flex items-center gap-3 py-3 px-4 rounded-xl bg-surface border border-edge/50">
                <CaretRight size={14} weight="bold" className="text-spot/40 flex-none" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-ink-sub truncate block">
                    次: {nextStep.title}
                  </span>
                  {nextStep.targetTotalWater && (
                    <span className="text-xs text-ink-muted">{nextStep.targetTotalWater}gまで</span>
                  )}
                </div>
                <div className="flex items-baseline flex-shrink-0">
                  <span className="text-xl font-extrabold text-spot tabular-nums leading-none font-nunito">
                    {secondsUntilNext}
                  </span>
                  <span className="text-[10px] font-bold text-spot/50 ml-0.5">秒</span>
                </div>
              </div>
            )}

            {remainingStepsAfterNext > 0 && (
              <p className="text-[10px] text-ink-muted mt-3 tracking-wide font-medium">
                残り {remainingStepsAfterNext} ステップ
              </p>
            )}
          </div>

          {/* Right column: Water amount (primary focus) */}
          <div className="w-[42%] flex flex-col items-center justify-center px-8 py-6">
            {currentStep.targetTotalWater ? (
              <div className="text-center">
                <p className="text-sm text-ink-muted font-medium mb-3 tracking-wide">注水目標量</p>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-[7rem] font-extrabold text-spot tabular-nums tracking-tight leading-none font-nunito">
                    {currentStep.targetTotalWater}
                  </span>
                  <span className="text-3xl font-bold text-spot/50">g</span>
                </div>
                <p className="text-base text-ink-muted mt-3 font-medium">まで注ぐ</p>

                {/* Step progress bar */}
                <div className="mt-6 w-full">
                  <div className="w-full h-2 rounded-full bg-edge overflow-hidden">
                    <div
                      className="h-full rounded-full bg-spot/50 transition-all duration-1000 ease-linear"
                      style={{ width: `${stepProgress * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1.5 text-center font-medium">
                    このステップの経過時間
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-ink-muted text-center text-sm">このステップに注水量はありません</p>
            )}
          </div>
        </div>

        {/* Footer controls — full width */}
        <div className="flex-none bg-surface border-t border-edge py-4 px-8">
          <div className="flex items-center justify-center gap-12">
            <button className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2">
              <div className="p-3 rounded-full bg-ground">
                <ArrowCounterClockwise size={24} />
              </div>
              <span className="text-xs font-medium">リセット</span>
            </button>
            <button className="w-20 h-20 rounded-full bg-spot text-white flex items-center justify-center shadow-xl active:scale-95 transition-all shadow-spot/30">
              <Play size={36} weight="fill" className="ml-1" />
            </button>
            <button className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2">
              <div className="p-3 rounded-full bg-ground">
                <X size={24} />
              </div>
              <span className="text-xs font-medium">終了</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

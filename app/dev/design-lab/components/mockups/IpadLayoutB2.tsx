'use client';

import { ArrowLeft, ArrowCounterClockwise, Play, X, Drop, CaretRight, CheckCircle } from 'phosphor-react';

const MOCK_STEPS = [
  { id: '1', title: '蒸らし（味：40%）', description: '粉全体にまんべんなく注いで、均一に湿らせます', startTimeSec: 0, targetTotalWater: 30, note: '蒸らしのお湯を入れたタイミングでタイマーを開始してください。' },
  { id: '2', title: '2投目（味：40%）', description: '中心から外へ円を描くように注ぐ', startTimeSec: 45, targetTotalWater: 60 },
  { id: '3', title: '濃度調整（60%）', description: '中心に細く注ぐ', startTimeSec: 90, targetTotalWater: 150 },
  { id: '4', title: '仕上げ①（強度）', description: '外側から内側に向かって注ぐ', startTimeSec: 130, targetTotalWater: 200 },
  { id: '5', title: '仕上げ②（強度）', description: '中心から注いで完成', startTimeSec: 170, targetTotalWater: 250 },
];

const MOCK_CURRENT_TIME = 55;
const MOCK_CURRENT_STEP_INDEX = 1;
const MOCK_RECIPE_NAME = '4:6メソッド（粕谷 哲）';
const MOCK_TOTAL_DURATION = 210;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * B-2: バランス型
 * 右カラム上部にタイマー大、下部にステップカード。
 * タイマーとステップ情報の両方を広く使う。
 */
export default function IpadLayoutB2() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const overallProgress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;

  const stepStart = currentStep.startTimeSec;
  const stepEnd = nextStep ? nextStep.startTimeSec : MOCK_TOTAL_DURATION;
  const stepProgress = (MOCK_CURRENT_TIME - stepStart) / (stepEnd - stepStart);
  const secondsUntilNext = stepEnd - MOCK_CURRENT_TIME;

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="mb-2 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-spot text-white text-xs font-bold">B-2</span>
        <span className="text-xs text-ink-muted">バランス型・右カラム上部タイマー大＋下部ステップカード</span>
      </div>

      <div className="h-[580px] rounded-2xl border-2 border-edge overflow-hidden flex flex-col bg-ground shadow-lg">

        {/* Header */}
        <div className="flex-none flex items-center justify-between px-5 pt-4 pb-2 bg-ground">
          <button className="p-1.5 rounded-full text-ink-muted hover:text-ink-sub transition-colors">
            <ArrowLeft size={18} weight="bold" />
          </button>
          <span className="text-[11px] font-bold text-ink-muted tracking-[0.15em] uppercase">
            Step {MOCK_CURRENT_STEP_INDEX + 1} / {MOCK_STEPS.length}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex min-h-0">

          {/* Left: Step list */}
          <div className="w-[230px] flex-none border-r border-edge bg-surface/20 overflow-y-auto py-3 px-3">
            <div className="space-y-0.5">
              {MOCK_STEPS.map((step, index) => {
                const isDone = index < MOCK_CURRENT_STEP_INDEX;
                const isCurrent = index === MOCK_CURRENT_STEP_INDEX;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                      isCurrent ? 'bg-spot/10 border border-spot/20' : ''
                    }`}
                  >
                    <div className="flex-none mt-0.5">
                      {isDone ? (
                        <CheckCircle size={16} weight="fill" className="text-spot/50" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full bg-spot flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-edge-strong" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold leading-tight truncate ${
                        isCurrent ? 'text-spot' : isDone ? 'text-ink-muted line-through' : 'text-ink-sub'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-[10px] mt-0.5 tabular-nums font-medium ${
                        isCurrent ? 'text-spot/70' : isDone ? 'text-ink-muted/50' : 'text-ink-muted'
                      }`}>
                        {formatTime(step.startTimeSec)}{step.targetTotalWater ? `・${step.targetTotalWater}g` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Timer (top) + Step card (bottom) */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* Timer section — upper half */}
            <div className="flex-none flex flex-col items-center justify-center py-5 border-b border-edge/30">
              <span className="text-xs text-ink-muted font-medium mb-2 tracking-wide">
                {MOCK_RECIPE_NAME}
              </span>
              <div className="text-[5.5rem] font-extrabold text-ink tracking-[-0.04em] tabular-nums leading-none font-nunito">
                {formatTime(MOCK_CURRENT_TIME)}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-36 h-[3px] rounded-full bg-edge overflow-hidden">
                  <div
                    className="h-full rounded-full bg-spot/50 transition-all duration-1000 ease-linear"
                    style={{ width: `${overallProgress * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink-muted tabular-nums font-medium">
                  {formatTime(MOCK_CURRENT_TIME)} / {formatTime(MOCK_TOTAL_DURATION)}
                </span>
              </div>
            </div>

            {/* Step card — lower half */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-2xl overflow-hidden bg-surface border border-edge shadow-card">
                <div className="h-[3px] w-full bg-gradient-to-r from-spot to-spot/15" />

                <div className="px-5 pt-4 pb-3">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-spot flex items-center justify-center shadow-sm">
                      <Drop size={14} weight="fill" className="text-white" />
                    </div>
                    <span className="text-[16px] font-bold text-ink leading-tight">
                      {currentStep.title}
                    </span>
                  </div>

                  {currentStep.targetTotalWater && (
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-[3rem] font-extrabold text-spot tabular-nums tracking-tight leading-none font-nunito">
                        {currentStep.targetTotalWater}
                      </span>
                      <span className="text-xl font-bold text-spot/50">g</span>
                      <span className="text-sm text-ink-muted ml-1 font-medium">まで注ぐ</span>
                    </div>
                  )}

                  <p className="text-[13px] text-ink-sub leading-relaxed">
                    {currentStep.description}
                  </p>

                  {currentStep.note && (
                    <p className="text-[11px] text-ink-muted mt-2 leading-relaxed italic">
                      {currentStep.note}
                    </p>
                  )}
                </div>

                {nextStep && (
                  <div className="border-t border-edge/50">
                    <div className="flex items-center gap-3 px-5 py-3">
                      <div className="w-[3px] self-stretch rounded-full bg-spot/25 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <CaretRight size={11} weight="bold" className="text-spot/40" />
                            <span className="text-[13px] font-semibold text-ink-sub truncate">
                              {nextStep.title}
                            </span>
                            {nextStep.targetTotalWater && (
                              <span className="text-[11px] font-medium text-ink-muted ml-0.5">
                                {nextStep.targetTotalWater}gまで
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline ml-2">
                            <span className="text-xl font-extrabold text-spot tabular-nums leading-none font-nunito">
                              {secondsUntilNext}
                            </span>
                            <span className="text-[10px] font-bold text-spot/50 ml-0.5">秒</span>
                          </div>
                        </div>
                        <div className="w-full h-1 rounded-full bg-edge overflow-hidden">
                          <div
                            className="h-full rounded-full bg-spot/50 transition-all duration-1000 ease-linear"
                            style={{ width: `${(1 - stepProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none bg-surface border-t border-edge py-3 px-8">
          <div className="flex items-center justify-center gap-10">
            <button className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2">
              <div className="p-2.5 rounded-full bg-ground">
                <ArrowCounterClockwise size={20} />
              </div>
              <span className="text-[11px] font-medium">リセット</span>
            </button>
            <button className="w-16 h-16 rounded-full bg-spot text-white flex items-center justify-center shadow-lg active:scale-95 transition-all shadow-spot/30">
              <Play size={28} weight="fill" className="ml-0.5" />
            </button>
            <button className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-sub transition-colors p-2">
              <div className="p-2.5 rounded-full bg-ground">
                <X size={20} />
              </div>
              <span className="text-[11px] font-medium">終了</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

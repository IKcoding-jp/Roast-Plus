'use client';

import { ArrowLeft, ArrowCounterClockwise, Pause, X } from 'phosphor-react';

// --- Mock Data ---
const MOCK_STEPS = [
  { id: '1', title: '蒸らし（味：40%）', description: '粉全体にまんべんなく注いで、均一に湿らせます', startTimeSec: 0, targetTotalWater: 30 },
  { id: '2', title: '2回目の注ぎ', description: '中心から外へ円を描くように注ぐ', startTimeSec: 45, targetTotalWater: 60 },
  { id: '3', title: '濃度調整（60%）', description: '中心に細く注ぐ', startTimeSec: 90, targetTotalWater: 150 },
];
const MOCK_CURRENT_TIME = 60;
const MOCK_CURRENT_STEP_INDEX = 1;
const MOCK_RECIPE_NAME = '4:6メソッド（粕谷 哲）';
const MOCK_TOTAL_DURATION = 135;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerPatternF() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];

  // ステップ内経過の計算
  const stepStartTime = currentStep.startTimeSec;
  const stepEndTime = nextStep ? nextStep.startTimeSec : MOCK_TOTAL_DURATION;
  const stepDuration = stepEndTime - stepStartTime;
  const stepElapsed = MOCK_CURRENT_TIME - stepStartTime;
  const stepProgress = Math.min(stepElapsed / stepDuration, 1);
  const remainingSeconds = stepEndTime - MOCK_CURRENT_TIME;

  // SVG 円形プログレスの計算
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - stepProgress);

  return (
    <div className="max-w-sm mx-auto">
      {/* Phone Frame */}
      <div className="h-[667px] rounded-3xl border-2 border-edge overflow-hidden bg-surface flex flex-col">
        {/* Header - シンプル */}
        <div className="flex-none px-4 py-3 flex items-center justify-between border-b border-edge">
          <button className="p-1 text-ink-muted">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-bold text-ink text-base truncate max-w-[180px]">
            {MOCK_RECIPE_NAME}
          </h1>
          <span className="text-sm font-bold text-spot tabular-nums">
            {MOCK_CURRENT_STEP_INDEX + 1}/{MOCK_STEPS.length}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-between px-5 py-4 overflow-hidden">
          {/* 円形プログレス + タイマー */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Background Ring */}
              <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full">
                <circle
                  cx="80" cy="80" r={radius}
                  fill="none"
                  className="stroke-ground"
                  strokeWidth="10"
                />
                {/* Progress Ring */}
                <circle
                  cx="80" cy="80" r={radius}
                  fill="none"
                  className="stroke-spot"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              {/* Timer Text */}
              <div className="relative text-center">
                <div
                  className="text-5xl font-bold text-ink tabular-nums tracking-tight leading-none"
                  style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                >
                  {formatTime(MOCK_CURRENT_TIME)}
                </div>
              </div>
            </div>
            {/* カウントダウン */}
            <p className="text-sm text-ink-muted mt-1">
              次のステップまで{' '}
              <span className="font-bold text-spot text-base">{remainingSeconds}秒</span>
            </p>
          </div>

          {/* カード領域 */}
          <div className="w-full space-y-2.5">
            {/* 現在ステップカード */}
            <div className="rounded-xl border-2 border-spot bg-spot-subtle/50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-white bg-spot px-1.5 py-0.5 rounded uppercase tracking-wider">
                  NOW
                </span>
                <span className="font-bold text-ink text-base">
                  {currentStep.title}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-spot tabular-nums">
                  {currentStep.targetTotalWater}g
                </span>
                <span className="text-sm text-ink-sub">まで注ぐ</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* 次のステップカード */}
            {nextStep && (
              <div className="rounded-xl border border-edge bg-ground/50 px-4 py-2.5 opacity-70">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-ink-muted bg-ground px-1.5 py-0.5 rounded uppercase tracking-wider">
                    NEXT
                  </span>
                  <span className="font-semibold text-ink-sub text-sm">
                    {nextStep.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span>{formatTime(nextStep.startTimeSec)}〜</span>
                  {nextStep.targetTotalWater && (
                    <span>{nextStep.targetTotalWater}gまで</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex-none border-t border-edge pt-3 pb-6 px-6">
          <div className="flex items-center justify-center gap-10">
            <button className="flex flex-col items-center gap-1 text-ink-muted">
              <div className="p-3 rounded-full bg-ground">
                <ArrowCounterClockwise size={22} />
              </div>
              <span className="text-[10px] font-medium">リセット</span>
            </button>

            <button className="w-16 h-16 rounded-full flex items-center justify-center bg-surface border-2 border-spot/20 text-spot shadow-xl">
              <Pause size={28} weight="fill" />
            </button>

            <button className="flex flex-col items-center gap-1 text-ink-muted">
              <div className="p-3 rounded-full bg-ground">
                <X size={22} />
              </div>
              <span className="text-[10px] font-medium">終了</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

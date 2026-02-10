'use client';

import { Pause, ArrowCounterClockwise, X, ArrowLeft } from 'phosphor-react';

const MOCK_STEPS = [
  { id: '1', title: '蒸らし', description: '中心からゆっくり40g注ぐ', startTimeSec: 0, targetTotalWater: 40, note: '30秒待ちます' },
  { id: '2', title: '2回目の注ぎ', description: '中心から外へ円を描くように注ぐ', startTimeSec: 30, targetTotalWater: 120 },
  { id: '3', title: '3回目の注ぎ', description: '中心から外へ円を描くように注ぐ', startTimeSec: 120, targetTotalWater: 180 },
  { id: '4', title: '4回目の注ぎ', description: '細く中心に注ぐ', startTimeSec: 180, targetTotalWater: 240 },
  { id: '5', title: '待ち', description: 'ドリッパーを外すまで待つ', startTimeSec: 210 },
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

export default function TimerPatternC() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];

  // 円形プログレスの計算
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;
  const dashOffset = circumference * (1 - progress);

  // 現在ステップ内の残り時間
  const nextStepStart = nextStep ? nextStep.startTimeSec : MOCK_TOTAL_DURATION;
  const timeUntilNext = nextStepStart - MOCK_CURRENT_TIME;

  return (
    <div className="max-w-sm mx-auto h-[667px] rounded-3xl border-2 border-edge overflow-hidden bg-ground flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-edge">
        <button className="flex items-center gap-1 text-muted">
          <ArrowLeft size={18} weight="bold" />
        </button>
        <h1 className="text-sm font-semibold text-ink">{MOCK_RECIPE_NAME}</h1>
        <span className="text-xs text-muted font-medium">
          {MOCK_CURRENT_STEP_INDEX + 1}/{MOCK_STEPS.length}
        </span>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-4 overflow-y-auto">
        {/* 円形プログレス + タイマー */}
        <div className="relative flex items-center justify-center mb-3">
          <svg viewBox="0 0 120 120" className="w-48 h-48">
            {/* 背景リング */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--color-ground)"
              strokeWidth="8"
            />
            {/* プログレスリング */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--color-spot)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          {/* 中央タイマー表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
              {formatTime(MOCK_CURRENT_TIME)}
            </span>
            <span className="text-xs text-muted mt-1">
              / {formatTime(MOCK_TOTAL_DURATION)}
            </span>
          </div>
        </div>

        {/* 次ステップまでのカウントダウン */}
        <p className="text-sm text-muted mb-5">
          次のステップまで <span className="font-semibold text-spot">{timeUntilNext}秒</span>
        </p>

        {/* 現在ステップカード */}
        <div className="w-full rounded-xl bg-surface border border-edge p-4 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface bg-spot px-2 py-0.5 rounded-full">
              Now
            </span>
            <span className="text-sm font-semibold text-ink">{currentStep.title}</span>
          </div>
          {currentStep.targetTotalWater && (
            <p className="text-sm text-muted mb-1">
              {currentStep.targetTotalWater}gまで注ぐ
            </p>
          )}
          <p className="text-xs text-muted">{currentStep.description}</p>
        </div>

        {/* 次ステップカード */}
        {nextStep && (
          <div className="w-full rounded-xl bg-ground border border-edge/50 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-ground border border-edge px-2 py-0.5 rounded-full">
                Next
              </span>
              <span className="text-sm font-medium text-muted">{nextStep.title}</span>
            </div>
            <p className="text-xs text-muted">
              {formatTime(nextStep.startTimeSec)}~
              {nextStep.targetTotalWater ? ` / ${nextStep.targetTotalWater}gまで` : ''}
            </p>
          </div>
        )}
      </div>

      {/* コントロールバー */}
      <div className="flex items-center justify-center gap-8 px-6 py-4 bg-surface border-t border-edge">
        <button className="w-11 h-11 rounded-full bg-ground flex items-center justify-center text-muted hover:text-ink transition-colors">
          <ArrowCounterClockwise size={20} weight="bold" />
        </button>
        <button className="w-14 h-14 rounded-full bg-spot flex items-center justify-center text-surface shadow-lg">
          <Pause size={26} weight="fill" />
        </button>
        <button className="w-11 h-11 rounded-full bg-ground flex items-center justify-center text-muted hover:text-ink transition-colors">
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}

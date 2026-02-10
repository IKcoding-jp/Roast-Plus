'use client';

import { ArrowLeft, Pause, ArrowCounterClockwise, X } from 'phosphor-react';

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerPatternD() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const totalSteps = MOCK_STEPS.length;
  const progress =
    ((MOCK_CURRENT_TIME - currentStep.startTimeSec) /
      (nextStep.startTimeSec - currentStep.startTimeSec)) *
    100;
  const nextStepCountdown = nextStep.startTimeSec - MOCK_CURRENT_TIME;

  return (
    <div className="max-w-sm mx-auto h-[667px] rounded-3xl border-2 border-edge overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 bg-spot-subtle border-b border-edge/30">
        <ArrowLeft size={20} className="text-ink-muted" />
        <span className="text-sm font-medium text-ink">
          {MOCK_RECIPE_NAME}
        </span>
      </div>

      {/* 上半分: 現在のステップ（アクセントカラー背景） */}
      <div className="flex-1 bg-spot-subtle flex flex-col items-center justify-center px-6">
        {/* タイマー */}
        <div
          className="text-7xl font-bold text-ink tracking-tight"
          style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
        >
          {formatTime(MOCK_CURRENT_TIME)}
        </div>

        {/* 現在ステップ情報 */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-spot" />
            <span className="text-base font-semibold text-ink">
              {currentStep.title}
            </span>
          </div>
          {currentStep.targetTotalWater && (
            <p className="text-sm text-ink-muted mt-1">
              {currentStep.targetTotalWater}gまで注ぐ
            </p>
          )}
          <p className="text-xs text-ink-muted mt-0.5">
            {currentStep.description}
          </p>
        </div>

        {/* 進捗バー */}
        <div className="w-full mt-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-ground rounded-full overflow-hidden">
            <div
              className="h-full bg-spot rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-ink-muted whitespace-nowrap">
            {MOCK_CURRENT_STEP_INDEX + 1}/{totalSteps}
          </span>
        </div>
      </div>

      {/* 下半分: 次のステップ + コントロール */}
      <div className="flex-1 bg-surface flex flex-col px-6 pt-5 pb-4">
        {/* 次のステップ情報 */}
        <div className="flex-1">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            次のステップ
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <span>{formatTime(nextStep.startTimeSec)}</span>
            <span>から</span>
          </div>
          <p className="text-base font-semibold text-ink mt-1">
            {nextStep.title}
          </p>
          {nextStep.targetTotalWater && (
            <p className="text-sm text-ink-muted mt-0.5">
              {nextStep.targetTotalWater}gまで注ぐ
            </p>
          )}

          {/* カウントダウン */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ground">
            <span className="text-sm font-bold text-spot">
              あと {nextStepCountdown}秒
            </span>
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-edge/30">
          <button className="flex items-center justify-center w-11 h-11 rounded-full bg-ground text-ink-muted">
            <ArrowCounterClockwise size={20} />
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-full bg-spot text-white shadow-md">
            <Pause size={24} weight="fill" />
          </button>
          <button className="flex items-center justify-center w-11 h-11 rounded-full bg-ground text-ink-muted">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

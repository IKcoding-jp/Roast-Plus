'use client';

import { ArrowLeft, ArrowCounterClockwise, Play, X, Drop, CaretRight } from 'phosphor-react';

// --- モックデータ ---
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

// H1: コーヒーグラデーションバー
// - アクセントバーをブラウン→オレンジのグラデーションに変更
// - Dropアイコン背景をブラウンに変更
export default function TimerPatternH1() {
  const currentStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX];
  const nextStep = MOCK_STEPS[MOCK_CURRENT_STEP_INDEX + 1];
  const overallProgress = MOCK_CURRENT_TIME / MOCK_TOTAL_DURATION;

  const stepStart = currentStep.startTimeSec;
  const stepEnd = nextStep ? nextStep.startTimeSec : MOCK_TOTAL_DURATION;
  const stepProgress = (MOCK_CURRENT_TIME - stepStart) / (stepEnd - stepStart);
  const secondsUntilNext = stepEnd - MOCK_CURRENT_TIME;

  return (
    <div className="max-w-sm mx-auto">
      <div className="h-[667px] rounded-3xl border border-edge overflow-hidden flex flex-col bg-ground">
        {/* ヘッダー */}
        <div className="flex-none flex items-center justify-between px-5 pt-4 pb-1">
          <button className="p-1.5 rounded-full text-ink-muted hover:text-ink-sub transition-colors">
            <ArrowLeft size={18} weight="bold" />
          </button>
          <span className="text-[10px] font-bold text-ink-muted tracking-[0.15em] uppercase">
            Step {MOCK_CURRENT_STEP_INDEX + 1} / {MOCK_STEPS.length}
          </span>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col items-center px-5 pb-3 overflow-y-auto">
          {/* タイマーセクション */}
          <div className="relative flex flex-col items-center pt-2 pb-5 w-full">
            {/* レシピ名 */}
            <span className="text-[11px] text-ink-muted font-medium mb-3 relative z-10 tracking-wide">
              {MOCK_RECIPE_NAME}
            </span>

            {/* タイマー数字 */}
            <div
              className="relative z-10 text-[4.5rem] font-extrabold text-ink tracking-[-0.04em] tabular-nums leading-none font-nunito"
            >
              {formatTime(MOCK_CURRENT_TIME)}
            </div>

            {/* 全体プログレス */}
            <div className="relative z-10 mt-4 flex items-center gap-2">
              <div className="w-20 h-[3px] rounded-full bg-edge overflow-hidden">
                <div
                  className="h-full rounded-full bg-spot/50 transition-all duration-1000"
                  style={{ width: `${overallProgress * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-ink-muted tabular-nums font-medium">
                {formatTime(MOCK_CURRENT_TIME)} / {formatTime(MOCK_TOTAL_DURATION)}
              </span>
            </div>
          </div>

          {/* 統合ステップカード */}
          <div className="w-full rounded-2xl overflow-hidden bg-surface border border-edge shadow-card">
            {/* アクセントバー: ブラウン→オレンジのグラデーション */}
            <div className="h-[3px] w-full bg-gradient-to-r from-dark via-dark-light to-spot" />

            {/* 現在ステップ — 上部セクション */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2.5 mb-3">
                {/* Dropアイコン: ブラウン背景 */}
                <div className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center shadow-sm">
                  <Drop size={14} weight="fill" className="text-white" />
                </div>
                <span className="text-[15px] font-bold text-ink leading-tight">
                  {currentStep.title}
                </span>
              </div>

              {currentStep.targetTotalWater && (
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[2.25rem] font-extrabold text-spot tabular-nums tracking-tight leading-none font-nunito">
                    {currentStep.targetTotalWater}
                  </span>
                  <span className="text-lg font-bold text-spot/50">g</span>
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

            {/* 次ステップカウントダウン — 統合下部セクション */}
            {nextStep && (
              <div className="border-t border-edge-subtle">
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* 左アクセントライン */}
                  <div className="w-[3px] self-stretch rounded-full bg-spot/25 flex-shrink-0" />

                  {/* コンテンツ */}
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
                      <div className="flex items-baseline flex-shrink-0 ml-2">
                        <span className="text-xl font-extrabold text-spot tabular-nums leading-none font-nunito">
                          {secondsUntilNext}
                        </span>
                        <span className="text-[10px] font-bold text-spot/50 ml-0.5">秒</span>
                      </div>
                    </div>

                    {/* カウントダウンバー */}
                    <div className="w-full h-1 rounded-full bg-edge overflow-hidden">
                      <div
                        className="h-full rounded-full bg-spot/50 transition-all duration-1000"
                        style={{ width: `${(1 - stepProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 残りステップ */}
          {MOCK_CURRENT_STEP_INDEX + 2 < MOCK_STEPS.length && (
            <p className="text-[10px] text-ink-muted text-center mt-3 tracking-wide font-medium">
              残り {MOCK_STEPS.length - MOCK_CURRENT_STEP_INDEX - 2} ステップ
            </p>
          )}
        </div>

        {/* コントロール */}
        <div className="flex-none flex items-center justify-center gap-10 px-5 py-4 border-t border-edge bg-surface/50">
          <button className="p-3 rounded-full text-ink-muted transition-colors hover:text-ink-sub hover:bg-ground active:scale-95">
            <ArrowCounterClockwise size={22} weight="bold" />
          </button>
          <button className="w-[60px] h-[60px] rounded-full bg-spot text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Play size={24} weight="fill" className="ml-0.5" />
          </button>
          <button className="p-3 rounded-full text-ink-muted transition-colors hover:text-ink-sub hover:bg-ground active:scale-95">
            <X size={22} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

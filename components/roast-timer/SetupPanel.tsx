'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToastContext } from '@/components/Toast';
import { DEFAULT_DURATIONS as DEFAULT_DURATION_BY_WEIGHT, type Weight } from '@/lib/constants';
import { Button } from '@/components/ui';
import type { BeanName } from '@/lib/beanConfig';
import type { RoastLevel } from '@/lib/constants';

interface SetupPanelProps {
  onStart: (
    duration: number,
    beanName?: BeanName,
    weight?: Weight,
    roastLevel?: RoastLevel
  ) => Promise<void>;
  isLoading: boolean;
  /** 選択中の重さが変わったときに親へ通知 */
  onWeightSelect?: (weight: Weight) => void;
}

const WEIGHT_OPTIONS: Array<{ weight: Weight; minutes: number }> = [
  { weight: 200, minutes: DEFAULT_DURATION_BY_WEIGHT[200] },
  { weight: 300, minutes: DEFAULT_DURATION_BY_WEIGHT[300] },
  { weight: 500, minutes: DEFAULT_DURATION_BY_WEIGHT[500] },
];

/**
 * 重量カード3択 + スタートボタン
 * idle状態の下部パネルに表示
 */
export function SetupPanel({ onStart, isLoading, onWeightSelect }: SetupPanelProps) {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [selectedWeight, setSelectedWeight] = useState<Weight>(200);

  const handleWeightSelect = (weight: Weight) => {
    setSelectedWeight(weight);
    onWeightSelect?.(weight);
  };

  const handleStart = async () => {
    if (!user) {
      showToast('ログインが必要です', 'warning');
      return;
    }
    if (isLoading) {
      showToast('データを読み込み中です。しばらくお待ちください。', 'info');
      return;
    }

    const option = WEIGHT_OPTIONS.find((o) => o.weight === selectedWeight);
    if (!option) return;

    const duration = option.minutes * 60;
    await onStart(duration, undefined, selectedWeight, undefined);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-end md:justify-center md:py-8">
      {/* 重量カードグリッド */}
      <div className="grid grid-cols-3 gap-[10px] mb-4">
        {WEIGHT_OPTIONS.map((option) => {
          const isSelected = selectedWeight === option.weight;
          return (
            <button
              key={option.weight}
              type="button"
              onClick={() => handleWeightSelect(option.weight)}
              className="flex flex-col items-center gap-2 rounded-[20px] cursor-pointer min-h-[96px] justify-center"
              style={{
                padding: '16px 8px 14px',
                border: `2px solid ${isSelected ? 'var(--spot)' : 'var(--edge)'}`,
                background: isSelected ? 'var(--spot-surface)' : 'var(--surface)',
                boxShadow: isSelected
                  ? '0 0 0 3px var(--spot-subtle), 0 4px 16px var(--spot-subtle)'
                  : 'none',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label={`${option.weight}g ${option.minutes}分`}
            >
              <div className="flex items-baseline gap-px leading-none">
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 26,
                    fontWeight: 400,
                    letterSpacing: '-0.5px',
                    color: isSelected ? 'var(--spot)' : 'var(--ink-sub)',
                    transition: 'color 0.15s',
                  }}
                >
                  {option.weight}
                </span>
                <span
                  className="font-bold"
                  style={{
                    fontSize: 11,
                    color: isSelected ? 'var(--spot-hover)' : 'var(--ink-muted)',
                    paddingBottom: 1,
                    transition: 'color 0.15s',
                  }}
                >
                  g
                </span>
              </div>
              <div
                style={{
                  width: 20,
                  height: 1,
                  background: isSelected ? 'var(--spot-subtle)' : 'var(--edge)',
                  transition: 'background 0.15s',
                }}
              />
              <span
                className="tabular-nums"
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? 400 : 300,
                  color: isSelected ? 'var(--spot)' : 'var(--ink-muted)',
                  transition: 'color 0.15s',
                }}
              >
                {option.minutes}:00
              </span>
            </button>
          );
        })}
      </div>

      {/* スタートボタン */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleStart}
        disabled={!user || isLoading}
        className="w-full flex items-center justify-center gap-[10px]"
        style={{
          height: 56,
          borderRadius: 14,
          boxShadow: '0 6px 24px var(--spot-subtle), 0 2px 6px var(--spot-subtle)',
        }}
      >
        <svg width={17} height={17} viewBox="0 0 24 24" fill="var(--on-spot)" className="flex-shrink-0 relative">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span className="text-[15px] font-bold tracking-[0.04em] relative">
          スタート
        </span>
      </Button>
    </div>
  );
}

export { type SetupPanelProps };

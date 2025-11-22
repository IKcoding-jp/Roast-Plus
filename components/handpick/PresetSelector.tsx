/**
 * プリセット選択コンポーネント
 */

'use client';

import { TIMER_PRESETS, type TimerPreset } from '@/lib/handpickTimerUtils';

interface PresetSelectorProps {
    selectedPreset: TimerPreset;
    onSelect: (preset: TimerPreset) => void;
    disabled?: boolean;
}

export function PresetSelector({ selectedPreset, onSelect, disabled = false }: PresetSelectorProps) {
    return (
        <div className="bg-white/80 rounded-lg border border-gray-100 px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm">
            <div className="mb-1.5 sm:mb-2">
                <span className="text-xs sm:text-sm font-bold text-gray-600">時間設定</span>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
                {TIMER_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset)}
                        disabled={disabled}
                        className={`flex-1 py-1.5 sm:py-2 px-1 rounded-md font-bold text-xs sm:text-sm transition-all ${selectedPreset.id === preset.id
                                ? 'bg-[#EF8A00] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

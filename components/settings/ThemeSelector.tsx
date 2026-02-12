'use client';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemePreset } from '@/lib/theme';
import { HiCheck } from 'react-icons/hi';

function ThemePreviewCard({
  preset,
  isSelected,
  onSelect,
}: {
  preset: ThemePreset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { bg, surface, accent, text } = preset.previewColors;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`
        relative w-full text-left rounded-xl overflow-hidden
        transition-all duration-200 ease-out
        border-2
        ${isSelected
          ? 'border-spot shadow-card-hover ring-1 ring-spot/30'
          : 'border-edge hover:border-edge-strong hover:shadow-card'
        }
      `}
    >
      {/* カラープレビューエリア - 斜めバンド */}
      <div
        className="relative h-20 overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {/* 背景バンド（全面） */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: bg }}
        />
        {/* サーフェスバンド（斜め） */}
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            backgroundColor: surface,
            width: '75%',
            clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        />
        {/* アクセントバンド */}
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            backgroundColor: accent,
            width: '45%',
            clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        />
        {/* テキストカラー円 */}
        <div
          className="absolute bottom-2 left-3 w-5 h-5 rounded-full border-2"
          style={{
            backgroundColor: text,
            borderColor: `${text}40`,
          }}
        />
      </div>

      {/* テーマ情報 */}
      <div className="px-3 py-2.5 bg-surface">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink leading-tight">
            {preset.name}
          </span>
          {isSelected && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-spot text-white">
              <HiCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted mt-0.5 leading-snug">
          {preset.description}
        </p>
      </div>
    </button>
  );
}

export function ThemeSelector() {
  const { currentTheme, setTheme, presets } = useAppTheme();

  return (
    <div className="grid grid-cols-2 gap-3">
      {presets.map((preset) => (
        <ThemePreviewCard
          key={preset.id}
          preset={preset}
          isSelected={currentTheme === preset.id}
          onSelect={() => setTheme(preset.id)}
        />
      ))}
    </div>
  );
}

'use client';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemePreset } from '@/lib/theme';
import { HiCheck } from 'react-icons/hi';
import { Button } from '@/components/ui';

// ── ThemePreviewCard ─────────────────────────────────────────────────

function ThemePreviewCard({
  preset,
  isSelected,
  onSelect,
}: {
  preset: ThemePreset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`
        relative w-full !rounded-2xl !min-h-0 !font-normal
        !text-left bg-surface
        flex flex-col items-center
        !pt-5 !px-3.5 !pb-4
        transition-all duration-200 ease-out
        ${
          isSelected
            ? '!border-[2px] border-spot'
            : '!border-[1.5px] border-edge-subtle hover:border-edge'
        }
      `}
      style={
        isSelected
          ? { boxShadow: '0 0 0 3px rgba(217,119,6,0.12)' }
          : undefined
      }
    >
      {/* 選択チェック（右上） */}
      {isSelected && (
        <span
          data-testid="selected-check"
          className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-spot"
        >
          <HiCheck className="w-3 h-3 text-white" />
        </span>
      )}

      {/* カラードット */}
      <span
        data-testid="theme-dot"
        className="block w-12 h-12 rounded-full mb-3 shrink-0"
        style={{
          background: preset.previewGradient,
          boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.5)',
        }}
        aria-hidden
      />

      {/* テーマ名 */}
      <span className="text-[15px] font-bold text-ink text-center leading-snug block">
        {preset.name}
      </span>

      {/* 説明文 */}
      <p className="text-[12.5px] text-ink-sub text-center mt-1 leading-snug">
        {preset.description}
      </p>
    </Button>
  );
}

// ── ThemeSelector ────────────────────────────────────────────────────

export function ThemeSelector() {
  const { currentTheme, setTheme, presets } = useAppTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
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

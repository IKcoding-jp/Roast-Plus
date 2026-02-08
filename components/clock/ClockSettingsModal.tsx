'use client';

import { HiXMark } from 'react-icons/hi2';
import { Modal, IconButton, Switch, Button } from '@/components/ui';
import {
  type ClockSettings,
  type ClockTheme,
  type ClockFontKey,
  CLOCK_THEMES,
  CLOCK_FONTS,
  getThemeColors,
  getFontFamily,
} from '@/lib/clockSettings';

interface ClockSettingsModalProps {
  show: boolean;
  settings: ClockSettings;
  onUpdate: (patch: Partial<ClockSettings>) => void;
  onReset: () => void;
  onClose: () => void;
}

const THEME_KEYS: ClockTheme[] = ['light', 'dark', 'coffee', 'green', 'lightblue'];
const FONT_KEYS: ClockFontKey[] = ['inter', 'robotoMono', 'oswald', 'orbitron', 'notoSansJP'];

export function ClockSettingsModal({ show, settings, onUpdate, onReset, onClose }: ClockSettingsModalProps) {
  const themeColors = getThemeColors(settings.theme);

  const contentClassName = 'w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border border-edge';

  return (
    <Modal
      show={show}
      onClose={onClose}
      contentClassName={contentClassName}
    >
      <div style={{ backgroundColor: themeColors.bg }}>
        {/* ヘッダー */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: themeColors.uiBg, backgroundColor: themeColors.bg }}
        >
          <h2 className="text-lg font-bold" style={{ color: themeColors.text }}>
            時計の設定
          </h2>
          <IconButton
            variant="ghost"
            rounded
            onClick={onClose}
            aria-label="閉じる"
          >
            <HiXMark className="w-6 h-6" style={{ color: themeColors.uiText }} />
          </IconButton>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* ─── テーマ選択 ─── */}
          <section>
            <SectionLabel color={themeColors.uiText}>テーマ</SectionLabel>
            <div className="flex gap-3 mt-2">
              {THEME_KEYS.map((key) => {
                const theme = CLOCK_THEMES[key];
                const colors = theme.colors;
                const isSelected = settings.theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdate({ theme: key })}
                    className="flex flex-col items-center gap-1.5 min-w-[52px]"
                    aria-label={`テーマ: ${theme.label}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: isSelected ? colors.accent : 'transparent',
                        boxShadow: isSelected ? `0 0 0 2px ${colors.accent}40` : 'none',
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ color: colors.text }}
                      >
                        Aa
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isSelected ? themeColors.text : themeColors.uiText }}
                    >
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ─── フォント選択 ─── */}
          <section>
            <SectionLabel color={themeColors.uiText}>フォント</SectionLabel>
            <div className="mt-2 grid gap-2">
              {FONT_KEYS.map((key) => {
                const font = CLOCK_FONTS[key];
                const isSelected = settings.fontKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdate({ fontKey: key })}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left"
                    style={{
                      backgroundColor: isSelected ? `${themeColors.accent}18` : themeColors.uiBg,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? themeColors.accent : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl font-bold leading-none"
                        style={{
                          fontFamily: getFontFamily(key),
                          color: themeColors.text,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        12:34
                      </span>
                      <div>
                        <span className="text-sm font-medium block" style={{ color: themeColors.text }}>
                          {font.label}
                        </span>
                        <span className="text-xs" style={{ color: themeColors.uiText }}>
                          {font.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: themeColors.accent }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ─── 文字サイズ ─── */}
          <section>
            <div className="flex items-center justify-between">
              <SectionLabel color={themeColors.uiText}>文字サイズ</SectionLabel>
              <span className="text-sm font-mono" style={{ color: themeColors.uiText }}>
                {Math.round(settings.fontScale * 100)}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs" style={{ color: themeColors.uiText }}>小</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={settings.fontScale}
                onChange={(e) => onUpdate({ fontScale: parseFloat(e.target.value) })}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${themeColors.accent} 0%, ${themeColors.accent} ${((settings.fontScale - 0.5) / 1.0) * 100}%, ${themeColors.uiBg} ${((settings.fontScale - 0.5) / 1.0) * 100}%, ${themeColors.uiBg} 100%)`,
                  accentColor: themeColors.accent,
                }}
                aria-label="文字サイズ"
              />
              <span className="text-xs" style={{ color: themeColors.uiText }}>大</span>
            </div>
          </section>

          {/* ─── 表示オプション ─── */}
          <section>
            <SectionLabel color={themeColors.uiText}>表示オプション</SectionLabel>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between py-3 px-1 min-h-[44px]">
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                  24時間表示
                </span>
                <Switch
                  checked={settings.use24Hour}
                  onChange={(e) => onUpdate({ use24Hour: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between py-3 px-1 min-h-[44px]">
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                  秒を表示
                </span>
                <Switch
                  checked={settings.showSeconds}
                  onChange={(e) => onUpdate({ showSeconds: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between py-3 px-1 min-h-[44px]">
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                  日付を表示
                </span>
                <Switch
                  checked={settings.showDate}
                  onChange={(e) => onUpdate({ showDate: e.target.checked })}
                />
              </div>
            </div>
          </section>

          {/* ─── リセットボタン ─── */}
          <div className="pt-2 pb-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={onReset}
              size="md"
            >
              設定をリセット
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── サブコンポーネント ───

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
      {children}
    </h3>
  );
}

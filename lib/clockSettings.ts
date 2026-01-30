// 時計ページのカスタマイズ設定

// ─── テーマ定義 ───

export type ClockTheme = 'light' | 'dark' | 'coffee' | 'green' | 'lightblue';

export interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
  accentSub: string;
  dateText: string;
  uiText: string;
  uiBg: string;
}

export const CLOCK_THEMES: Record<ClockTheme, { label: string; colors: ThemeColors }> = {
  light: {
    label: 'ライト',
    colors: {
      bg: '#FFFFFF',
      text: '#211714',
      accent: '#D97706',
      accentSub: 'rgba(217, 119, 6, 0.7)',
      dateText: 'rgba(33, 23, 20, 0.6)',
      uiText: '#6B7280',
      uiBg: 'rgba(0, 0, 0, 0.05)',
    },
  },
  dark: {
    label: 'ダーク',
    colors: {
      bg: '#1A1A1A',
      text: '#F5F5F5',
      accent: '#FBBF24',
      accentSub: 'rgba(251, 191, 36, 0.7)',
      dateText: 'rgba(245, 245, 245, 0.6)',
      uiText: '#9CA3AF',
      uiBg: 'rgba(255, 255, 255, 0.1)',
    },
  },
  coffee: {
    label: 'コーヒー',
    colors: {
      bg: '#2C1810',
      text: '#F5E6D3',
      accent: '#D4915C',
      accentSub: 'rgba(212, 145, 92, 0.7)',
      dateText: 'rgba(245, 230, 211, 0.6)',
      uiText: '#A0826D',
      uiBg: 'rgba(255, 255, 255, 0.08)',
    },
  },
  green: {
    label: 'グリーン',
    colors: {
      bg: '#1A2E1A',
      text: '#E8F5E8',
      accent: '#6ABF6A',
      accentSub: 'rgba(106, 191, 106, 0.7)',
      dateText: 'rgba(232, 245, 232, 0.6)',
      uiText: '#7DAF7D',
      uiBg: 'rgba(255, 255, 255, 0.08)',
    },
  },
  lightblue: {
    label: 'ライトブルー',
    colors: {
      bg: '#FFFFFF',
      text: '#4DA8DA',
      accent: '#2980B9',
      accentSub: 'rgba(41, 128, 185, 0.7)',
      dateText: 'rgba(77, 168, 218, 0.6)',
      uiText: '#6B7280',
      uiBg: 'rgba(0, 0, 0, 0.05)',
    },
  },
};

// ─── フォント定義 ───

export type ClockFontKey = 'inter' | 'robotoMono' | 'oswald' | 'orbitron' | 'notoSansJP';

export interface ClockFontOption {
  label: string;
  cssVar: string;
  fallback: string;
  description: string;
  widthFactor: number; // 幅補正係数（1.0=標準、小さいほど縮小）
}

export const CLOCK_FONTS: Record<ClockFontKey, ClockFontOption> = {
  inter: {
    label: 'Inter',
    cssVar: 'var(--font-inter)',
    fallback: 'sans-serif',
    description: 'モダン・クリーン',
    widthFactor: 1.0,
  },
  robotoMono: {
    label: 'Roboto Mono',
    cssVar: 'var(--font-roboto-mono)',
    fallback: 'monospace',
    description: '等幅・デジタル',
    widthFactor: 0.9,
  },
  oswald: {
    label: 'Oswald',
    cssVar: 'var(--font-oswald)',
    fallback: 'sans-serif',
    description: '縦長・力強い',
    widthFactor: 1.0,
  },
  orbitron: {
    label: 'Orbitron',
    cssVar: 'var(--font-orbitron)',
    fallback: 'sans-serif',
    description: 'SF・未来的',
    widthFactor: 0.72,
  },
  notoSansJP: {
    label: 'Noto Sans JP',
    cssVar: 'var(--font-noto-sans-jp)',
    fallback: 'sans-serif',
    description: '日本語対応',
    widthFactor: 1.0,
  },
};

// ─── 設定型 ───

export interface ClockSettings {
  theme: ClockTheme;
  fontKey: ClockFontKey;
  fontScale: number;
  use24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
}

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  theme: 'light',
  fontKey: 'inter',
  fontScale: 1.0,
  use24Hour: true,
  showSeconds: true,
  showDate: true,
};

// ─── localStorage ───

const CLOCK_SETTINGS_KEY = 'roastplus_clock_settings';

const parseJson = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export function getClockSettings(): ClockSettings {
  if (typeof window === 'undefined') return DEFAULT_CLOCK_SETTINGS;

  const stored = localStorage.getItem(CLOCK_SETTINGS_KEY);
  if (!stored) return DEFAULT_CLOCK_SETTINGS;

  const parsed = parseJson<Partial<ClockSettings>>(stored);
  if (!parsed) return DEFAULT_CLOCK_SETTINGS;

  return { ...DEFAULT_CLOCK_SETTINGS, ...parsed };
}

export function setClockSettings(settings: ClockSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLOCK_SETTINGS_KEY, JSON.stringify(settings));
}

// ─── ヘルパー ───

export function getThemeColors(theme: ClockTheme): ThemeColors {
  return CLOCK_THEMES[theme].colors;
}

export function getFontFamily(fontKey: ClockFontKey): string {
  const font = CLOCK_FONTS[fontKey];
  return `${font.cssVar}, ${font.fallback}`;
}

export function getFontWidthFactor(fontKey: ClockFontKey): number {
  return CLOCK_FONTS[fontKey].widthFactor;
}

export function getScaledClamp(baseMin: number, baseVw: number, scale: number, widthFactor: number = 1.0): string {
  const effectiveScale = scale * widthFactor;
  const min = (baseMin * effectiveScale).toFixed(1);
  const vw = (baseVw * effectiveScale).toFixed(1);
  return `clamp(${min}rem, ${vw}vw, ${vw}vw)`;
}

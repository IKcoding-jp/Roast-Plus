import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getClockSettings,
  setClockSettings,
  getThemeColors,
  getFontFamily,
  getFontWidthFactor,
  getScaledClamp,
  DEFAULT_CLOCK_SETTINGS,
  CLOCK_THEMES,
  CLOCK_FONTS,
  type ClockSettings,
  type ClockTheme,
  type ClockFontKey,
} from './clockSettings';

// localStorageのモック
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

describe('clockSettings', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  describe('定数の定義', () => {
    it('CLOCK_THEMES に5つのテーマが定義されている', () => {
      const themes = Object.keys(CLOCK_THEMES);
      expect(themes).toHaveLength(5);
      expect(themes).toEqual(['light', 'dark', 'coffee', 'green', 'lightblue']);
    });

    it('各テーマに必要なcolorプロパティが存在する', () => {
      const requiredProps = ['bg', 'text', 'accent', 'accentSub', 'dateText', 'uiText', 'uiBg'];

      Object.values(CLOCK_THEMES).forEach((theme) => {
        requiredProps.forEach((prop) => {
          expect(theme.colors).toHaveProperty(prop);
        });
      });
    });

    it('CLOCK_FONTS に5つのフォントが定義されている', () => {
      const fonts = Object.keys(CLOCK_FONTS);
      expect(fonts).toHaveLength(5);
      expect(fonts).toEqual(['inter', 'robotoMono', 'oswald', 'orbitron', 'notoSansJP']);
    });

    it('各フォントに必要なプロパティが存在する', () => {
      const requiredProps = ['label', 'cssVar', 'fallback', 'description', 'widthFactor'];

      Object.values(CLOCK_FONTS).forEach((font) => {
        requiredProps.forEach((prop) => {
          expect(font).toHaveProperty(prop);
        });
      });
    });

    it('DEFAULT_CLOCK_SETTINGS が正しく定義されている', () => {
      expect(DEFAULT_CLOCK_SETTINGS).toEqual({
        theme: 'light',
        fontKey: 'inter',
        fontScale: 1.0,
        use24Hour: true,
        showSeconds: true,
        showDate: true,
      });
    });
  });

  describe('getClockSettings', () => {
    it('設定がない場合はデフォルト設定を返す', () => {
      const settings = getClockSettings();
      expect(settings).toEqual(DEFAULT_CLOCK_SETTINGS);
    });

    it('保存された設定を正しく読み込む', () => {
      const customSettings: ClockSettings = {
        theme: 'dark',
        fontKey: 'robotoMono',
        fontScale: 1.5,
        use24Hour: false,
        showSeconds: false,
        showDate: false,
      };

      localStorageMock.setItem('roastplus_clock_settings', JSON.stringify(customSettings));

      const settings = getClockSettings();
      expect(settings).toEqual(customSettings);
    });

    it('部分的な設定の場合、デフォルト値とマージする', () => {
      const partialSettings = {
        theme: 'coffee' as ClockTheme,
        fontScale: 1.2,
      };

      localStorageMock.setItem('roastplus_clock_settings', JSON.stringify(partialSettings));

      const settings = getClockSettings();
      expect(settings).toEqual({
        ...DEFAULT_CLOCK_SETTINGS,
        theme: 'coffee',
        fontScale: 1.2,
      });
    });

    it('無効なJSON形式の場合はデフォルト設定を返す', () => {
      localStorageMock.setItem('roastplus_clock_settings', 'invalid json');

      const settings = getClockSettings();
      expect(settings).toEqual(DEFAULT_CLOCK_SETTINGS);
    });

    it('空文字列の場合はデフォルト設定を返す', () => {
      localStorageMock.setItem('roastplus_clock_settings', '');

      const settings = getClockSettings();
      expect(settings).toEqual(DEFAULT_CLOCK_SETTINGS);
    });
  });

  describe('setClockSettings', () => {
    it('設定を正しく保存する', () => {
      const customSettings: ClockSettings = {
        theme: 'dark',
        fontKey: 'orbitron',
        fontScale: 2.0,
        use24Hour: false,
        showSeconds: false,
        showDate: true,
      };

      setClockSettings(customSettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'roastplus_clock_settings',
        JSON.stringify(customSettings)
      );
    });

    it('設定を保存後、getClockSettingsで取得できる', () => {
      const customSettings: ClockSettings = {
        theme: 'green',
        fontKey: 'notoSansJP',
        fontScale: 0.8,
        use24Hour: true,
        showSeconds: true,
        showDate: false,
      };

      setClockSettings(customSettings);

      const retrieved = getClockSettings();
      expect(retrieved).toEqual(customSettings);
    });
  });

  describe('getThemeColors', () => {
    it('lightテーマの色を正しく取得する', () => {
      const colors = getThemeColors('light');
      expect(colors).toEqual(CLOCK_THEMES.light.colors);
      expect(colors.bg).toBe('#FFFFFF');
      expect(colors.text).toBe('#211714');
    });

    it('darkテーマの色を正しく取得する', () => {
      const colors = getThemeColors('dark');
      expect(colors).toEqual(CLOCK_THEMES.dark.colors);
      expect(colors.bg).toBe('#1A1A1A');
      expect(colors.text).toBe('#F5F5F5');
    });

    it('coffeeテーマの色を正しく取得する', () => {
      const colors = getThemeColors('coffee');
      expect(colors).toEqual(CLOCK_THEMES.coffee.colors);
      expect(colors.bg).toBe('#2C1810');
    });

    it('全てのテーマの色を取得できる', () => {
      const themes: ClockTheme[] = ['light', 'dark', 'coffee', 'green', 'lightblue'];

      themes.forEach((theme) => {
        const colors = getThemeColors(theme);
        expect(colors).toBeDefined();
        expect(colors).toHaveProperty('bg');
        expect(colors).toHaveProperty('text');
        expect(colors).toHaveProperty('accent');
      });
    });
  });

  describe('getFontFamily', () => {
    it('interフォントのフォントファミリーを取得する', () => {
      const fontFamily = getFontFamily('inter');
      expect(fontFamily).toBe('var(--font-inter), sans-serif');
    });

    it('robotoMonoフォントのフォントファミリーを取得する', () => {
      const fontFamily = getFontFamily('robotoMono');
      expect(fontFamily).toBe('var(--font-roboto-mono), monospace');
    });

    it('orbitronフォントのフォントファミリーを取得する', () => {
      const fontFamily = getFontFamily('orbitron');
      expect(fontFamily).toBe('var(--font-orbitron), sans-serif');
    });

    it('全てのフォントのフォントファミリーを取得できる', () => {
      const fonts: ClockFontKey[] = ['inter', 'robotoMono', 'oswald', 'orbitron', 'notoSansJP'];

      fonts.forEach((fontKey) => {
        const fontFamily = getFontFamily(fontKey);
        expect(fontFamily).toBeDefined();
        expect(fontFamily).toContain('var(--font-');
        expect(fontFamily).toContain(',');
      });
    });
  });

  describe('getFontWidthFactor', () => {
    it('interフォントの幅係数を取得する', () => {
      expect(getFontWidthFactor('inter')).toBe(1.0);
    });

    it('robotoMonoフォントの幅係数を取得する', () => {
      expect(getFontWidthFactor('robotoMono')).toBe(0.9);
    });

    it('orbitronフォントの幅係数を取得する', () => {
      expect(getFontWidthFactor('orbitron')).toBe(0.72);
    });

    it('全てのフォントの幅係数が0より大きい', () => {
      const fonts: ClockFontKey[] = ['inter', 'robotoMono', 'oswald', 'orbitron', 'notoSansJP'];

      fonts.forEach((fontKey) => {
        const widthFactor = getFontWidthFactor(fontKey);
        expect(widthFactor).toBeGreaterThan(0);
        expect(widthFactor).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe('getScaledClamp', () => {
    it('基本的なclamp値を計算する（scale=1.0, widthFactor=1.0）', () => {
      const result = getScaledClamp(2, 5, 1.0, 1.0);
      expect(result).toBe('clamp(2.0rem, 5.0vw, 5.0vw)');
    });

    it('スケールを適用したclamp値を計算する（scale=1.5）', () => {
      const result = getScaledClamp(2, 5, 1.5, 1.0);
      expect(result).toBe('clamp(3.0rem, 7.5vw, 7.5vw)');
    });

    it('幅係数を適用したclamp値を計算する（widthFactor=0.9）', () => {
      const result = getScaledClamp(2, 5, 1.0, 0.9);
      expect(result).toBe('clamp(1.8rem, 4.5vw, 4.5vw)');
    });

    it('スケールと幅係数の両方を適用する', () => {
      const result = getScaledClamp(2, 5, 1.5, 0.9);
      // 2 * 1.5 * 0.9 = 2.7, 5 * 1.5 * 0.9 = 6.75
      expect(result).toBe('clamp(2.7rem, 6.8vw, 6.8vw)');
    });

    it('小数点以下1桁で丸められる', () => {
      const result = getScaledClamp(2.345, 5.678, 1.234, 0.987);
      // 小数点以下1桁に丸められていることを確認
      expect(result).toMatch(/clamp\(\d+\.\d{1}rem, \d+\.\d{1}vw, \d+\.\d{1}vw\)/);
    });

    it('widthFactorのデフォルト値は1.0', () => {
      const result1 = getScaledClamp(2, 5, 1.0);
      const result2 = getScaledClamp(2, 5, 1.0, 1.0);
      expect(result1).toBe(result2);
    });
  });

  describe('実際のユースケース', () => {
    it('ユーザーがダークテーマに切り替える', () => {
      const newSettings: ClockSettings = {
        ...DEFAULT_CLOCK_SETTINGS,
        theme: 'dark',
      };

      setClockSettings(newSettings);
      const retrieved = getClockSettings();

      expect(retrieved.theme).toBe('dark');
      const colors = getThemeColors(retrieved.theme);
      expect(colors.bg).toBe('#1A1A1A');
    });

    it('ユーザーがフォントサイズを1.5倍に拡大する', () => {
      const newSettings: ClockSettings = {
        ...DEFAULT_CLOCK_SETTINGS,
        fontScale: 1.5,
      };

      setClockSettings(newSettings);
      const retrieved = getClockSettings();

      expect(retrieved.fontScale).toBe(1.5);
      const clamp = getScaledClamp(2, 5, retrieved.fontScale);
      expect(clamp).toBe('clamp(3.0rem, 7.5vw, 7.5vw)');
    });

    it('ユーザーが12時間表示に切り替える', () => {
      const newSettings: ClockSettings = {
        ...DEFAULT_CLOCK_SETTINGS,
        use24Hour: false,
      };

      setClockSettings(newSettings);
      const retrieved = getClockSettings();

      expect(retrieved.use24Hour).toBe(false);
    });

    it('複数の設定を同時に変更する', () => {
      const newSettings: ClockSettings = {
        theme: 'coffee',
        fontKey: 'orbitron',
        fontScale: 1.2,
        use24Hour: false,
        showSeconds: false,
        showDate: true,
      };

      setClockSettings(newSettings);
      const retrieved = getClockSettings();

      expect(retrieved).toEqual(newSettings);
      expect(getThemeColors(retrieved.theme).bg).toBe('#2C1810');
      expect(getFontWidthFactor(retrieved.fontKey)).toBe(0.72);
    });
  });
});

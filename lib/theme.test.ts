import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, THEME_IDS, isDarkTheme } from './theme';

describe('THEME_PRESETS', () => {
  it('7つのテーマプリセットが定義されている', () => {
    expect(THEME_PRESETS).toHaveLength(7);
  });

  it('各テーマに必須フィールドが存在する', () => {
    for (const theme of THEME_PRESETS) {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('description');
      expect(theme).toHaveProperty('type');
      expect(theme).toHaveProperty('previewColors');
      expect(theme.previewColors).toHaveProperty('bg');
      expect(theme.previewColors).toHaveProperty('surface');
      expect(theme.previewColors).toHaveProperty('accent');
      expect(theme.previewColors).toHaveProperty('text');
    }
  });

  it('テーマIDがユニークである', () => {
    const ids = THEME_PRESETS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('テーマタイプがlightまたはdarkである', () => {
    for (const theme of THEME_PRESETS) {
      expect(['light', 'dark']).toContain(theme.type);
    }
  });

  it('期待するテーマIDが含まれている', () => {
    const ids = THEME_PRESETS.map((t) => t.id);
    expect(ids).toContain('default');
    expect(ids).toContain('dark-roast');
    expect(ids).toContain('light-roast');
    expect(ids).toContain('matcha');
    expect(ids).toContain('caramel');
    expect(ids).toContain('christmas');
    expect(ids).toContain('dark');
  });
});

describe('THEME_IDS', () => {
  it('THEME_PRESETSと同数のIDが含まれる', () => {
    expect(THEME_IDS).toHaveLength(THEME_PRESETS.length);
  });

  it('THEME_PRESETSのIDと一致する', () => {
    const expected = THEME_PRESETS.map((t) => t.id);
    expect(THEME_IDS).toEqual(expected);
  });
});

describe('ThemePreset フィールド拡張', () => {
  it('全テーマに fontStyle が定義されている', () => {
    THEME_PRESETS.forEach((preset) => {
      expect(preset.fontStyle).toBeDefined();
      expect(typeof preset.fontStyle).toBe('string');
    });
  });

  it('全テーマに animationType が定義されている', () => {
    const validTypes = ['steam', 'flame', 'particles', 'leaf', 'glow', 'snow', 'stars'];
    THEME_PRESETS.forEach((preset) => {
      expect(validTypes).toContain(preset.animationType);
    });
  });

  it('fontStyle が有効な Tailwind クラスを含む', () => {
    THEME_PRESETS.forEach((preset) => {
      expect(preset.fontStyle).toMatch(
        /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
      );
      expect(preset.fontStyle).toMatch(
        /tracking-(tighter|tight|normal|wide|wider|widest)/,
      );
    });
  });
});

describe('isDarkTheme', () => {
  it('ダーク系テーマでtrueを返す', () => {
    expect(isDarkTheme('dark-roast')).toBe(true);
    expect(isDarkTheme('matcha')).toBe(true);
    expect(isDarkTheme('caramel')).toBe(true);
    expect(isDarkTheme('christmas')).toBe(true);
  });

  it('ライト系テーマでfalseを返す', () => {
    expect(isDarkTheme('default')).toBe(false);
    expect(isDarkTheme('light-roast')).toBe(false);
  });

  it('未知のテーマIDでfalseを返す', () => {
    expect(isDarkTheme('unknown')).toBe(false);
  });

  it('undefinedでfalseを返す', () => {
    expect(isDarkTheme(undefined)).toBe(false);
  });
});

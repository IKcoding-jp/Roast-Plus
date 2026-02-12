import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from './useAppTheme';
import { THEME_PRESETS } from '@/lib/theme';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    resolvedTheme: 'default',
    setTheme: mockSetTheme,
    themes: ['default', 'dark-roast', 'light-roast', 'matcha', 'caramel', 'christmas'],
  })),
}));

describe('useAppTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('現在のテーマを返す', () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.currentTheme).toBe('default');
  });

  it('setThemeでテーマを切り替えられる', () => {
    const { result } = renderHook(() => useAppTheme());
    act(() => {
      result.current.setTheme('dark-roast');
    });
    expect(mockSetTheme).toHaveBeenCalledWith('dark-roast');
  });

  it('プリセット一覧を返す', () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.presets).toBe(THEME_PRESETS);
  });

  it('ライト系テーマではisDarkThemeがfalse', () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.isDarkTheme).toBe(false);
  });

  it('デフォルトテーマではisChristmasThemeがfalse', () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.isChristmasTheme).toBe(false);
  });

  it('クリスマステーマを判定できる', async () => {
    const { useTheme } = await import('next-themes');
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: 'christmas',
      setTheme: mockSetTheme,
      themes: ['default', 'dark-roast', 'light-roast', 'matcha', 'caramel', 'christmas'],
      theme: 'christmas',
      systemTheme: undefined,
      forcedTheme: undefined,
    });

    const { result } = renderHook(() => useAppTheme());
    expect(result.current.isChristmasTheme).toBe(true);
    expect(result.current.isDarkTheme).toBe(true);
  });

  it('ダーク系テーマを判定できる', async () => {
    const { useTheme } = await import('next-themes');
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: 'dark-roast',
      setTheme: mockSetTheme,
      themes: ['default', 'dark-roast', 'light-roast', 'matcha', 'caramel', 'christmas'],
      theme: 'dark-roast',
      systemTheme: undefined,
      forcedTheme: undefined,
    });

    const { result } = renderHook(() => useAppTheme());
    expect(result.current.isDarkTheme).toBe(true);
    expect(result.current.isChristmasTheme).toBe(false);
  });
});

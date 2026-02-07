import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChristmasMode } from './useChristmasMode';

// next-themes のモック
const mockSetTheme = vi.fn();
let mockResolvedTheme = 'default';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe('useChristmasMode', () => {
  beforeEach(() => {
    mockResolvedTheme = 'default';
    mockSetTheme.mockClear();
  });

  it('初期状態でクリスマスモードはオフ', () => {
    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(false);
  });

  it('resolvedTheme が christmas の場合、isChristmasMode は true', () => {
    mockResolvedTheme = 'christmas';
    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(true);
  });

  it('setChristmasMode(true) で christmas テーマに切り替え', () => {
    const { result } = renderHook(() => useChristmasMode());

    act(() => {
      result.current.setChristmasMode(true);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('christmas');
  });

  it('setChristmasMode(false) で default テーマに切り替え', () => {
    mockResolvedTheme = 'christmas';
    const { result } = renderHook(() => useChristmasMode());

    act(() => {
      result.current.setChristmasMode(false);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('default');
  });

  it('toggleChristmasMode でテーマを反転（default → christmas）', () => {
    mockResolvedTheme = 'default';
    const { result } = renderHook(() => useChristmasMode());

    act(() => {
      result.current.toggleChristmasMode();
    });

    expect(mockSetTheme).toHaveBeenCalledWith('christmas');
  });

  it('toggleChristmasMode でテーマを反転（christmas → default）', () => {
    mockResolvedTheme = 'christmas';
    const { result } = renderHook(() => useChristmasMode());

    act(() => {
      result.current.toggleChristmasMode();
    });

    expect(mockSetTheme).toHaveBeenCalledWith('default');
  });

  it('返り値の型が正しい', () => {
    const { result } = renderHook(() => useChristmasMode());

    expect(typeof result.current.isChristmasMode).toBe('boolean');
    expect(typeof result.current.setChristmasMode).toBe('function');
    expect(typeof result.current.toggleChristmasMode).toBe('function');
  });
});

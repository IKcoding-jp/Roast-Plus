import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let listeners: Array<() => void>;
  let matchesMock: boolean;

  beforeEach(() => {
    listeners = [];
    matchesMock = false;

    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: matchesMock,
      media: query,
      addEventListener: (_event: string, cb: () => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_event: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('SSR安全: 初期値はfalseを返す', () => {
    vi.stubGlobal('matchMedia', undefined);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('マッチする場合はtrueを返す', () => {
    matchesMock = true;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('マッチしない場合はfalseを返す', () => {
    matchesMock = false;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('メディアクエリ変更時にリアクティブに更新される', () => {
    matchesMock = false;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // 画面幅がブレークポイントを超えた → matchMediaのmatchesが変化
    act(() => {
      matchesMock = true;
      listeners.forEach((cb) => cb());
    });

    expect(result.current).toBe(true);
  });

  it('アンマウント時にリスナーが解除される', () => {
    matchesMock = false;

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(listeners).toHaveLength(1);

    unmount();

    expect(listeners).toHaveLength(0);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChristmasMode } from './useChristmasMode';

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

describe('useChristmasMode', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('初期状態でクリスマスモードはオフ（マイグレーション未実施）', () => {
    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(false);
  });

  it('マイグレーション時に既存のlocalStorageキーを削除する', () => {
    // 既存のキーを設定
    localStorageMock.setItem('roastplus_christmas_mode', 'true');

    renderHook(() => useChristmasMode());

    // マイグレーション後に削除されている
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'roastplus_christmas_mode'
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'roastplus_christmas_mode_migrated',
      'true'
    );
  });

  it('マイグレーション済みの場合はlocalStorageから読み込む', () => {
    // マイグレーション済みフラグを設定
    localStorageMock.setItem('roastplus_christmas_mode_migrated', 'true');
    localStorageMock.setItem('roastplus_christmas_mode', 'true');

    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(true);
  });

  it('setChristmasModeで状態を変更できる', () => {
    const { result } = renderHook(() => useChristmasMode());

    act(() => {
      result.current.setChristmasMode(true);
    });

    expect(result.current.isChristmasMode).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'roastplus_christmas_mode',
      'true'
    );
  });

  it('toggleChristmasModeで状態を反転できる', () => {
    const { result } = renderHook(() => useChristmasMode());

    // 初期状態はfalse
    expect(result.current.isChristmasMode).toBe(false);

    // トグル
    act(() => {
      result.current.toggleChristmasMode();
    });

    expect(result.current.isChristmasMode).toBe(true);

    // もう一度トグル
    act(() => {
      result.current.toggleChristmasMode();
    });

    expect(result.current.isChristmasMode).toBe(false);
  });

  it('マイグレーション済みでstored=nullの場合falseを返す', () => {
    // マイグレーション済みフラグを設定、Christmas modeキーは未設定
    localStorageMock.setItem('roastplus_christmas_mode_migrated', 'true');
    // roastplus_christmas_modeは設定しない（null）

    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(false);
  });

  it('マイグレーション済みでstored=falseの場合falseを返す', () => {
    localStorageMock.setItem('roastplus_christmas_mode_migrated', 'true');
    localStorageMock.setItem('roastplus_christmas_mode', 'false');

    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(false);
  });

  it('localStorageへの保存を確認できる', () => {
    const { result } = renderHook(() => useChristmasMode());

    act(() => {
      result.current.setChristmasMode(true);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'roastplus_christmas_mode',
      'true'
    );

    act(() => {
      result.current.setChristmasMode(false);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'roastplus_christmas_mode',
      'false'
    );
  });
});

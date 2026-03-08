import { render, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SplashScreen } from './SplashScreen';

describe('SplashScreen', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('初回起動時にスプラッシュが表示されること', async () => {
    const { container } = render(<SplashScreen />);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const splash = container.querySelector('.fixed.inset-0');
    expect(splash).toBeInTheDocument();
  });

  it('sessionStorageにroastplus_splash_shownが保存されること', async () => {
    render(<SplashScreen />);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(sessionStorage.getItem('roastplus_splash_shown')).toBe('true');
  });

  it('2回目の起動時はスプラッシュが表示されないこと', async () => {
    sessionStorage.setItem('roastplus_splash_shown', 'true');
    const { container } = render(<SplashScreen />);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const splash = container.querySelector('.fixed.inset-0');
    expect(splash).not.toBeInTheDocument();
  });

  it('2800ms後にフェードアウトが開始されること', async () => {
    const { container } = render(<SplashScreen />);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 初回表示確認
    const splashInitial = container.querySelector('.fixed.inset-0');
    expect(splashInitial).toBeInTheDocument();

    // フェードアウト後に非表示になること（2800ms + 500ms）
    await act(async () => {
      vi.advanceTimersByTime(2800 + 500 + 100);
      await vi.runAllTimersAsync();
    });

    const splashAfter = container.querySelector('.fixed.inset-0');
    expect(splashAfter).not.toBeInTheDocument();
  });
});

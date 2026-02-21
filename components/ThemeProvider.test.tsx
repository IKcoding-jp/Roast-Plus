import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { isDarkTheme, THEME_PRESETS } from '@/lib/theme';

// next-themes のモック
const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="next-themes-provider">{children}</div>
  ),
  useTheme: () => ({
    resolvedTheme: 'default',
    setTheme: mockSetTheme,
    theme: 'default',
  }),
}));

// localStorageのモック
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(),
  };
};

describe('ThemeProvider', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
    mockSetTheme.mockClear();
  });

  it('子要素を正しくレンダリングする', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('NextThemesProvider でラップされる', () => {
    render(
      <ThemeProvider>
        <span>Content</span>
      </ThemeProvider>
    );

    expect(screen.getByTestId('next-themes-provider')).toBeDefined();
  });

  it('旧localStorage キーからマイグレーションする（christmas=true）', async () => {
    localStorageMock.setItem('roastplus_christmas_mode', 'true');

    render(
      <ThemeProvider>
        <span>Content</span>
      </ThemeProvider>
    );

    // useEffectが実行されるまで待つ
    await vi.waitFor(() => {
      expect(mockSetTheme).toHaveBeenCalledWith('christmas');
    });

    // 旧キーがクリーンアップされている
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('roastplus_christmas_mode');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('roastplus_christmas_mode_migrated');
  });

  it('マイグレーション済みの場合は再実行しない', async () => {
    localStorageMock.setItem('roastplus_theme_migrated_v2', 'true');
    localStorageMock.setItem('roastplus_christmas_mode', 'true');

    render(
      <ThemeProvider>
        <span>Content</span>
      </ThemeProvider>
    );

    // setTheme が呼ばれないことを確認（少し待ってから）
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockSetTheme).not.toHaveBeenCalled();
  });

  it('旧キーが false の場合はテーマ変更しない', async () => {
    localStorageMock.setItem('roastplus_christmas_mode', 'false');

    render(
      <ThemeProvider>
        <span>Content</span>
      </ThemeProvider>
    );

    // マイグレーション完了を待つ
    await vi.waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('roastplus_theme_migrated_v2', 'true');
    });

    // christmas テーマには切り替えない
    expect(mockSetTheme).not.toHaveBeenCalledWith('christmas');
  });
});

describe('Pure Neutral Dark テーマ（#246）', () => {
  it('isDarkTheme が dark テーマを正しく判定する', () => {
    expect(isDarkTheme('dark')).toBe(true);
  });

  it('THEME_PRESETS に dark テーマが含まれている', () => {
    const darkPreset = THEME_PRESETS.find((t) => t.id === 'dark');
    expect(darkPreset).toBeDefined();
    expect(darkPreset?.name).toBe('ダークモード');
    expect(darkPreset?.type).toBe('dark');
    expect(darkPreset?.themeColor).toBe('#0f0f0f');
  });
});

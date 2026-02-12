import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from './ThemeSelector';
import { THEME_PRESETS } from '@/lib/theme';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    resolvedTheme: 'default',
    setTheme: mockSetTheme,
    themes: ['default', 'dark-roast', 'light-roast', 'matcha', 'caramel', 'christmas'],
  })),
}));

describe('ThemeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('6つのテーマカードが表示される', () => {
    render(<ThemeSelector />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
  });

  it('テーマ名と説明文が正しく表示される', () => {
    render(<ThemeSelector />);
    for (const preset of THEME_PRESETS) {
      expect(screen.getByText(preset.name)).toBeInTheDocument();
      expect(screen.getByText(preset.description)).toBeInTheDocument();
    }
  });

  it('現在選択中のテーマにaria-pressed=trueが設定される', () => {
    render(<ThemeSelector />);
    const buttons = screen.getAllByRole('button');
    const defaultButton = buttons.find((btn) =>
      btn.textContent?.includes('デフォルト')
    );
    expect(defaultButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('未選択のテーマにaria-pressed=falseが設定される', () => {
    render(<ThemeSelector />);
    const buttons = screen.getAllByRole('button');
    const darkRoastButton = buttons.find((btn) =>
      btn.textContent?.includes('ダークロースト')
    );
    expect(darkRoastButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('テーマカードクリックでsetThemeが呼ばれる', () => {
    render(<ThemeSelector />);

    const buttons = screen.getAllByRole('button');
    const matchaButton = buttons.find((btn) =>
      btn.textContent?.includes('抹茶ラテ')
    );
    fireEvent.click(matchaButton!);

    expect(mockSetTheme).toHaveBeenCalledWith('matcha');
  });

  it('選択中テーマにチェックマークが表示される', () => {
    render(<ThemeSelector />);
    // デフォルトが選択中なので、そのカード内にチェックアイコンがある
    const buttons = screen.getAllByRole('button');
    const defaultButton = buttons.find((btn) =>
      btn.textContent?.includes('デフォルト')
    );
    // チェックマーク（HiCheck SVG）が含まれる
    const checkIcon = defaultButton?.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
  });
});

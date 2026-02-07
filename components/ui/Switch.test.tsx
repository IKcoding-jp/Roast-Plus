import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('ラベルを表示する', () => {
      render(<Switch label="通知" />);
      expect(screen.getByText('通知')).toBeInTheDocument();
    });

    it('checked=trueでON状態になる', () => {
      render(<Switch checked onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('checked=falseでOFF状態になる', () => {
      render(<Switch checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('クリック時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<Switch checked={false} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalled();
    });

    it('クリックでcheckedがトグルされる', () => {
      const handleChange = vi.fn();
      render(<Switch checked={false} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('switch'));
      expect(handleChange.mock.calls[0][0].target.checked).toBe(true);
    });
  });

  describe('サイズバリアント', () => {
    it('smサイズのスタイルが適用される', () => {
      render(<Switch size="sm" />);
      const switchButton = screen.getByRole('switch');
      expect(switchButton.className).toContain('w-8');
      expect(switchButton.className).toContain('h-4');
    });

    it('mdサイズのスタイルが適用される（デフォルト）', () => {
      render(<Switch size="md" />);
      const switchButton = screen.getByRole('switch');
      expect(switchButton.className).toContain('w-11');
      expect(switchButton.className).toContain('h-6');
    });

    it('lgサイズのスタイルが適用される', () => {
      render(<Switch size="lg" />);
      const switchButton = screen.getByRole('switch');
      expect(switchButton.className).toContain('w-14');
      expect(switchButton.className).toContain('h-7');
    });
  });

  describe('disabled状態', () => {
    it('disabled時はクリックできない', () => {
      const handleChange = vi.fn();
      render(<Switch disabled onChange={handleChange} />);

      fireEvent.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<Switch disabled />);
      expect(screen.getByRole('switch').className).toContain('opacity-50');
    });

    it('disabled時はbutton要素もdisabledになる', () => {
      render(<Switch disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });
  });

  describe('カスタムクラス', () => {
    it('classNameでコンテナに追加のスタイルを指定できる', () => {
      const { container } = render(<Switch className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される（hidden input）', () => {
      const ref = vi.fn();
      render(<Switch ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('アクセシビリティ', () => {
    it('role=switchが設定される', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('aria-checkedが設定される', () => {
      render(<Switch checked onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('ラベルがaria-labelledbyで関連付けられる', () => {
      render(<Switch label="通知設定" id="notification-switch" />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-labelledby', 'notification-switch-label');
    });
  });
});

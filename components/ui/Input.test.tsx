import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('ラベルを表示する', () => {
      render(<Input label="名前" />);
      expect(screen.getByText('名前')).toBeInTheDocument();
      expect(screen.getByLabelText('名前')).toBeInTheDocument();
    });

    it('placeholderを表示する', () => {
      render(<Input placeholder="入力してください" />);
      expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
    });

    it('valueが反映される', () => {
      render(<Input value="テスト値" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('テスト値');
    });

    it('入力時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('disabled状態', () => {
    it('disabled時は入力できない', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox').className).toContain('opacity-50');
    });
  });

  describe('エラー表示', () => {
    it('エラーメッセージを表示する', () => {
      render(<Input error="入力が必要です" />);
      expect(screen.getByText('入力が必要です')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid=trueが設定される', () => {
      render(<Input error="エラー" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーなしの場合はaria-invalid=falseが設定される', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('エラー時はエラースタイルが適用される', () => {
      render(<Input error="エラー" />);
      expect(screen.getByRole('textbox').className).toContain('border-red-500');
    });
  });

  describe('パスワードトグル', () => {
    it('showPasswordToggle時はトグルボタンが表示される', () => {
      render(<Input type="password" showPasswordToggle />);
      expect(screen.getByRole('button', { name: 'パスワードを表示' })).toBeInTheDocument();
    });

    it('トグルボタンでパスワードの表示/非表示を切り替えられる', () => {
      const { container } = render(<Input type="password" showPasswordToggle />);

      // type="password" の input は role="textbox" を持たないため querySelector を使用
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');

      fireEvent.click(screen.getByRole('button', { name: 'パスワードを表示' }));
      expect(input.type).toBe('text');

      fireEvent.click(screen.getByRole('button', { name: 'パスワードを非表示' }));
      expect(input.type).toBe('password');
    });

    it('type=passwordでshowPasswordToggle=falseの場合はトグルボタンが表示されない', () => {
      render(<Input type="password" showPasswordToggle={false} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード時はクリスマススタイルが適用される', () => {
      render(<Input isChristmasMode />);
      expect(screen.getByRole('textbox').className).toContain('border-[#d4af37]');
    });

    it('通常モード時は通常スタイルが適用される', () => {
      render(<Input isChristmasMode={false} />);
      expect(screen.getByRole('textbox').className).toContain('border-gray-200');
    });

    it('クリスマスモード時のラベルスタイルが適用される', () => {
      render(<Input label="テスト" isChristmasMode />);
      expect(screen.getByText('テスト').className).toContain('text-[#f8f1e7]');
    });

    it('クリスマスモード時のエラースタイルが適用される', () => {
      render(<Input error="エラー" isChristmasMode />);
      expect(screen.getByRole('textbox').className).toContain('border-red-400');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole('textbox').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('アクセシビリティ', () => {
    it('ラベルとinputが正しく関連付けられる', () => {
      render(<Input label="メール" id="email-input" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('メール');

      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('エラー時はaria-describedbyが設定される', () => {
      render(<Input error="エラー" id="test-input" />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });
  });
});

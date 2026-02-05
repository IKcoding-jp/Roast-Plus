import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineInput } from './InlineInput';

describe('InlineInput', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<InlineInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('valueが反映される', () => {
      render(<InlineInput value="テスト値" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('テスト値');
    });

    it('入力時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<InlineInput onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('placeholderを表示する', () => {
      render(<InlineInput placeholder="入力してください" />);
      expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
    });

    it('onKeyDownイベントが発火する', () => {
      const handleKeyDown = vi.fn();
      render(<InlineInput onKeyDown={handleKeyDown} />);

      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('autoFocusが適用される', () => {
      render(<InlineInput autoFocus />);
      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('バリアント', () => {
    it('lightバリアントのスタイルが適用される（デフォルト）', () => {
      render(<InlineInput />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-white');
      expect(input.className).toContain('border-gray-300');
    });

    it('darkバリアントのスタイルが適用される', () => {
      render(<InlineInput variant="dark" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-white');
      expect(input.className).toContain('border-primary');
    });
  });

  describe('テキスト配置', () => {
    it('centerがデフォルトで適用される', () => {
      render(<InlineInput />);
      expect(screen.getByRole('textbox').className).toContain('text-center');
    });

    it('leftが適用される', () => {
      render(<InlineInput textAlign="left" />);
      expect(screen.getByRole('textbox').className).toContain('text-left');
    });

    it('rightが適用される', () => {
      render(<InlineInput textAlign="right" />);
      expect(screen.getByRole('textbox').className).toContain('text-right');
    });
  });

  describe('disabled状態', () => {
    it('disabled時は入力できない', () => {
      render(<InlineInput disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード + lightバリアントのスタイルが適用される', () => {
      render(<InlineInput isChristmasMode />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-white/10');
      expect(input.className).toContain('border-[#d4af37]/40');
      expect(input.className).toContain('text-[#f8f1e7]');
    });

    it('クリスマスモード + darkバリアントのスタイルが適用される', () => {
      render(<InlineInput isChristmasMode variant="dark" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-[#1a1a1a]');
      expect(input.className).toContain('border-[#d4af37]');
      expect(input.className).toContain('text-[#f8f1e7]');
    });

    it('通常モード + lightバリアントのスタイルが適用される', () => {
      render(<InlineInput isChristmasMode={false} />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-white');
      expect(input.className).toContain('border-gray-300');
    });

    it('通常モード + darkバリアントのスタイルが適用される', () => {
      render(<InlineInput isChristmasMode={false} variant="dark" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-white');
      expect(input.className).toContain('border-primary');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<InlineInput className="custom-class" />);
      expect(screen.getByRole('textbox').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<InlineInput ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });
});

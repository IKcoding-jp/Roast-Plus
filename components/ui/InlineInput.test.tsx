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
      expect(input.className).toContain('bg-field');
      expect(input.className).toContain('border-edge-strong');
    });

    it('darkバリアントのスタイルが適用される', () => {
      render(<InlineInput variant="dark" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-field');
      expect(input.className).toContain('border-spot');
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

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<NumberInput />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('ラベルを表示する', () => {
      render(<NumberInput label="数量" />);
      expect(screen.getByText('数量')).toBeInTheDocument();
      expect(screen.getByLabelText('数量')).toBeInTheDocument();
    });

    it('valueが反映される', () => {
      render(<NumberInput value={42} onChange={() => {}} />);
      expect(screen.getByRole('spinbutton')).toHaveValue(42);
    });

    it('入力時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<NumberInput onChange={handleChange} />);

      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('suffix', () => {
    it('suffixを表示する', () => {
      render(<NumberInput suffix="px" />);
      expect(screen.getByText('px')).toBeInTheDocument();
    });

    it('suffix指定時はスタイルが適用される', () => {
      render(<NumberInput suffix="cm" />);
      const suffix = screen.getByText('cm');
      expect(suffix.className).toContain('text-ink-sub');
    });
  });

  describe('min/max制限', () => {
    it('min属性が設定される', () => {
      render(<NumberInput min={0} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('min', '0');
    });

    it('max属性が設定される', () => {
      render(<NumberInput max={100} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '100');
    });

    it('step属性が設定される', () => {
      render(<NumberInput step={5} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '5');
    });
  });

  describe('disabled状態', () => {
    it('disabled時は入力できない', () => {
      render(<NumberInput disabled />);
      expect(screen.getByRole('spinbutton')).toBeDisabled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<NumberInput disabled />);
      expect(screen.getByRole('spinbutton').className).toContain('opacity-50');
    });
  });

  describe('エラー表示', () => {
    it('エラーメッセージを表示する', () => {
      render(<NumberInput error="無効な値です" />);
      expect(screen.getByText('無効な値です')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid=trueが設定される', () => {
      render(<NumberInput error="エラー" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラー時はエラースタイルが適用される', () => {
      render(<NumberInput error="エラー" />);
      expect(screen.getByRole('spinbutton').className).toContain('border-error');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<NumberInput className="custom-class" />);
      expect(screen.getByRole('spinbutton').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<NumberInput ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });
});

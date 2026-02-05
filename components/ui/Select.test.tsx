import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const mockOptions = [
  { value: 'light', label: 'ライト' },
  { value: 'medium', label: 'ミディアム' },
  { value: 'dark', label: 'ダーク' },
];

describe('Select', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('ラベルを表示する', () => {
      render(<Select label="焙煎度" options={mockOptions} />);
      expect(screen.getByText('焙煎度')).toBeInTheDocument();
      expect(screen.getByLabelText('焙煎度')).toBeInTheDocument();
    });

    it('オプションが表示される', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('option', { name: 'ライト' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ミディアム' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ダーク' })).toBeInTheDocument();
    });

    it('valueが反映される', () => {
      render(<Select options={mockOptions} value="medium" onChange={() => {}} />);
      expect(screen.getByRole('combobox')).toHaveValue('medium');
    });

    it('選択変更時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<Select options={mockOptions} onChange={handleChange} />);

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dark' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('placeholder', () => {
    it('placeholderを表示する', () => {
      render(<Select options={mockOptions} placeholder="選択してください" />);
      expect(screen.getByRole('option', { name: '選択してください' })).toBeInTheDocument();
    });

    it('placeholderは空の値を持つ', () => {
      render(<Select options={mockOptions} placeholder="選択してください" />);
      const placeholderOption = screen.getByRole('option', { name: '選択してください' });
      expect(placeholderOption).toHaveValue('');
    });
  });

  describe('disabled状態', () => {
    it('disabled時は選択できない', () => {
      render(<Select options={mockOptions} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<Select options={mockOptions} disabled />);
      expect(screen.getByRole('combobox').className).toContain('opacity-50');
    });
  });

  describe('エラー表示', () => {
    it('エラーメッセージを表示する', () => {
      render(<Select options={mockOptions} error="選択が必要です" />);
      expect(screen.getByText('選択が必要です')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid=trueが設定される', () => {
      render(<Select options={mockOptions} error="エラー" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラー時はエラースタイルが適用される', () => {
      render(<Select options={mockOptions} error="エラー" />);
      expect(screen.getByRole('combobox').className).toContain('border-red-500');
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード時はクリスマススタイルが適用される', () => {
      render(<Select options={mockOptions} isChristmasMode />);
      expect(screen.getByRole('combobox').className).toContain('border-[#d4af37]');
    });

    it('通常モード時は通常スタイルが適用される', () => {
      render(<Select options={mockOptions} isChristmasMode={false} />);
      expect(screen.getByRole('combobox').className).toContain('border-gray-200');
    });

    it('クリスマスモード時のエラースタイルが適用される', () => {
      render(<Select options={mockOptions} error="エラー" isChristmasMode />);
      expect(screen.getByRole('combobox').className).toContain('border-red-400');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<Select options={mockOptions} className="custom-class" />);
      expect(screen.getByRole('combobox').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Select options={mockOptions} ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLSelectElement);
    });
  });

  describe('空のオプション', () => {
    it('空のオプション配列でもエラーにならない', () => {
      render(<Select options={[]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('ラベルを表示する', () => {
      render(<Textarea label="メモ" />);
      expect(screen.getByText('メモ')).toBeInTheDocument();
      expect(screen.getByLabelText('メモ')).toBeInTheDocument();
    });

    it('placeholderを表示する', () => {
      render(<Textarea placeholder="入力してください" />);
      expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
    });

    it('valueが反映される', () => {
      render(<Textarea value="テスト内容" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('テスト内容');
    });

    it('入力時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('rows設定', () => {
    it('デフォルトでrows=4が設定される', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
    });

    it('rows属性を指定できる', () => {
      render(<Textarea rows={6} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
    });
  });

  describe('disabled状態', () => {
    it('disabled時は入力できない', () => {
      render(<Textarea disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<Textarea disabled />);
      expect(screen.getByRole('textbox').className).toContain('opacity-50');
    });
  });

  describe('エラー表示', () => {
    it('エラーメッセージを表示する', () => {
      render(<Textarea error="入力が必要です" />);
      expect(screen.getByText('入力が必要です')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid=trueが設定される', () => {
      render(<Textarea error="エラー" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラー時はエラースタイルが適用される', () => {
      render(<Textarea error="エラー" />);
      expect(screen.getByRole('textbox').className).toContain('border-red-500');
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード時はクリスマススタイルが適用される', () => {
      render(<Textarea isChristmasMode />);
      expect(screen.getByRole('textbox').className).toContain('border-[#d4af37]');
    });

    it('通常モード時は通常スタイルが適用される', () => {
      render(<Textarea isChristmasMode={false} />);
      expect(screen.getByRole('textbox').className).toContain('border-gray-200');
    });

    it('クリスマスモード時のエラースタイルが適用される', () => {
      render(<Textarea error="エラー" isChristmasMode />);
      expect(screen.getByRole('textbox').className).toContain('border-red-400');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<Textarea className="custom-class" />);
      expect(screen.getByRole('textbox').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});

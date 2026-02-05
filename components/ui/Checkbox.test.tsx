import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('ラベルを表示する', () => {
      render(<Checkbox label="利用規約に同意" />);
      expect(screen.getByText('利用規約に同意')).toBeInTheDocument();
    });

    it('checked=trueでチェック状態になる', () => {
      render(<Checkbox checked onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('checked=falseで未チェック状態になる', () => {
      render(<Checkbox checked={false} onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('クリック時にonChangeが呼ばれる', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('description', () => {
    it('descriptionを表示する', () => {
      render(<Checkbox label="通知" description="新しい通知を受け取ります" />);
      expect(screen.getByText('新しい通知を受け取ります')).toBeInTheDocument();
    });

    it('descriptionのスタイルが適用される', () => {
      render(<Checkbox label="通知" description="説明文" />);
      const description = screen.getByText('説明文');
      expect(description.className).toContain('text-sm');
    });

    it('クリスマスモード時のdescriptionスタイルが適用される', () => {
      render(<Checkbox label="通知" description="説明文" isChristmasMode />);
      const description = screen.getByText('説明文');
      expect(description.className).toContain('text-[#f8f1e7]');
    });
  });

  describe('disabled状態', () => {
    it('disabled時はcheckbox要素がdisabledになる', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox').className).toContain('opacity-50');
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード時はクリスマススタイルが適用される', () => {
      render(<Checkbox isChristmasMode />);
      expect(screen.getByRole('checkbox').className).toContain('border-[#d4af37]');
    });

    it('通常モード時は通常スタイルが適用される', () => {
      render(<Checkbox isChristmasMode={false} />);
      expect(screen.getByRole('checkbox').className).toContain('border-gray-300');
    });

    it('クリスマスモード時のラベルスタイルが適用される', () => {
      render(<Checkbox label="テスト" isChristmasMode />);
      expect(screen.getByText('テスト').className).toContain('text-[#f8f1e7]');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameでコンテナに追加のスタイルを指定できる', () => {
      const { container } = render(<Checkbox className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('アクセシビリティ', () => {
    it('ラベルとチェックボックスが正しく関連付けられる', () => {
      render(<Checkbox label="同意する" id="agree-checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('同意する');

      expect(label).toHaveAttribute('for', 'agree-checkbox');
      expect(checkbox).toHaveAttribute('id', 'agree-checkbox');
    });
  });
});

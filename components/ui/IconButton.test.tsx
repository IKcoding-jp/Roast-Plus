import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<IconButton aria-label="テストボタン">X</IconButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('childrenを正しく表示する', () => {
      render(<IconButton>✕</IconButton>);
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('クリック時にonClickが呼ばれる', () => {
      const handleClick = vi.fn();
      render(<IconButton onClick={handleClick}>X</IconButton>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('バリアント（通常モード）', () => {
    it('defaultバリアントのスタイルが適用される', () => {
      render(<IconButton variant="default">X</IconButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-ink-sub');
    });

    it('primaryバリアントのスタイルが適用される', () => {
      render(<IconButton variant="primary">X</IconButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-spot');
    });

    it('dangerバリアントのスタイルが適用される', () => {
      render(<IconButton variant="danger">X</IconButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-danger');
    });

    it('successバリアントのスタイルが適用される', () => {
      render(<IconButton variant="success">X</IconButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-success');
    });

    it('ghostバリアントのスタイルが適用される', () => {
      render(<IconButton variant="ghost">X</IconButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-ink-muted');
    });
  });

  describe('サイズ', () => {
    it('smサイズのスタイルが適用される', () => {
      render(<IconButton size="sm">X</IconButton>);
      expect(screen.getByRole('button').className).toContain('p-1.5');
    });

    it('mdサイズのスタイルが適用される（デフォルト）', () => {
      render(<IconButton size="md">X</IconButton>);
      expect(screen.getByRole('button').className).toContain('p-2');
    });

    it('lgサイズのスタイルが適用される', () => {
      render(<IconButton size="lg">X</IconButton>);
      expect(screen.getByRole('button').className).toContain('p-3');
    });
  });

  describe('rounded', () => {
    it('rounded=trueで円形スタイルが適用される', () => {
      render(<IconButton rounded>X</IconButton>);
      expect(screen.getByRole('button').className).toContain('rounded-full');
    });

    it('rounded=falseで角丸スタイルが適用される', () => {
      render(<IconButton rounded={false}>X</IconButton>);
      expect(screen.getByRole('button').className).toContain('rounded-lg');
    });
  });

  describe('disabled状態', () => {
    it('disabled時はクリックできない', () => {
      const handleClick = vi.fn();
      render(<IconButton disabled onClick={handleClick}>X</IconButton>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('disabled時はbutton要素がdisabledになる', () => {
      render(<IconButton disabled>X</IconButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disabled時はスタイルが適用される', () => {
      render(<IconButton disabled>X</IconButton>);
      expect(screen.getByRole('button').className).toContain('opacity-50');
      expect(screen.getByRole('button').className).toContain('cursor-not-allowed');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<IconButton className="custom-class">X</IconButton>);
      expect(screen.getByRole('button').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<IconButton ref={ref}>X</IconButton>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('アクセシビリティ', () => {
    it('aria-labelを設定できる', () => {
      render(<IconButton aria-label="閉じる">X</IconButton>);
      expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    });
  });
});

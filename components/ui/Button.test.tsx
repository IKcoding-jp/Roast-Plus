import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('基本機能', () => {
    it('childrenを表示する', () => {
      render(<Button>クリック</Button>);
      expect(screen.getByText('クリック')).toBeInTheDocument();
    });

    it('クリック時にonClickが呼ばれる', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>テスト</Button>);

      fireEvent.click(screen.getByText('テスト'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled時はクリックできない', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          無効
        </Button>
      );

      const button = screen.getByText('無効');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe('loading状態', () => {
    it('loading時はクリックできない', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          送信中
        </Button>
      );

      const button = screen.getByText('送信中');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    it('loading時はaria-busy属性が設定される', () => {
      render(<Button loading>送信中</Button>);

      const button = screen.getByText('送信中');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('バリアント', () => {
    it('primaryバリアントのスタイルが適用される', () => {
      render(<Button variant="primary">プライマリ</Button>);
      const button = screen.getByText('プライマリ');

      expect(button.className).toContain('bg-btn-primary');
    });

    it('secondaryバリアントのスタイルが適用される', () => {
      render(<Button variant="secondary">セカンダリ</Button>);
      const button = screen.getByText('セカンダリ');

      expect(button.className).toContain('bg-gray-600');
    });

    it('dangerバリアントのスタイルが適用される', () => {
      render(<Button variant="danger">削除</Button>);
      const button = screen.getByText('削除');

      expect(button.className).toContain('bg-danger');
    });

    it('outlineバリアントのスタイルが適用される', () => {
      render(<Button variant="outline">アウトライン</Button>);
      const button = screen.getByText('アウトライン');

      expect(button.className).toContain('border-2');
      expect(button.className).toContain('border-spot');
    });
  });

  describe('サイズ', () => {
    it('sm サイズのスタイルが適用される', () => {
      render(<Button size="sm">小</Button>);
      const button = screen.getByText('小');

      expect(button.className).toContain('px-4');
      expect(button.className).toContain('py-2');
    });

    it('md サイズのスタイルが適用される（デフォルト）', () => {
      render(<Button size="md">中</Button>);
      const button = screen.getByText('中');

      expect(button.className).toContain('px-6');
      expect(button.className).toContain('py-3');
    });

    it('lg サイズのスタイルが適用される', () => {
      render(<Button size="lg">大</Button>);
      const button = screen.getByText('大');

      expect(button.className).toContain('px-8');
      expect(button.className).toContain('py-4');
    });
  });

  describe('フル幅', () => {
    it('fullWidth時はw-fullクラスが適用される', () => {
      render(<Button fullWidth>フル幅</Button>);
      const button = screen.getByText('フル幅');

      expect(button.className).toContain('w-full');
    });
  });

  describe('バッジ', () => {
    it('badge指定時はバッジが表示される', () => {
      render(<Button badge={3}>フィルター</Button>);

      expect(screen.getByLabelText('3件')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('badge=0時はバッジが表示されない', () => {
      render(<Button badge={0}>フィルター</Button>);

      expect(screen.queryByLabelText('0件')).not.toBeInTheDocument();
    });

    it('badge未指定時はバッジが表示されない', () => {
      render(<Button>フィルター</Button>);

      // バッジ要素が存在しないことを確認
      const button = screen.getByText('フィルター');
      expect(button.querySelector('span[aria-label*="件"]')).not.toBeInTheDocument();
    });

  });

  describe('カスタムクラス', () => {
    it('classNameプロパティで追加のスタイルを指定できる', () => {
      render(<Button className="custom-class">カスタム</Button>);
      const button = screen.getByText('カスタム');

      expect(button.className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref</Button>);

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });
});

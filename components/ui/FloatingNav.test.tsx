import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloatingNav } from './FloatingNav';

// next/link のモック
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('FloatingNav', () => {
  describe('戻るボタン', () => {
    it('backHref指定時にリンクが表示される', () => {
      render(<FloatingNav backHref="/settings" />);
      const link = screen.getByLabelText('戻る');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/settings');
    });

    it('backHref指定時に正しいhrefが設定される', () => {
      render(<FloatingNav backHref="/tasting" />);
      const link = screen.getByLabelText('戻る');
      expect(link).toHaveAttribute('href', '/tasting');
    });

    it('backHref未指定時に戻るボタンが表示されない', () => {
      render(<FloatingNav />);
      expect(screen.queryByLabelText('戻る')).not.toBeInTheDocument();
    });

    it('戻るボタンにaria-label="戻る"が設定されている', () => {
      render(<FloatingNav backHref="/" />);
      const link = screen.getByLabelText('戻る');
      expect(link).toHaveAttribute('aria-label', '戻る');
    });

    it('戻るボタンにfixedクラスが適用される', () => {
      render(<FloatingNav backHref="/" />);
      const link = screen.getByLabelText('戻る');
      expect(link.className).toContain('fixed');
    });
  });

  describe('右側アクション', () => {
    it('rightプロップの内容が表示される', () => {
      render(<FloatingNav right={<button>追加</button>} />);
      expect(screen.getByText('追加')).toBeInTheDocument();
    });

    it('right未指定時に右側コンテナが表示されない', () => {
      const { container } = render(<FloatingNav backHref="/" />);
      // right未指定時は右側のdivが存在しない
      const rightContainer = container.querySelector('[class*="right-3"]');
      expect(rightContainer).not.toBeInTheDocument();
    });

    it('複数の要素をrightに渡した場合すべて表示される', () => {
      render(
        <FloatingNav
          right={
            <>
              <button>フィルター</button>
              <button>追加</button>
            </>
          }
        />
      );
      expect(screen.getByText('フィルター')).toBeInTheDocument();
      expect(screen.getByText('追加')).toBeInTheDocument();
    });

    it('右側コンテナにfixedクラスが適用される', () => {
      const { container } = render(<FloatingNav right={<button>追加</button>} />);
      const rightContainer = container.querySelector('[class*="right-3"]');
      expect(rightContainer).toBeInTheDocument();
      expect(rightContainer?.className).toContain('fixed');
    });
  });

  describe('レイアウト', () => {
    it('z-50クラスが戻るボタンに適用される', () => {
      render(<FloatingNav backHref="/" />);
      const link = screen.getByLabelText('戻る');
      expect(link.className).toContain('z-50');
    });

    it('z-50クラスが右側コンテナに適用される', () => {
      const { container } = render(<FloatingNav right={<button>追加</button>} />);
      const rightContainer = container.querySelector('[class*="right-3"]');
      expect(rightContainer?.className).toContain('z-50');
    });
  });

  describe('className', () => {
    it('追加のclassNameが右側コンテナに適用される', () => {
      const { container } = render(
        <FloatingNav right={<button>追加</button>} className="custom-class" />
      );
      const rightContainer = container.querySelector('[class*="right-3"]');
      expect(rightContainer?.className).toContain('custom-class');
    });
  });

  describe('組み合わせ', () => {
    it('backHref+rightの両方が指定された場合両方表示される', () => {
      const { container } = render(
        <FloatingNav backHref="/settings" right={<button>追加</button>} />
      );
      expect(screen.getByLabelText('戻る')).toBeInTheDocument();
      expect(screen.getByText('追加')).toBeInTheDocument();
      // 両方fixedが適用されている
      const link = screen.getByLabelText('戻る');
      const rightContainer = container.querySelector('[class*="right-3"]');
      expect(link.className).toContain('fixed');
      expect(rightContainer?.className).toContain('fixed');
    });

    it('backHrefなし+rightありの場合右側のみ表示される', () => {
      render(<FloatingNav right={<button>追加</button>} />);
      expect(screen.queryByLabelText('戻る')).not.toBeInTheDocument();
      expect(screen.getByText('追加')).toBeInTheDocument();
    });
  });
});

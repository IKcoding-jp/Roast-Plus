import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Card>コンテンツ</Card>);
      expect(screen.getByText('コンテンツ')).toBeInTheDocument();
    });

    it('children を正しく表示する', () => {
      render(
        <Card>
          <h3>タイトル</h3>
          <p>説明文</p>
        </Card>
      );
      expect(screen.getByText('タイトル')).toBeInTheDocument();
      expect(screen.getByText('説明文')).toBeInTheDocument();
    });

    it('onClick が呼ばれる', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>クリック</Card>);

      fireEvent.click(screen.getByText('クリック'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('バリアント（通常モード）', () => {
    it('defaultバリアントのスタイルが適用される', () => {
      const { container } = render(<Card variant="default">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white');
      expect(container.firstChild).toHaveClass('rounded-2xl');
      expect(container.firstChild).toHaveClass('shadow-md');
    });

    it('hoverableバリアントのスタイルが適用される', () => {
      const { container } = render(<Card variant="hoverable">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white');
      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('actionバリアントのスタイルが適用される', () => {
      const { container } = render(<Card variant="action">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white/95');
      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('coffeeバリアントのスタイルが適用される', () => {
      const { container } = render(<Card variant="coffee">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-[#211714]');
      expect(container.firstChild).toHaveClass('text-white');
    });

    it('tableバリアントのスタイルが適用される', () => {
      const { container } = render(<Card variant="table">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white');
      expect(container.firstChild).toHaveClass('rounded-xl');
    });

    it('guideバリアントのスタイルが適用される', () => {
      const { container } = render(<Card variant="guide">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white');
      expect(container.firstChild).toHaveClass('text-center');
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード + defaultバリアントのスタイルが適用される', () => {
      const { container } = render(<Card isChristmasMode variant="default">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white/5');
      expect(container.firstChild).toHaveClass('border-[#d4af37]/40');
    });

    it('クリスマスモード + hoverableバリアントのスタイルが適用される', () => {
      const { container } = render(<Card isChristmasMode variant="hoverable">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white/5');
      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('クリスマスモード + actionバリアントのスタイルが適用される', () => {
      const { container } = render(<Card isChristmasMode variant="action">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-white/5');
      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('クリスマスモード + coffeeバリアントのスタイルが適用される', () => {
      const { container } = render(<Card isChristmasMode variant="coffee">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-[#211714]');
      expect(container.firstChild).toHaveClass('border-[#d4af37]/20');
    });

    it('クリスマスモード + tableバリアントのスタイルが適用される', () => {
      const { container } = render(<Card isChristmasMode variant="table">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-[#0a2f1a]');
      expect(container.firstChild).toHaveClass('border-[#d4af37]/30');
    });

    it('クリスマスモード + guideバリアントのスタイルが適用される', () => {
      const { container } = render(<Card isChristmasMode variant="guide">テスト</Card>);
      expect(container.firstChild).toHaveClass('bg-[#0a2f1a]');
      expect(container.firstChild).toHaveClass('text-center');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      const { container } = render(<Card className="custom-class">テスト</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>テスト</Card>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('アクセシビリティ', () => {
    it('data-testidを設定できる', () => {
      render(<Card data-testid="test-card">テスト</Card>);
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });
});

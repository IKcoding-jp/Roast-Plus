import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<Badge>テスト</Badge>);
      expect(screen.getByText('テスト')).toBeInTheDocument();
    });

    it('childrenを正しく表示する', () => {
      render(<Badge>新着</Badge>);
      expect(screen.getByText('新着')).toBeInTheDocument();
    });
  });

  describe('バリアント（通常モード）', () => {
    it('defaultバリアントのスタイルが適用される', () => {
      render(<Badge variant="default">デフォルト</Badge>);
      const badge = screen.getByText('デフォルト');
      expect(badge.className).toContain('bg-gray-100');
      expect(badge.className).toContain('text-gray-700');
    });

    it('primaryバリアントのスタイルが適用される', () => {
      render(<Badge variant="primary">プライマリ</Badge>);
      const badge = screen.getByText('プライマリ');
      expect(badge.className).toContain('bg-amber-100');
      expect(badge.className).toContain('text-amber-800');
    });

    it('secondaryバリアントのスタイルが適用される', () => {
      render(<Badge variant="secondary">セカンダリ</Badge>);
      const badge = screen.getByText('セカンダリ');
      expect(badge.className).toContain('bg-gray-200');
    });

    it('successバリアントのスタイルが適用される', () => {
      render(<Badge variant="success">完了</Badge>);
      const badge = screen.getByText('完了');
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-800');
    });

    it('warningバリアントのスタイルが適用される', () => {
      render(<Badge variant="warning">注意</Badge>);
      const badge = screen.getByText('注意');
      expect(badge.className).toContain('bg-yellow-100');
    });

    it('dangerバリアントのスタイルが適用される', () => {
      render(<Badge variant="danger">エラー</Badge>);
      const badge = screen.getByText('エラー');
      expect(badge.className).toContain('bg-red-100');
      expect(badge.className).toContain('text-red-800');
    });

    it('coffeeバリアントのスタイルが適用される', () => {
      render(<Badge variant="coffee">コーヒー</Badge>);
      const badge = screen.getByText('コーヒー');
      expect(badge.className).toContain('bg-[#211714]');
      expect(badge.className).toContain('text-white');
    });
  });

  describe('サイズ', () => {
    it('smサイズのスタイルが適用される', () => {
      render(<Badge size="sm">小</Badge>);
      const badge = screen.getByText('小');
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('text-xs');
    });

    it('mdサイズのスタイルが適用される（デフォルト）', () => {
      render(<Badge size="md">中</Badge>);
      const badge = screen.getByText('中');
      expect(badge.className).toContain('px-2.5');
      expect(badge.className).toContain('text-sm');
    });

    it('lgサイズのスタイルが適用される', () => {
      render(<Badge size="lg">大</Badge>);
      const badge = screen.getByText('大');
      expect(badge.className).toContain('px-3');
      expect(badge.className).toContain('text-base');
    });
  });

  describe('クリスマスモード', () => {
    it('クリスマスモード + defaultバリアントのスタイルが適用される', () => {
      render(<Badge isChristmasMode variant="default">テスト</Badge>);
      const badge = screen.getByText('テスト');
      expect(badge.className).toContain('bg-white/10');
      expect(badge.className).toContain('text-[#f8f1e7]');
    });

    it('クリスマスモード + primaryバリアントのスタイルが適用される', () => {
      render(<Badge isChristmasMode variant="primary">テスト</Badge>);
      const badge = screen.getByText('テスト');
      expect(badge.className).toContain('bg-[#d4af37]/20');
      expect(badge.className).toContain('text-[#d4af37]');
    });

    it('クリスマスモード + coffeeバリアントのスタイルが適用される', () => {
      render(<Badge isChristmasMode variant="coffee">テスト</Badge>);
      const badge = screen.getByText('テスト');
      expect(badge.className).toContain('bg-[#211714]');
      expect(badge.className).toContain('border-[#d4af37]/30');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      render(<Badge className="custom-class">テスト</Badge>);
      expect(screen.getByText('テスト').className).toContain('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<Badge ref={ref}>テスト</Badge>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('共通スタイル', () => {
    it('rounded-fullクラスが適用される', () => {
      render(<Badge>テスト</Badge>);
      expect(screen.getByText('テスト').className).toContain('rounded-full');
    });

    it('inline-flexクラスが適用される', () => {
      render(<Badge>テスト</Badge>);
      expect(screen.getByText('テスト').className).toContain('inline-flex');
    });
  });
});

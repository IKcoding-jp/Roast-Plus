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
      expect(badge.className).toContain('bg-ground');
      expect(badge.className).toContain('text-ink');
    });

    it('primaryバリアントのスタイルが適用される', () => {
      render(<Badge variant="primary">プライマリ</Badge>);
      const badge = screen.getByText('プライマリ');
      expect(badge.className).toContain('bg-spot-subtle');
      expect(badge.className).toContain('text-spot');
    });

    it('secondaryバリアントのスタイルが適用される', () => {
      render(<Badge variant="secondary">セカンダリ</Badge>);
      const badge = screen.getByText('セカンダリ');
      expect(badge.className).toContain('bg-ground');
    });

    it('successバリアントのスタイルが適用される', () => {
      render(<Badge variant="success">完了</Badge>);
      const badge = screen.getByText('完了');
      expect(badge.className).toContain('bg-success-subtle');
      expect(badge.className).toContain('text-success');
    });

    it('warningバリアントのスタイルが適用される', () => {
      render(<Badge variant="warning">注意</Badge>);
      const badge = screen.getByText('注意');
      expect(badge.className).toContain('bg-warning-subtle');
    });

    it('dangerバリアントのスタイルが適用される', () => {
      render(<Badge variant="danger">エラー</Badge>);
      const badge = screen.getByText('エラー');
      expect(badge.className).toContain('bg-danger-subtle');
      expect(badge.className).toContain('text-danger');
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

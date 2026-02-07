import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('valueが反映される', () => {
      render(<ProgressBar value={75} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('maxが反映される', () => {
      render(<ProgressBar value={50} max={200} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '200');
    });

    it('aria-valueminが0に設定される', () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    });
  });

  describe('値の制限', () => {
    it('valueが100を超えても100%に制限される', () => {
      const { container } = render(<ProgressBar value={150} />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveStyle('width: 100%');
    });

    it('valueが0未満でも0%に制限される', () => {
      const { container } = render(<ProgressBar value={-10} />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveStyle('width: 0%');
    });

    it('カスタムmaxで正しいパーセンテージが計算される', () => {
      const { container } = render(<ProgressBar value={50} max={200} />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveStyle('width: 25%');
    });
  });

  describe('ラベルと値表示', () => {
    it('labelが表示される', () => {
      render(<ProgressBar value={50} label="進捗" />);
      expect(screen.getByText('進捗')).toBeInTheDocument();
    });

    it('showValue=trueでパーセンテージが表示される', () => {
      render(<ProgressBar value={75} showValue />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('labelとshowValueを両方表示できる', () => {
      render(<ProgressBar value={50} label="完了率" showValue />);
      expect(screen.getByText('完了率')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('showValue=falseではパーセンテージが表示されない', () => {
      render(<ProgressBar value={75} showValue={false} />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });
  });

  describe('バリアント（通常モード）', () => {
    it('defaultバリアントのスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} variant="default" />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('bg-ink-muted');
    });

    it('primaryバリアントのスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} variant="primary" />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('bg-spot');
    });

    it('successバリアントのスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} variant="success" />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('bg-green-500');
    });

    it('warningバリアントのスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} variant="warning" />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('bg-yellow-500');
    });

    it('dangerバリアントのスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} variant="danger" />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('bg-red-500');
    });

    it('coffeeバリアントのスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} variant="coffee" />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('bg-[#211714]');
    });
  });

  describe('サイズ', () => {
    it('smサイズのスタイルが適用される', () => {
      render(<ProgressBar value={50} size="sm" />);
      expect(screen.getByRole('progressbar')).toHaveClass('h-1.5');
    });

    it('mdサイズのスタイルが適用される（デフォルト）', () => {
      render(<ProgressBar value={50} size="md" />);
      expect(screen.getByRole('progressbar')).toHaveClass('h-2.5');
    });

    it('lgサイズのスタイルが適用される', () => {
      render(<ProgressBar value={50} size="lg" />);
      expect(screen.getByRole('progressbar')).toHaveClass('h-4');
    });
  });

  describe('アニメーション', () => {
    it('animated=trueでトランジションスタイルが適用される', () => {
      const { container } = render(<ProgressBar value={50} animated />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).toHaveClass('transition-all');
    });

    it('animated=falseでトランジションスタイルが適用されない', () => {
      const { container } = render(<ProgressBar value={50} animated={false} />);
      const bar = container.querySelector('[style*="width"]');
      expect(bar).not.toHaveClass('transition-all');
    });
  });

  describe('カスタムクラス', () => {
    it('classNameで追加のスタイルを指定できる', () => {
      const { container } = render(<ProgressBar value={50} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn();
      render(<ProgressBar value={50} ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
  });
});

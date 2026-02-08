import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Snowfall } from './Snowfall';

describe('Snowfall', () => {
  it('コンテナ要素がレンダリングされること', () => {
    const { container } = render(<Snowfall />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('fixed');
  });

  it('雪片が25個生成されること', () => {
    const { container } = render(<Snowfall />);
    const snowflakes = container.querySelectorAll('.snowflake');
    expect(snowflakes).toHaveLength(25);
  });

  it('雪片がSVG要素を含まないこと（CSS-onlyの円形）', () => {
    const { container } = render(<Snowfall />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(0);
  });

  it('filterプロパティにblurやdrop-shadowが使われていないこと', () => {
    const { container } = render(<Snowfall />);
    const snowflakes = container.querySelectorAll('.snowflake');
    snowflakes.forEach((flake) => {
      const style = (flake as HTMLElement).style;
      expect(style.filter).toBeFalsy();
    });
  });

  it('memoでラップされていること', () => {
    // React.memoのSymbol確認
    expect(Snowfall).toHaveProperty('$$typeof');
    // memoされたコンポーネントはtype.nameを持つ
    const memoized = Snowfall as unknown as { type: { name: string } };
    expect(memoized.type).toBeDefined();
    expect(typeof memoized.type.name).toBe('string');
  });

  it('雪片がborderRadiusで円形にスタイルされていること', () => {
    const { container } = render(<Snowfall />);
    const snowflakes = container.querySelectorAll('.snowflake');
    snowflakes.forEach((flake) => {
      const style = (flake as HTMLElement).style;
      expect(style.borderRadius).toBe('50%');
    });
  });

  it('pointer-events-noneが設定されていること', () => {
    const { container } = render(<Snowfall />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('pointer-events-none');
  });
});

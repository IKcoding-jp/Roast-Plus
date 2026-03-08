import { describe, expect, it } from 'vitest';
import { splashPatterns } from './patterns';

describe('splashPatterns', () => {
  it('5つのパターンが定義されていること', () => {
    expect(splashPatterns).toHaveLength(5);
  });

  it('各パターンがid, name, description, Componentを持つこと', () => {
    splashPatterns.forEach((pattern) => {
      expect(pattern).toHaveProperty('id');
      expect(pattern).toHaveProperty('name');
      expect(pattern).toHaveProperty('description');
      expect(pattern).toHaveProperty('Component');
    });
  });

  it('パターンIDが1から5であること', () => {
    const ids = splashPatterns.map((p) => p.id);
    expect(ids).toEqual([1, 2, 3, 4, 5]);
  });

  it('Componentが関数であること', () => {
    splashPatterns.forEach((pattern) => {
      expect(typeof pattern.Component).toBe('function');
    });
  });

  it('パターン名が正しいこと', () => {
    const names = splashPatterns.map((p) => p.name);
    expect(names).toEqual(['Fade Up', 'Scale Breathe', 'Letter Stagger', 'Slide Reveal', 'Glow Pulse']);
  });
});

import { describe, it, expect } from 'vitest';
import { convertToHalfWidth, removeNonNumeric } from './utils';

describe('convertToHalfWidth', () => {
  it('全角数字 → 半角数字', () => {
    expect(convertToHalfWidth('１２３')).toBe('123');
  });

  it('混在文字列', () => {
    expect(convertToHalfWidth('abc１２３def')).toBe('abc123def');
  });

  it('半角のみ → 変化なし', () => {
    expect(convertToHalfWidth('123abc')).toBe('123abc');
  });

  it('全角0〜9すべて変換', () => {
    expect(convertToHalfWidth('０１２３４５６７８９')).toBe('0123456789');
  });

  it('空文字 → 空文字', () => {
    expect(convertToHalfWidth('')).toBe('');
  });

  it('全角アルファベットは変換しない', () => {
    expect(convertToHalfWidth('ＡＢＣ')).toBe('ＡＢＣ');
  });
});

describe('removeNonNumeric', () => {
  it('"abc123" → "123"', () => {
    expect(removeNonNumeric('abc123')).toBe('123');
  });

  it('全角数字は残らない', () => {
    expect(removeNonNumeric('１２３')).toBe('');
  });

  it('半角数字のみ → 変化なし', () => {
    expect(removeNonNumeric('456')).toBe('456');
  });

  it('混在文字列', () => {
    expect(removeNonNumeric('a1b2c3')).toBe('123');
  });

  it('空文字 → 空文字', () => {
    expect(removeNonNumeric('')).toBe('');
  });

  it('数字なし → 空文字', () => {
    expect(removeNonNumeric('abcdef')).toBe('');
  });
});

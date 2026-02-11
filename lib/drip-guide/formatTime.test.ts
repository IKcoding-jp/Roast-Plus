import { describe, it, expect } from 'vitest';
import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('0秒 → "00:00"', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('5秒 → "00:05"', () => {
    expect(formatTime(5)).toBe('00:05');
  });

  it('59秒 → "00:59"', () => {
    expect(formatTime(59)).toBe('00:59');
  });

  it('60秒 → "01:00"', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('65秒 → "01:05"', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('120秒 → "02:00"', () => {
    expect(formatTime(120)).toBe('02:00');
  });

  it('3600秒 → "60:00"', () => {
    expect(formatTime(3600)).toBe('60:00');
  });
});

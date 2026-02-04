import { describe, it, expect, vi } from 'vitest';
import { formatDateString } from './dateUtils';

describe('formatDateString', () => {
  it('Dateオブジェクトを YYYY-MM-DD 形式に変換する', () => {
    const date = new Date('2024-12-25T15:30:00Z');
    expect(formatDateString(date)).toBe('2024-12-25');
  });

  it('日付の時刻部分は無視される', () => {
    const morning = new Date('2024-01-15T09:00:00Z');
    const evening = new Date('2024-01-15T21:00:00Z');

    expect(formatDateString(morning)).toBe('2024-01-15');
    expect(formatDateString(evening)).toBe('2024-01-15');
  });

  it('引数なしの場合は現在日時を使用する', () => {
    // 現在日時をモック
    const mockDate = new Date('2024-06-15T12:00:00Z');
    vi.setSystemTime(mockDate);

    expect(formatDateString()).toBe('2024-06-15');

    // モックをクリア
    vi.useRealTimers();
  });

  it('閏年の日付を正しく処理する', () => {
    const leapDay = new Date('2024-02-29T00:00:00Z');
    expect(formatDateString(leapDay)).toBe('2024-02-29');
  });

  it('年末年始の日付を正しく処理する', () => {
    const newYear = new Date('2024-01-01T00:00:00Z');
    const newYearEve = new Date('2024-12-31T23:59:59Z');

    expect(formatDateString(newYear)).toBe('2024-01-01');
    expect(formatDateString(newYearEve)).toBe('2024-12-31');
  });
});

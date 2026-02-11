import { describe, it, expect } from 'vitest';
import {
  calculateAverageScores,
  getRecordsBySessionId,
  getRecordCountBySessionId,
} from './tastingUtils';
import type { TastingRecord } from '@/types';

function createRecord(overrides: Partial<TastingRecord> = {}): TastingRecord {
  return {
    id: 'rec-1',
    sessionId: 'session-1',
    beanName: 'エチオピア',
    tastingDate: '2026-02-11',
    roastLevel: '中煎り',
    bitterness: 3,
    acidity: 3,
    body: 3,
    sweetness: 3,
    aroma: 3,
    overallRating: 3,
    createdAt: '2026-02-11T00:00:00Z',
    updatedAt: '2026-02-11T00:00:00Z',
    userId: 'user-1',
    ...overrides,
  };
}

describe('calculateAverageScores', () => {
  it('空配列 → 全0', () => {
    const result = calculateAverageScores([]);
    expect(result).toEqual({
      bitterness: 0,
      acidity: 0,
      body: 0,
      sweetness: 0,
      aroma: 0,
      overallRating: 0,
    });
  });

  it('1件 → そのまま', () => {
    const records = [
      createRecord({ bitterness: 4, acidity: 2, body: 5, sweetness: 3, aroma: 4, overallRating: 4 }),
    ];
    const result = calculateAverageScores(records);
    expect(result.bitterness).toBe(4);
    expect(result.acidity).toBe(2);
    expect(result.body).toBe(5);
    expect(result.sweetness).toBe(3);
    expect(result.aroma).toBe(4);
    expect(result.overallRating).toBe(4);
  });

  it('複数件 → 平均', () => {
    const records = [
      createRecord({ id: 'r1', bitterness: 2, acidity: 4, body: 3, sweetness: 5, aroma: 1, overallRating: 3 }),
      createRecord({ id: 'r2', bitterness: 4, acidity: 2, body: 5, sweetness: 1, aroma: 3, overallRating: 5 }),
    ];
    const result = calculateAverageScores(records);
    expect(result.bitterness).toBe(3);
    expect(result.acidity).toBe(3);
    expect(result.body).toBe(4);
    expect(result.sweetness).toBe(3);
    expect(result.aroma).toBe(2);
    expect(result.overallRating).toBe(4);
  });
});

describe('getRecordsBySessionId', () => {
  it('指定セッションのレコード抽出', () => {
    const records = [
      createRecord({ id: 'r1', sessionId: 'session-1' }),
      createRecord({ id: 'r2', sessionId: 'session-2' }),
      createRecord({ id: 'r3', sessionId: 'session-1' }),
    ];
    const result = getRecordsBySessionId(records, 'session-1');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('r1');
    expect(result[1].id).toBe('r3');
  });

  it('該当なし → 空配列', () => {
    const records = [createRecord({ sessionId: 'session-1' })];
    expect(getRecordsBySessionId(records, 'session-999')).toHaveLength(0);
  });

  it('空配列 → 空配列', () => {
    expect(getRecordsBySessionId([], 'session-1')).toHaveLength(0);
  });
});

describe('getRecordCountBySessionId', () => {
  it('レコード数カウント', () => {
    const records = [
      createRecord({ id: 'r1', sessionId: 'session-1' }),
      createRecord({ id: 'r2', sessionId: 'session-2' }),
      createRecord({ id: 'r3', sessionId: 'session-1' }),
    ];
    expect(getRecordCountBySessionId(records, 'session-1')).toBe(2);
    expect(getRecordCountBySessionId(records, 'session-2')).toBe(1);
  });

  it('該当なし → 0', () => {
    expect(getRecordCountBySessionId([], 'session-1')).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import {
  extractTargetAmount,
  extractUnitFromWeight,
  findWorkProgressOrThrow,
  resolveStatusTransition,
  recalculateFromHistory,
} from './helpers';
import type { AppData, WorkProgress, ProgressEntry } from '@/types';

describe('extractTargetAmount', () => {
  it('"10kg" → 10', () => {
    expect(extractTargetAmount('10kg')).toBe(10);
  });

  it('"5個" → 5', () => {
    expect(extractTargetAmount('5個')).toBe(5);
  });

  it('"10.5kg" → 10.5', () => {
    expect(extractTargetAmount('10.5kg')).toBe(10.5);
  });

  it('"3枚" → 3', () => {
    expect(extractTargetAmount('3枚')).toBe(3);
  });

  it('"100" → 100（単位なし）', () => {
    expect(extractTargetAmount('100')).toBe(100);
  });

  it('undefined → undefined', () => {
    expect(extractTargetAmount(undefined)).toBeUndefined();
  });

  it('空文字 → undefined', () => {
    expect(extractTargetAmount('')).toBeUndefined();
  });

  it('不正値 "abc" → undefined', () => {
    expect(extractTargetAmount('abc')).toBeUndefined();
  });
});

describe('extractUnitFromWeight', () => {
  it('"10kg" → 数値部分の "10"', () => {
    // 実装を見ると match[1] を返す（数値部分）
    expect(extractUnitFromWeight('10kg')).toBe('10');
  });

  it('undefined → ""', () => {
    expect(extractUnitFromWeight(undefined)).toBe('');
  });

  it('空文字 → ""', () => {
    expect(extractUnitFromWeight('')).toBe('');
  });
});

describe('findWorkProgressOrThrow', () => {
  const createWorkProgress = (id: string): WorkProgress => ({
    id,
    status: 'pending',
    createdAt: '2026-02-11T00:00:00Z',
    updatedAt: '2026-02-11T00:00:00Z',
  });

  it('存在するIDを検索 → 正常に返す', () => {
    const appData = {
      workProgresses: [createWorkProgress('wp-1'), createWorkProgress('wp-2')],
    } as AppData;
    const result = findWorkProgressOrThrow(appData, 'wp-1');
    expect(result.existing.id).toBe('wp-1');
    expect(result.existingIndex).toBe(0);
    expect(result.workProgresses).toHaveLength(2);
  });

  it('存在しないID → Errorスロー', () => {
    const appData = {
      workProgresses: [createWorkProgress('wp-1')],
    } as AppData;
    expect(() => findWorkProgressOrThrow(appData, 'wp-999')).toThrow(
      'WorkProgress with id wp-999 not found'
    );
  });

  it('workProgressesがundefined → Errorスロー', () => {
    const appData = {} as AppData;
    expect(() => findWorkProgressOrThrow(appData, 'wp-1')).toThrow();
  });
});

describe('resolveStatusTransition', () => {
  const now = '2026-02-11T10:00:00Z';

  it('pending → in_progress: startedAtをセット', () => {
    const result = resolveStatusTransition('pending', 'in_progress', undefined, undefined, now);
    expect(result.startedAt).toBe(now);
    expect(result.completedAt).toBeUndefined();
  });

  it('pending → completed: startedAtとcompletedAtをセット', () => {
    const result = resolveStatusTransition('pending', 'completed', undefined, undefined, now);
    expect(result.startedAt).toBe(now);
    expect(result.completedAt).toBe(now);
  });

  it('in_progress → completed: completedAtをセット（startedAt保持）', () => {
    const started = '2026-02-10T10:00:00Z';
    const result = resolveStatusTransition('in_progress', 'completed', started, undefined, now);
    expect(result.startedAt).toBe(started);
    expect(result.completedAt).toBe(now);
  });

  it('in_progress → completed: startedAtがない場合はnowをセット', () => {
    const result = resolveStatusTransition('in_progress', 'completed', undefined, undefined, now);
    expect(result.startedAt).toBe(now);
    expect(result.completedAt).toBe(now);
  });

  it('completed → in_progress: completedAtクリア', () => {
    const started = '2026-02-10T10:00:00Z';
    const completed = '2026-02-11T09:00:00Z';
    const result = resolveStatusTransition('completed', 'in_progress', started, completed, now);
    expect(result.startedAt).toBe(started);
    expect(result.completedAt).toBeUndefined();
  });

  it('completed → pending: 両方クリア', () => {
    const started = '2026-02-10T10:00:00Z';
    const completed = '2026-02-11T09:00:00Z';
    const result = resolveStatusTransition('completed', 'pending', started, completed, now);
    expect(result.startedAt).toBeUndefined();
    expect(result.completedAt).toBeUndefined();
  });

  it('in_progress → pending: startedAtクリア', () => {
    const started = '2026-02-10T10:00:00Z';
    const result = resolveStatusTransition('in_progress', 'pending', started, undefined, now);
    expect(result.startedAt).toBeUndefined();
    expect(result.completedAt).toBeUndefined();
  });

  it('同一ステータス → 変更なし', () => {
    const started = '2026-02-10T10:00:00Z';
    const result = resolveStatusTransition('in_progress', 'in_progress', started, undefined, now);
    expect(result.startedAt).toBe(started);
    expect(result.completedAt).toBeUndefined();
  });
});

describe('recalculateFromHistory', () => {
  const now = '2026-02-11T10:00:00Z';

  const createEntry = (amount: number, id?: string): ProgressEntry => ({
    id: id || 'entry-1',
    date: '2026-02-11',
    amount,
  });

  describe('進捗量モード（targetAmountあり）', () => {
    const baseProgress: WorkProgress = {
      id: 'wp-1',
      status: 'pending',
      targetAmount: 10,
      createdAt: '2026-02-11T00:00:00Z',
      updatedAt: '2026-02-11T00:00:00Z',
    };

    it('進捗0 → pending', () => {
      const result = recalculateFromHistory(baseProgress, [], now);
      expect(result.currentAmount).toBe(0);
      expect(result.status).toBe('pending');
    });

    it('進捗あり → in_progress', () => {
      const result = recalculateFromHistory(baseProgress, [createEntry(5)], now);
      expect(result.currentAmount).toBe(5);
      expect(result.status).toBe('in_progress');
      expect(result.startedAt).toBe(now);
    });

    it('目標達成 → completed', () => {
      const result = recalculateFromHistory(baseProgress, [createEntry(10)], now);
      expect(result.currentAmount).toBe(10);
      expect(result.status).toBe('completed');
      expect(result.completedAt).toBe(now);
    });

    it('目標超過 → completed', () => {
      const result = recalculateFromHistory(
        baseProgress,
        [createEntry(5, 'e1'), createEntry(8, 'e2')],
        now
      );
      expect(result.currentAmount).toBe(13);
      expect(result.status).toBe('completed');
    });

    it('進捗量が負にならない（最小0）', () => {
      const result = recalculateFromHistory(baseProgress, [createEntry(-5)], now);
      expect(result.currentAmount).toBe(0);
    });

    it('completedからtarget未満に減少 → in_progress', () => {
      const completedProgress: WorkProgress = {
        ...baseProgress,
        status: 'completed',
        startedAt: '2026-02-10T00:00:00Z',
        completedAt: '2026-02-10T12:00:00Z',
      };
      const result = recalculateFromHistory(completedProgress, [createEntry(5)], now);
      expect(result.currentAmount).toBe(5);
      expect(result.status).toBe('in_progress');
      expect(result.completedAt).toBeUndefined();
    });
  });

  describe('完成数モード（targetAmountなし）', () => {
    const baseProgress: WorkProgress = {
      id: 'wp-1',
      status: 'pending',
      createdAt: '2026-02-11T00:00:00Z',
      updatedAt: '2026-02-11T00:00:00Z',
    };

    it('完成数0 → pending', () => {
      const result = recalculateFromHistory(baseProgress, [], now);
      expect(result.completedCount).toBe(0);
      expect(result.status).toBe('pending');
    });

    it('完成数あり → in_progress', () => {
      const result = recalculateFromHistory(baseProgress, [createEntry(3)], now);
      expect(result.completedCount).toBe(3);
      expect(result.status).toBe('in_progress');
      expect(result.startedAt).toBe(now);
    });

    it('完成数が負にならない（最小0）', () => {
      const result = recalculateFromHistory(baseProgress, [createEntry(-5)], now);
      expect(result.completedCount).toBe(0);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { MAX_TEAMS, MAX_TASK_LABELS, MAX_MEMBERS } from './constants';

describe('assignment constants', () => {
  it('MAX_TEAMS は 4', () => {
    expect(MAX_TEAMS).toBe(4);
  });

  it('MAX_TASK_LABELS は 8', () => {
    expect(MAX_TASK_LABELS).toBe(8);
  });

  it('MAX_MEMBERS は 15', () => {
    expect(MAX_MEMBERS).toBe(15);
  });

  it('すべての定数が正の整数', () => {
    for (const val of [MAX_TEAMS, MAX_TASK_LABELS, MAX_MEMBERS]) {
      expect(val).toBeGreaterThan(0);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});

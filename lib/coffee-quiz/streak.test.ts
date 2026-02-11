import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTodayDateString,
  getDaysDifference,
  updateStreak,
  isStreakAtRisk,
  createInitialStreakInfo,
} from './streak';
import type { StreakInfo } from './types';

vi.mock('./debug', () => ({
  isDebugMode: () => false,
  getDebugTodayDateString: () => '2026-01-01',
}));

describe('getTodayDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('YYYY-MM-DD形式で返す', () => {
    vi.setSystemTime(new Date('2026-02-11T10:30:00Z'));
    expect(getTodayDateString()).toBe('2026-02-11');
  });

  it('日付が変わった場合', () => {
    vi.setSystemTime(new Date('2026-12-31T23:59:59Z'));
    expect(getTodayDateString()).toBe('2026-12-31');
  });

  it('年始', () => {
    vi.setSystemTime(new Date('2027-01-01T00:00:00Z'));
    expect(getTodayDateString()).toBe('2027-01-01');
  });
});

describe('getDaysDifference', () => {
  it('同日 → 0', () => {
    expect(getDaysDifference('2026-02-11', '2026-02-11')).toBe(0);
  });

  it('1日差 → 1', () => {
    expect(getDaysDifference('2026-02-10', '2026-02-11')).toBe(1);
  });

  it('逆順でも絶対値 → 1', () => {
    expect(getDaysDifference('2026-02-11', '2026-02-10')).toBe(1);
  });

  it('複数日差 → 5', () => {
    expect(getDaysDifference('2026-02-06', '2026-02-11')).toBe(5);
  });

  it('月跨ぎ', () => {
    expect(getDaysDifference('2026-01-31', '2026-02-01')).toBe(1);
  });
});

describe('updateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-11T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初回（lastActiveDateなし）→ streak 1', () => {
    const streak: StreakInfo = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
    };
    const result = updateStreak(streak);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastActiveDate).toBe('2026-02-11');
    expect(result.streakStartDate).toBe('2026-02-11');
  });

  it('同日 → 変更なし', () => {
    const streak: StreakInfo = {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2026-02-11',
      streakStartDate: '2026-02-08',
    };
    const result = updateStreak(streak);
    expect(result).toBe(streak); // 同一オブジェクト
  });

  it('連続（昨日活動）→ +1', () => {
    const streak: StreakInfo = {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2026-02-10',
      streakStartDate: '2026-02-08',
    };
    const result = updateStreak(streak);
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(5);
    expect(result.lastActiveDate).toBe('2026-02-11');
    expect(result.streakStartDate).toBe('2026-02-08');
  });

  it('連続で最長記録更新', () => {
    const streak: StreakInfo = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-02-10',
      streakStartDate: '2026-02-06',
    };
    const result = updateStreak(streak);
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('2日以上空き → リセット', () => {
    const streak: StreakInfo = {
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: '2026-02-09',
      streakStartDate: '2026-01-31',
    };
    const result = updateStreak(streak);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10); // 最長記録は保持
    expect(result.lastActiveDate).toBe('2026-02-11');
    expect(result.streakStartDate).toBe('2026-02-11');
  });
});

describe('isStreakAtRisk', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-11T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('未活動（lastActiveDateなし）→ false', () => {
    const streak: StreakInfo = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
    };
    expect(isStreakAtRisk(streak)).toBe(false);
  });

  it('今日活動済み → false', () => {
    const streak: StreakInfo = {
      currentStreak: 3,
      longestStreak: 3,
      lastActiveDate: '2026-02-11',
    };
    expect(isStreakAtRisk(streak)).toBe(false);
  });

  it('昨日のみ活動 → true（今日やらないと切れる）', () => {
    const streak: StreakInfo = {
      currentStreak: 3,
      longestStreak: 3,
      lastActiveDate: '2026-02-10',
    };
    expect(isStreakAtRisk(streak)).toBe(true);
  });

  it('2日前が最後 → false（既に切れている）', () => {
    const streak: StreakInfo = {
      currentStreak: 3,
      longestStreak: 3,
      lastActiveDate: '2026-02-09',
    };
    expect(isStreakAtRisk(streak)).toBe(false);
  });
});

describe('createInitialStreakInfo', () => {
  it('初期値の確認', () => {
    const info = createInitialStreakInfo();
    expect(info.currentStreak).toBe(0);
    expect(info.longestStreak).toBe(0);
    expect(info.lastActiveDate).toBe('');
  });

  it('返り値は新しいオブジェクト', () => {
    const info1 = createInitialStreakInfo();
    const info2 = createInitialStreakInfo();
    expect(info1).not.toBe(info2);
    expect(info1).toEqual(info2);
  });
});

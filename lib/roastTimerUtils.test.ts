import { describe, it, expect } from 'vitest';
import {
  calculateRecommendedTime,
  formatTime,
  formatTimeAsMinutes,
  formatTimeAsMinutesAndSeconds,
} from './roastTimerUtils';
import type { RoastTimerRecord, RoastTimerSettings } from '@/types';

const defaultSettings: RoastTimerSettings = {
  goToRoastRoomTimeSeconds: 60,
  timerSoundEnabled: true,
  timerSoundFile: '/sounds/roasttimer/alarm.mp3',
  timerSoundVolume: 0.5,
  notificationSoundEnabled: true,
  notificationSoundFile: '/sounds/roasttimer/alarm.mp3',
  notificationSoundVolume: 0.5,
};

function createRecord(overrides: Partial<RoastTimerRecord> = {}): RoastTimerRecord {
  return {
    id: 'rec-1',
    beanName: 'エチオピア',
    weight: 200,
    roastLevel: '中煎り',
    duration: 600,
    roastDate: '2026-02-11',
    createdAt: '2026-02-11T00:00:00Z',
    userId: 'user-1',
    ...overrides,
  };
}

describe('calculateRecommendedTime', () => {
  it('一致レコード2件以上 → 平均計算', () => {
    const records = [
      createRecord({ id: 'r1', duration: 600 }),
      createRecord({ id: 'r2', duration: 800 }),
    ];
    const result = calculateRecommendedTime(records, 'エチオピア', 200, '中煎り', defaultSettings);
    expect(result).not.toBeNull();
    expect(result!.averageDuration).toBe(700); // (600 + 800) / 2
    expect(result!.recommendedDuration).toBe(640); // 700 - 60
  });

  it('一致レコード1件 → null', () => {
    const records = [createRecord({ id: 'r1', duration: 600 })];
    const result = calculateRecommendedTime(records, 'エチオピア', 200, '中煎り', defaultSettings);
    expect(result).toBeNull();
  });

  it('一致レコード0件 → null', () => {
    const result = calculateRecommendedTime([], 'エチオピア', 200, '中煎り', defaultSettings);
    expect(result).toBeNull();
  });

  it('条件不一致のレコードはフィルタリング', () => {
    const records = [
      createRecord({ id: 'r1', beanName: 'ブラジル', duration: 600 }),
      createRecord({ id: 'r2', beanName: 'エチオピア', duration: 700 }),
      createRecord({ id: 'r3', beanName: 'エチオピア', weight: 300, duration: 800 }),
    ];
    const result = calculateRecommendedTime(records, 'エチオピア', 200, '中煎り', defaultSettings);
    expect(result).toBeNull(); // 一致は1件のみ
  });

  it('計算結果が60秒未満 → 60秒に調整', () => {
    const records = [
      createRecord({ id: 'r1', duration: 100 }),
      createRecord({ id: 'r2', duration: 100 }),
    ];
    const result = calculateRecommendedTime(records, 'エチオピア', 200, '中煎り', defaultSettings);
    expect(result).not.toBeNull();
    expect(result!.averageDuration).toBe(100);
    expect(result!.recommendedDuration).toBe(60); // 100 - 60 = 40 < 60 → 60
  });

  it('goToRoastRoomTimeSecondsが異なる場合', () => {
    const records = [
      createRecord({ id: 'r1', duration: 600 }),
      createRecord({ id: 'r2', duration: 800 }),
    ];
    const settings = { ...defaultSettings, goToRoastRoomTimeSeconds: 120 };
    const result = calculateRecommendedTime(records, 'エチオピア', 200, '中煎り', settings);
    expect(result!.recommendedDuration).toBe(580); // 700 - 120
  });
});

describe('formatTime', () => {
  it('0秒 → "00:00"', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('65秒 → "01:05"', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('3600秒 → "60:00"', () => {
    expect(formatTime(3600)).toBe('60:00');
  });

  it('59秒 → "00:59"', () => {
    expect(formatTime(59)).toBe('00:59');
  });

  it('小数点は切り捨て', () => {
    expect(formatTime(65.9)).toBe('01:05');
  });
});

describe('formatTimeAsMinutes', () => {
  it('60秒 → "1分"', () => {
    expect(formatTimeAsMinutes(60)).toBe('1分');
  });

  it('90秒 → "2分"（四捨五入）', () => {
    expect(formatTimeAsMinutes(90)).toBe('2分');
  });

  it('0秒 → "0分"', () => {
    expect(formatTimeAsMinutes(0)).toBe('0分');
  });

  it('30秒 → "1分"（四捨五入）', () => {
    expect(formatTimeAsMinutes(30)).toBe('1分');
  });

  it('300秒 → "5分"', () => {
    expect(formatTimeAsMinutes(300)).toBe('5分');
  });
});

describe('formatTimeAsMinutesAndSeconds', () => {
  it('0秒 → "0秒"', () => {
    expect(formatTimeAsMinutesAndSeconds(0)).toBe('0秒');
  });

  it('30秒 → "30秒"', () => {
    expect(formatTimeAsMinutesAndSeconds(30)).toBe('30秒');
  });

  it('60秒 → "1分"', () => {
    expect(formatTimeAsMinutesAndSeconds(60)).toBe('1分');
  });

  it('90秒 → "1分30秒"', () => {
    expect(formatTimeAsMinutesAndSeconds(90)).toBe('1分30秒');
  });

  it('125秒 → "2分5秒"', () => {
    expect(formatTimeAsMinutesAndSeconds(125)).toBe('2分5秒');
  });

  it('小数点は切り捨て', () => {
    expect(formatTimeAsMinutesAndSeconds(90.9)).toBe('1分30秒');
  });
});

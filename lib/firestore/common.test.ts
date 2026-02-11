import { describe, it, expect } from 'vitest';
import { removeUndefinedFields, normalizeAppData } from './common';

vi.mock('../firebase', () => ({
  default: {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  doc: () => ({}),
}));

describe('removeUndefinedFields', () => {
  it('undefinedフィールドを削除', () => {
    const input = { a: 1, b: undefined, c: 'hello' };
    const result = removeUndefinedFields(input);
    expect(result).toEqual({ a: 1, c: 'hello' });
    expect('b' in result).toBe(false);
  });

  it('ネストされたオブジェクト', () => {
    const input = { a: { b: 1, c: undefined }, d: 2 };
    const result = removeUndefinedFields(input);
    expect(result).toEqual({ a: { b: 1 }, d: 2 });
  });

  it('配列内のundefined', () => {
    const input = { a: [1, undefined, 3] };
    const result = removeUndefinedFields(input);
    expect(result).toEqual({ a: [1, undefined, 3] }); // 配列内のundefinedは保持
  });

  it('nullは保持', () => {
    const input = { a: null, b: 1 };
    const result = removeUndefinedFields(input);
    expect(result).toEqual({ a: null, b: 1 });
  });

  it('null入力 → null返却', () => {
    expect(removeUndefinedFields(null)).toBeNull();
  });

  it('undefined入力 → undefined返却', () => {
    expect(removeUndefinedFields(undefined)).toBeUndefined();
  });

  it('プリミティブ → そのまま', () => {
    expect(removeUndefinedFields(42)).toBe(42);
    expect(removeUndefinedFields('hello')).toBe('hello');
  });

  it('空のネストオブジェクトは削除', () => {
    const input = { a: { b: undefined } };
    const result = removeUndefinedFields(input);
    expect(result).toEqual({}); // { a: {} } → aは空オブジェクトなので削除
  });
});

describe('normalizeAppData', () => {
  it('null → defaultData', () => {
    const result = normalizeAppData(null);
    expect(result.todaySchedules).toEqual([]);
    expect(result.roastSchedules).toEqual([]);
    expect(result.tastingSessions).toEqual([]);
    expect(result.tastingRecords).toEqual([]);
    expect(result.notifications).toEqual([]);
    expect(result.encouragementCount).toBe(0);
    expect(result.roastTimerRecords).toEqual([]);
    expect(result.workProgresses).toEqual([]);
  });

  it('undefined → defaultData', () => {
    const result = normalizeAppData(undefined);
    expect(result.todaySchedules).toEqual([]);
  });

  it('部分的データ → 補完', () => {
    const result = normalizeAppData({
      todaySchedules: [{ id: '1', beanName: 'test' }],
    } as never);
    expect(result.todaySchedules).toHaveLength(1);
    expect(result.roastSchedules).toEqual([]);
    expect(result.encouragementCount).toBe(0);
  });

  it('roastScheduleのdate補完', () => {
    const result = normalizeAppData({
      roastSchedules: [{ id: '1', beanName: 'test' }],
    } as never);
    expect(result.roastSchedules[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('roastScheduleのdate既存値は保持', () => {
    const result = normalizeAppData({
      roastSchedules: [{ id: '1', beanName: 'test', date: '2026-01-01' }],
    } as never);
    expect(result.roastSchedules[0].date).toBe('2026-01-01');
  });

  it('encouragementCountが数値でない場合 → 0', () => {
    const result = normalizeAppData({ encouragementCount: 'invalid' } as never);
    expect(result.encouragementCount).toBe(0);
  });

  it('encouragementCountが数値の場合 → そのまま', () => {
    const result = normalizeAppData({ encouragementCount: 5 } as never);
    expect(result.encouragementCount).toBe(5);
  });

  it('workProgressesのcompletedCount補完', () => {
    const result = normalizeAppData({
      workProgresses: [
        { id: 'wp-1', status: 'pending', completedCount: 3, createdAt: '', updatedAt: '' },
        { id: 'wp-2', status: 'pending', createdAt: '', updatedAt: '' },
      ],
    } as never);
    expect(result.workProgresses[0].completedCount).toBe(3);
    expect(result.workProgresses[1].completedCount).toBeUndefined();
  });

  it('tastingSessionsのaiAnalysis関連フィールド保持', () => {
    const result = normalizeAppData({
      tastingSessions: [{
        id: 's1',
        aiAnalysis: 'テスト分析',
        aiAnalysisUpdatedAt: '2026-02-11T00:00:00Z',
        aiAnalysisRecordCount: 5,
      }],
    } as never);
    expect(result.tastingSessions[0].aiAnalysis).toBe('テスト分析');
    expect(result.tastingSessions[0].aiAnalysisUpdatedAt).toBe('2026-02-11T00:00:00Z');
    expect(result.tastingSessions[0].aiAnalysisRecordCount).toBe(5);
  });

  it('userSettingsの正規化', () => {
    const result = normalizeAppData({
      userSettings: {
        selectedMemberId: 'member-1',
        taskLabelHeaderTextLeft: '  左ヘッダー  ',
        roastTimerSettings: {
          goToRoastRoomTimeSeconds: 90,
          timerSoundEnabled: false,
          timerSoundFile: '/sounds/roasttimer/bell.mp3',
          timerSoundVolume: 0.8,
          notificationSoundEnabled: true,
          notificationSoundFile: '/sounds/roasttimer/alarm.mp3',
          notificationSoundVolume: 0.5,
        },
      },
    } as never);
    expect(result.userSettings?.selectedMemberId).toBe('member-1');
    expect(result.userSettings?.taskLabelHeaderTextLeft).toBe('左ヘッダー');
    expect(result.userSettings?.roastTimerSettings?.goToRoastRoomTimeSeconds).toBe(90);
    expect(result.userSettings?.roastTimerSettings?.timerSoundEnabled).toBe(false);
  });

  it('roastTimerSettingsの音声ファイルパスマイグレーション', () => {
    const result = normalizeAppData({
      userSettings: {
        roastTimerSettings: {
          goToRoastRoomTimeSeconds: 60,
          timerSoundEnabled: true,
          timerSoundFile: '/sounds/alarm/bell.mp3', // 旧パス
          timerSoundVolume: 0.5,
          notificationSoundEnabled: true,
          notificationSoundFile: '/sounds/alarm/alarm.mp3', // 旧パス
          notificationSoundVolume: 0.5,
        },
      },
    } as never);
    expect(result.userSettings?.roastTimerSettings?.timerSoundFile).toBe('/sounds/roasttimer/bell.mp3');
    expect(result.userSettings?.roastTimerSettings?.notificationSoundFile).toBe('/sounds/roasttimer/alarm.mp3');
  });
});

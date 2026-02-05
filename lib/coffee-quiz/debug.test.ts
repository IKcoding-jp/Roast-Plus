import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setDebugMode,
  isDebugMode,
  setDebugDateOffset,
  getDebugDateOffset,
  getCurrentDate,
  getDebugTodayDateString,
  resetDebugState,
  getDebugInfo,
} from './debug';

describe('debug', () => {
  // 各テスト前にデバッグ状態をリセット
  beforeEach(() => {
    resetDebugState();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
  });

  afterEach(() => {
    resetDebugState();
    vi.useRealTimers();
  });

  // ========================================
  // setDebugMode / isDebugMode
  // ========================================
  describe('setDebugMode / isDebugMode', () => {
    it('初期状態はfalse', () => {
      expect(isDebugMode()).toBe(false);
    });

    it('trueを設定できる', () => {
      setDebugMode(true);
      expect(isDebugMode()).toBe(true);
    });

    it('falseを設定できる', () => {
      setDebugMode(true);
      setDebugMode(false);
      expect(isDebugMode()).toBe(false);
    });

    it('複数回の切り替えが正しく動作する', () => {
      expect(isDebugMode()).toBe(false);
      setDebugMode(true);
      expect(isDebugMode()).toBe(true);
      setDebugMode(false);
      expect(isDebugMode()).toBe(false);
      setDebugMode(true);
      expect(isDebugMode()).toBe(true);
    });
  });

  // ========================================
  // setDebugDateOffset / getDebugDateOffset
  // ========================================
  describe('setDebugDateOffset / getDebugDateOffset', () => {
    it('初期値は0', () => {
      expect(getDebugDateOffset()).toBe(0);
    });

    it('正のオフセットを設定できる', () => {
      setDebugDateOffset(7);
      expect(getDebugDateOffset()).toBe(7);
    });

    it('負のオフセットを設定できる', () => {
      setDebugDateOffset(-3);
      expect(getDebugDateOffset()).toBe(-3);
    });

    it('0を設定できる', () => {
      setDebugDateOffset(5);
      setDebugDateOffset(0);
      expect(getDebugDateOffset()).toBe(0);
    });

    it('大きな値を設定できる', () => {
      setDebugDateOffset(365);
      expect(getDebugDateOffset()).toBe(365);
    });
  });

  // ========================================
  // getCurrentDate
  // ========================================
  describe('getCurrentDate', () => {
    it('デバッグモードOFFの場合は現在日時を返す', () => {
      setDebugMode(false);
      const date = getCurrentDate();

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(1); // 0-indexed, so 1 = February
      expect(date.getDate()).toBe(6);
    });

    it('デバッグモードON + オフセット0の場合は現在日時を返す', () => {
      setDebugMode(true);
      setDebugDateOffset(0);
      const date = getCurrentDate();

      expect(date.getDate()).toBe(6);
    });

    it('デバッグモードON + 正のオフセットで未来の日付を返す', () => {
      setDebugMode(true);
      setDebugDateOffset(7);
      const date = getCurrentDate();

      expect(date.getDate()).toBe(13); // 6 + 7 = 13
    });

    it('デバッグモードON + 負のオフセットで過去の日付を返す', () => {
      setDebugMode(true);
      setDebugDateOffset(-3);
      const date = getCurrentDate();

      expect(date.getDate()).toBe(3); // 6 - 3 = 3
    });

    it('月をまたぐオフセットが正しく動作する', () => {
      setDebugMode(true);
      setDebugDateOffset(25); // 2/6 + 25 = 3/3
      const date = getCurrentDate();

      expect(date.getMonth()).toBe(2); // March (0-indexed)
      expect(date.getDate()).toBe(3);
    });
  });

  // ========================================
  // getDebugTodayDateString
  // ========================================
  describe('getDebugTodayDateString', () => {
    it('YYYY-MM-DD形式で返す', () => {
      setDebugMode(false);
      const dateString = getDebugTodayDateString();

      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dateString).toBe('2026-02-06');
    });

    it('デバッグモードON + オフセットが反映される', () => {
      setDebugMode(true);
      setDebugDateOffset(1);
      const dateString = getDebugTodayDateString();

      expect(dateString).toBe('2026-02-07');
    });

    it('負のオフセットが反映される', () => {
      setDebugMode(true);
      setDebugDateOffset(-6);
      const dateString = getDebugTodayDateString();

      expect(dateString).toBe('2026-01-31');
    });
  });

  // ========================================
  // resetDebugState
  // ========================================
  describe('resetDebugState', () => {
    it('デバッグモードをfalseにリセットする', () => {
      setDebugMode(true);
      resetDebugState();

      expect(isDebugMode()).toBe(false);
    });

    it('日付オフセットを0にリセットする', () => {
      setDebugDateOffset(10);
      resetDebugState();

      expect(getDebugDateOffset()).toBe(0);
    });

    it('両方を同時にリセットする', () => {
      setDebugMode(true);
      setDebugDateOffset(5);
      resetDebugState();

      expect(isDebugMode()).toBe(false);
      expect(getDebugDateOffset()).toBe(0);
    });
  });

  // ========================================
  // getDebugInfo
  // ========================================
  describe('getDebugInfo', () => {
    it('現在のデバッグ情報を返す', () => {
      const info = getDebugInfo();

      expect(info).toHaveProperty('debugMode');
      expect(info).toHaveProperty('dateOffset');
      expect(info).toHaveProperty('currentDate');
      expect(info).toHaveProperty('realDate');
    });

    it('debugModeが正しく反映される', () => {
      setDebugMode(false);
      expect(getDebugInfo().debugMode).toBe(false);

      setDebugMode(true);
      expect(getDebugInfo().debugMode).toBe(true);
    });

    it('dateOffsetが正しく反映される', () => {
      setDebugDateOffset(5);
      expect(getDebugInfo().dateOffset).toBe(5);
    });

    it('currentDateがオフセットを反映する', () => {
      setDebugMode(true);
      setDebugDateOffset(1);
      const info = getDebugInfo();

      expect(info.currentDate).toBe('2026-02-07');
    });

    it('realDateは常に実際の日付を返す', () => {
      setDebugMode(true);
      setDebugDateOffset(100);
      const info = getDebugInfo();

      expect(info.realDate).toBe('2026-02-06');
    });

    it('デバッグモードOFFでもrealDateとcurrentDateが一致する', () => {
      setDebugMode(false);
      const info = getDebugInfo();

      expect(info.currentDate).toBe(info.realDate);
    });
  });

  // ========================================
  // エッジケース
  // ========================================
  describe('エッジケース', () => {
    it('大きな正のオフセットが処理できる', () => {
      setDebugMode(true);
      setDebugDateOffset(365);
      const date = getCurrentDate();

      expect(date.getFullYear()).toBe(2027);
    });

    it('大きな負のオフセットが処理できる', () => {
      setDebugMode(true);
      setDebugDateOffset(-365);
      const date = getCurrentDate();

      expect(date.getFullYear()).toBe(2025);
    });

    it('オフセット0でデバッグモードがONでも正常動作', () => {
      setDebugMode(true);
      setDebugDateOffset(0);
      const info = getDebugInfo();

      expect(info.currentDate).toBe(info.realDate);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  toJSDate,
  toFirestoreTimestamp,
  type FirestoreTimestamp,
} from './firestoreUtils';

describe('firestoreUtils', () => {
  describe('toJSDate', () => {
    describe('nullまたはundefinedの処理', () => {
      it('nullの場合はundefinedを返す', () => {
        expect(toJSDate(null)).toBeUndefined();
      });

      it('undefinedの場合はundefinedを返す', () => {
        expect(toJSDate(undefined)).toBeUndefined();
      });
    });

    describe('Dateオブジェクトの処理', () => {
      it('Dateオブジェクトをそのまま返す', () => {
        const date = new Date('2024-02-05T12:00:00Z');
        const result = toJSDate(date);

        expect(result).toBe(date);
        expect(result).toBeInstanceOf(Date);
      });

      it('現在日時を正しく処理する', () => {
        const now = new Date();
        const result = toJSDate(now);

        expect(result).toBe(now);
      });
    });

    describe('Firestore Timestamp（toDateメソッド付き）の処理', () => {
      it('toDateメソッドを持つTimestampを変換できる', () => {
        const timestamp: FirestoreTimestamp = {
          seconds: 1707134400, // 2024-02-05 12:00:00 UTC
          nanoseconds: 500000000, // 0.5秒
          toDate: () => new Date(1707134400500), // seconds * 1000 + nanoseconds / 1000000
        };

        const result = toJSDate(timestamp);

        expect(result).toBeInstanceOf(Date);
        expect(result?.getTime()).toBe(1707134400500);
      });

      it('toDateメソッドが正しく呼び出される', () => {
        const mockDate = new Date('2024-01-15T10:30:00Z');
        const timestamp: FirestoreTimestamp = {
          seconds: 1705316600,
          nanoseconds: 0,
          toDate: () => mockDate,
        };

        const result = toJSDate(timestamp);

        expect(result).toBe(mockDate);
      });
    });

    describe('Firestore Timestamp（seconds/nanosecondsのみ）の処理', () => {
      it('秒とナノ秒からDateを生成できる', () => {
        const timestamp: FirestoreTimestamp = {
          seconds: 1707134400,
          nanoseconds: 0,
        };

        const result = toJSDate(timestamp);

        expect(result).toBeInstanceOf(Date);
        expect(result?.getTime()).toBe(1707134400000);
      });

      it('ナノ秒を正しくミリ秒に変換する', () => {
        const timestamp: FirestoreTimestamp = {
          seconds: 1707134400,
          nanoseconds: 123456789, // 123.456789ミリ秒
        };

        const result = toJSDate(timestamp);

        expect(result).toBeInstanceOf(Date);
        // JavaScriptのDateはミリ秒精度なので、小数点以下は切り捨てられる
        // 1707134400000 + 123.456789 = 1707134400123 (整数部分のみ)
        expect(result?.getTime()).toBe(1707134400123);
      });

      it('ナノ秒が999999999の場合も正しく処理する', () => {
        const timestamp: FirestoreTimestamp = {
          seconds: 1707134400,
          nanoseconds: 999999999, // 999.999999ミリ秒
        };

        const result = toJSDate(timestamp);

        expect(result?.getTime()).toBeCloseTo(1707134400999.999999, 2);
      });
    });

    describe('ISO文字列の処理', () => {
      it('有効なISO文字列をDateに変換できる', () => {
        const result = toJSDate('2024-02-05T12:00:00Z');

        expect(result).toBeInstanceOf(Date);
        expect(result?.getTime()).toBe(1707134400000);
      });

      it('異なる形式のISO文字列も処理できる', () => {
        const result1 = toJSDate('2024-02-05T12:00:00.000Z');
        const result2 = toJSDate('2024-02-05T12:00:00+00:00');
        const result3 = toJSDate('2024-02-05');

        expect(result1).toBeInstanceOf(Date);
        expect(result2).toBeInstanceOf(Date);
        expect(result3).toBeInstanceOf(Date);
      });

      it('無効な文字列の場合はundefinedを返す', () => {
        const result = toJSDate('invalid-date');

        expect(result).toBeUndefined();
      });

      it('空文字列の場合はundefinedを返す', () => {
        const result = toJSDate('');

        expect(result).toBeUndefined();
      });

      it('部分的に無効な日付文字列の場合はundefinedを返す', () => {
        const result = toJSDate('2024-99-99T00:00:00Z');

        expect(result).toBeUndefined();
      });
    });
  });

  describe('toFirestoreTimestamp', () => {
    it('Dateオブジェクトを Firestore Timestamp に変換できる', () => {
      const date = new Date('2024-02-05T12:00:00Z');
      const timestamp = toFirestoreTimestamp(date);

      expect(timestamp.seconds).toBe(1707134400);
      expect(timestamp.nanoseconds).toBe(0);
    });

    it('ミリ秒を正しくナノ秒に変換する', () => {
      const date = new Date('2024-02-05T12:00:00.500Z'); // 0.5秒
      const timestamp = toFirestoreTimestamp(date);

      expect(timestamp.seconds).toBe(1707134400);
      expect(timestamp.nanoseconds).toBe(500000000); // 500ms = 500,000,000ns
    });

    it('toDateメソッドが正しく動作する', () => {
      const originalDate = new Date('2024-02-05T12:00:00.123Z');
      const timestamp = toFirestoreTimestamp(originalDate);

      const reconvertedDate = timestamp.toDate!();

      expect(reconvertedDate).toBeInstanceOf(Date);
      expect(reconvertedDate.getTime()).toBe(originalDate.getTime());
    });

    it('toDateメソッドで元のDateを復元できる', () => {
      const originalDate = new Date('2024-01-15T10:30:45.789Z');
      const timestamp = toFirestoreTimestamp(originalDate);

      expect(timestamp.toDate).toBeDefined();

      const restoredDate = timestamp.toDate!();
      expect(restoredDate.getTime()).toBe(originalDate.getTime());
    });

    it('UNIXエポック時刻（1970-01-01）を正しく処理する', () => {
      const date = new Date(0);
      const timestamp = toFirestoreTimestamp(date);

      expect(timestamp.seconds).toBe(0);
      expect(timestamp.nanoseconds).toBe(0);
    });

    it('現在時刻を正しく変換できる', () => {
      const now = new Date();
      const timestamp = toFirestoreTimestamp(now);

      const restoredDate = timestamp.toDate!();
      expect(restoredDate.getTime()).toBe(now.getTime());
    });
  });

  describe('相互変換', () => {
    it('Date -> Timestamp -> Date の変換で元に戻る', () => {
      const originalDate = new Date('2024-02-05T12:00:00.456Z');

      const timestamp = toFirestoreTimestamp(originalDate);
      const convertedDate = toJSDate(timestamp);

      expect(convertedDate?.getTime()).toBe(originalDate.getTime());
    });

    it('複数回の変換でも精度が保たれる', () => {
      const originalDate = new Date('2024-01-15T10:30:45.123Z');

      const timestamp1 = toFirestoreTimestamp(originalDate);
      const date1 = toJSDate(timestamp1);

      const timestamp2 = toFirestoreTimestamp(date1!);
      const date2 = toJSDate(timestamp2);

      expect(date2?.getTime()).toBe(originalDate.getTime());
    });

    it('ミリ秒精度が保たれる', () => {
      const dates = [
        new Date('2024-02-05T12:00:00.000Z'),
        new Date('2024-02-05T12:00:00.123Z'),
        new Date('2024-02-05T12:00:00.999Z'),
      ];

      dates.forEach((originalDate) => {
        const timestamp = toFirestoreTimestamp(originalDate);
        const convertedDate = toJSDate(timestamp);

        expect(convertedDate?.getTime()).toBe(originalDate.getTime());
      });
    });
  });

  describe('実際のユースケース', () => {
    it('Firestoreから取得したTimestampをDateに変換', () => {
      // Firestoreから取得したようなTimestamp
      const firestoreData: FirestoreTimestamp = {
        seconds: 1707134400,
        nanoseconds: 123456789,
        toDate: () => new Date(1707134400123),
      };

      const date = toJSDate(firestoreData);

      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(1); // 0-indexed (2月)
      expect(date?.getDate()).toBe(5);
    });

    it('JavaScript DateをFirestore保存用に変換', () => {
      const userInputDate = new Date('2024-12-25T00:00:00Z');

      const timestamp = toFirestoreTimestamp(userInputDate);

      expect(timestamp.seconds).toBe(1735084800);
      expect(timestamp.nanoseconds).toBe(0);
      expect(timestamp.toDate).toBeDefined();
    });

    it('ISO文字列（APIレスポンス）をDateに変換', () => {
      const apiResponse = '2024-02-05T12:00:00.000Z';

      const date = toJSDate(apiResponse);

      expect(date).toBeInstanceOf(Date);
      expect(date?.toISOString()).toBe(apiResponse);
    });

    it('nullチェックでエラーを防ぐ', () => {
      const optionalTimestamp: FirestoreTimestamp | null = null;

      const date = toJSDate(optionalTimestamp);

      expect(date).toBeUndefined();
      // undefinedなので、さらなる処理をスキップできる
    });
  });
});

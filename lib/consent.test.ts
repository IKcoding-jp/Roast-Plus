import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  needsConsent,
  createConsentData,
  formatConsentDate,
  TERMS_VERSION,
  PRIVACY_POLICY_VERSION,
} from './consent';
import type { UserConsent } from '@/types';

describe('consent', () => {
  describe('定数', () => {
    it('TERMS_VERSIONが定義されている', () => {
      expect(TERMS_VERSION).toBe('1.0.0');
    });

    it('PRIVACY_POLICY_VERSIONが定義されている', () => {
      expect(PRIVACY_POLICY_VERSION).toBe('1.0.0');
    });
  });

  describe('needsConsent', () => {
    it('同意情報がundefinedの場合はtrueを返す', () => {
      expect(needsConsent(undefined)).toBe(true);
    });

    it('同意していない場合はtrueを返す', () => {
      const consent: UserConsent = {
        hasAgreed: false,
        agreedAt: '',
        agreedTermsVersion: '',
        agreedPrivacyVersion: '',
      };

      expect(needsConsent(consent)).toBe(true);
    });

    it('利用規約のバージョンが古い場合はtrueを返す', () => {
      const consent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2024-01-15T00:00:00.000Z',
        agreedTermsVersion: '0.9.0', // 古いバージョン
        agreedPrivacyVersion: PRIVACY_POLICY_VERSION,
      };

      expect(needsConsent(consent)).toBe(true);
    });

    it('プライバシーポリシーのバージョンが古い場合はtrueを返す', () => {
      const consent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2024-01-15T00:00:00.000Z',
        agreedTermsVersion: TERMS_VERSION,
        agreedPrivacyVersion: '0.8.0', // 古いバージョン
      };

      expect(needsConsent(consent)).toBe(true);
    });

    it('両方のバージョンが古い場合はtrueを返す', () => {
      const consent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2024-01-15T00:00:00.000Z',
        agreedTermsVersion: '0.9.0', // 古いバージョン
        agreedPrivacyVersion: '0.8.0', // 古いバージョン
      };

      expect(needsConsent(consent)).toBe(true);
    });

    it('最新バージョンに同意済みの場合はfalseを返す', () => {
      const consent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2024-01-15T00:00:00.000Z',
        agreedTermsVersion: TERMS_VERSION,
        agreedPrivacyVersion: PRIVACY_POLICY_VERSION,
      };

      expect(needsConsent(consent)).toBe(false);
    });

    it('同意しているがバージョン情報がない場合はtrueを返す', () => {
      const consent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2024-01-15T00:00:00.000Z',
        agreedTermsVersion: '',
        agreedPrivacyVersion: '',
      };

      expect(needsConsent(consent)).toBe(true);
    });
  });

  describe('createConsentData', () => {
    beforeEach(() => {
      // Dateをモック（固定時刻）
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-02-05T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('同意データを作成できる', () => {
      const consent = createConsentData();

      expect(consent.hasAgreed).toBe(true);
      expect(consent.agreedTermsVersion).toBe(TERMS_VERSION);
      expect(consent.agreedPrivacyVersion).toBe(PRIVACY_POLICY_VERSION);
    });

    it('同意日時が現在時刻（ISO形式）で設定される', () => {
      const consent = createConsentData();

      expect(consent.agreedAt).toBe('2024-02-05T12:00:00.000Z');
    });

    it('複数回呼び出すと異なる時刻が記録される', () => {
      const consent1 = createConsentData();

      // 時刻を進める
      vi.advanceTimersByTime(1000); // 1秒進める

      const consent2 = createConsentData();

      expect(consent1.agreedAt).not.toBe(consent2.agreedAt);
    });

    it('作成したデータはneedsConsentでfalseを返す', () => {
      const consent = createConsentData();

      expect(needsConsent(consent)).toBe(false);
    });
  });

  describe('formatConsentDate', () => {
    it('ISO日付を日本語形式にフォーマットできる', () => {
      const formatted = formatConsentDate('2024-02-05T12:00:00.000Z');

      expect(formatted).toMatch(/2024年/);
      expect(formatted).toMatch(/2月/);
      expect(formatted).toMatch(/5日/);
    });

    it('異なる日付を正しくフォーマットできる', () => {
      const formatted = formatConsentDate('2023-12-25T00:00:00.000Z');

      expect(formatted).toMatch(/2023年/);
      expect(formatted).toMatch(/12月/);
      expect(formatted).toMatch(/25日/);
    });

    it('無効な日付形式の場合は"Invalid Date"を返す', () => {
      const invalidDate = 'invalid-date';
      const formatted = formatConsentDate(invalidDate);

      // new Date('invalid-date')はInvalid Dateオブジェクトを生成
      // toLocaleDateString()は"Invalid Date"文字列を返す（例外は投げない）
      expect(formatted).toBe('Invalid Date');
    });

    it('空文字列の場合は"Invalid Date"を返す', () => {
      const formatted = formatConsentDate('');

      // new Date('')はInvalid Dateオブジェクトを生成
      expect(formatted).toBe('Invalid Date');
    });

    it('部分的に無効な日付の場合は"Invalid Date"を返す', () => {
      const partiallyInvalid = '2024-99-99T00:00:00.000Z';
      const formatted = formatConsentDate(partiallyInvalid);

      // 無効な日付はInvalid Dateオブジェクトになる
      expect(formatted).toBe('Invalid Date');
    });

    it('タイムゾーンが異なる日付も正しく処理できる', () => {
      const formatted = formatConsentDate('2024-01-01T00:00:00+09:00');

      expect(formatted).toMatch(/2024年/);
      expect(formatted).toMatch(/1月/);
      expect(formatted).toMatch(/1日/);
    });
  });

  describe('実際のユースケース', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-02-05T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('初回ユーザー: 同意が必要', () => {
      const needsAgreement = needsConsent(undefined);

      expect(needsAgreement).toBe(true);
    });

    it('初回ユーザー: 同意して保存', () => {
      const consent = createConsentData();

      expect(consent.hasAgreed).toBe(true);
      expect(consent.agreedAt).toBe('2024-02-05T10:00:00.000Z');
      expect(needsConsent(consent)).toBe(false);
    });

    it('既存ユーザー: 最新版に同意済み → 同意不要', () => {
      const existingConsent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2024-01-01T00:00:00.000Z',
        agreedTermsVersion: TERMS_VERSION,
        agreedPrivacyVersion: PRIVACY_POLICY_VERSION,
      };

      expect(needsConsent(existingConsent)).toBe(false);
    });

    it('既存ユーザー: 利用規約が更新された → 再同意が必要', () => {
      const oldConsent: UserConsent = {
        hasAgreed: true,
        agreedAt: '2023-06-01T00:00:00.000Z',
        agreedTermsVersion: '0.9.0', // 旧バージョン
        agreedPrivacyVersion: PRIVACY_POLICY_VERSION,
      };

      expect(needsConsent(oldConsent)).toBe(true);

      // 再同意
      const newConsent = createConsentData();
      expect(needsConsent(newConsent)).toBe(false);
    });

    it('同意日時を表示形式に変換', () => {
      const consent = createConsentData();
      const formatted = formatConsentDate(consent.agreedAt);

      expect(formatted).toMatch(/2024年2月5日/);
    });

    it('完全なフロー: 同意チェック → 同意 → 日時表示', () => {
      // 1. 同意が必要かチェック
      expect(needsConsent(undefined)).toBe(true);

      // 2. 同意データを作成
      const consent = createConsentData();

      // 3. 同意完了を確認
      expect(needsConsent(consent)).toBe(false);

      // 4. 同意日時を表示用にフォーマット
      const displayDate = formatConsentDate(consent.agreedAt);
      expect(displayDate).toMatch(/2024年2月5日/);
    });
  });
});

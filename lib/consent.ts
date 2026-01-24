import { UserConsent } from '@/types';

// バージョン定義
export const TERMS_VERSION = '1.0.0';
export const PRIVACY_POLICY_VERSION = '1.0.0';

// 同意が必要かどうかをチェック
export function needsConsent(userConsent: UserConsent | undefined): boolean {
  if (!userConsent || !userConsent.hasAgreed) {
    return true;
  }

  // バージョンが更新されていないかチェック
  if (userConsent.agreedTermsVersion !== TERMS_VERSION) {
    return true;
  }

  if (userConsent.agreedPrivacyVersion !== PRIVACY_POLICY_VERSION) {
    return true;
  }

  return false;
}

// 同意情報を作成
export function createConsentData(): UserConsent {
  return {
    hasAgreed: true,
    agreedAt: new Date().toISOString(),
    agreedTermsVersion: TERMS_VERSION,
    agreedPrivacyVersion: PRIVACY_POLICY_VERSION,
  };
}

// 同意日時をフォーマット
export function formatConsentDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

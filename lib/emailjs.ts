// EmailJS送信ユーティリティ
import emailjs from '@emailjs/browser';

// EmailJS設定
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// お問い合わせ種別
export const CONTACT_TYPES = [
  { value: 'question', label: '機能に関するご質問' },
  { value: 'bug', label: '不具合のご報告' },
  { value: 'request', label: 'ご要望・ご提案' },
  { value: 'other', label: 'その他' },
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number]['value'];

// フォームデータの型
export interface ContactFormData {
  name: string;
  email: string;
  type: ContactType;
  message: string;
}

// EmailJS初期化チェック
export function isEmailJSConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

// メール送信
export async function sendContactEmail(data: ContactFormData): Promise<void> {
  if (!isEmailJSConfigured()) {
    throw new Error('EmailJSの設定が完了していません。環境変数を確認してください。');
  }

  const typeLabel = CONTACT_TYPES.find((t) => t.value === data.type)?.label || data.type;

  const templateParams = {
    from_name: data.name || '匿名',
    from_email: data.email,
    contact_type: typeLabel,
    message: data.message,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  } catch (error) {
    console.error('EmailJS送信エラー:', error);
    throw new Error('メールの送信に失敗しました。しばらくしてから再度お試しください。');
  }
}

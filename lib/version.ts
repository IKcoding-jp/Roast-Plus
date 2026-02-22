/**
 * アプリケーションバージョン情報
 *
 * next.config.ts で NEXT_PUBLIC_APP_VERSION に package.json のバージョンが注入される。
 * フォールバック値は手動で更新しないこと。
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.12.0';

/**
 * バージョン管理ユーティリティ
 * アプリのバージョン情報をlocalStorageで管理し、初回起動時やバージョンアップ時の検出を行う
 */

const LAST_SHOWN_VERSION_KEY = 'roastplus_last_shown_version';

/**
 * 最後に表示したバージョンを取得
 * @returns 最後に表示したバージョン、未設定の場合はnull
 */
export function getLastShownVersion(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(LAST_SHOWN_VERSION_KEY);
  } catch (error) {
    console.error('バージョン情報の取得に失敗しました:', error);
    return null;
  }
}

/**
 * 最後に表示したバージョンを保存
 * @param version 保存するバージョン
 */
export function setLastShownVersion(version: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LAST_SHOWN_VERSION_KEY, version);
  } catch (error) {
    console.error('バージョン情報の保存に失敗しました:', error);
  }
}

/**
 * 初回起動時またはバージョンアップ時かどうかを判定
 * @param currentVersion 現在のアプリバージョン
 * @returns 初回起動時またはバージョンアップ時の場合true
 */
export function shouldShowVersionModal(currentVersion: string): boolean {
  const lastShownVersion = getLastShownVersion();

  // 初回起動時（localStorageに値がない場合）
  if (!lastShownVersion) {
    return true;
  }

  // バージョンアップ時（保存されているバージョンと現在のバージョンが異なる場合）
  if (lastShownVersion !== currentVersion) {
    return true;
  }

  return false;
}

/**
 * バージョン比較（セマンティックバージョン）
 * 現在は単純な文字列比較を使用
 * @param version1 バージョン1
 * @param version2 バージョン2
 * @returns version1がversion2より新しい場合1、同じ場合0、古い場合-1
 */
export function compareVersions(version1: string, version2: string): number {
  // 簡易的な実装：セマンティックバージョンの文字列比較
  // より正確な比較が必要な場合は、バージョン番号をパースして比較する
  if (version1 === version2) {
    return 0;
  }

  // 文字列比較で十分な場合が多い（例: "0.2.0" < "0.2.3"）
  return version1 > version2 ? 1 : -1;
}


// バージョン判定・計算ロジック

import type { VersionType, PRLabel, VersionBumpResult } from './types';

/**
 * PRの情報からバージョンバンプの種類を判定
 */
export function determineVersionBump(
  title: string,
  body: string,
  labels: PRLabel[]
): VersionBumpResult {
  // BREAKING CHANGE チェック（最優先）
  if (
    title.includes('BREAKING CHANGE') ||
    body?.includes('BREAKING CHANGE') ||
    labels.some((l) => l.name.toLowerCase() === 'breaking-change')
  ) {
    return { versionType: 'major', changelogType: 'feature' };
  }

  // ラベルによる判定
  const labelNames = labels.map((l) => l.name.toLowerCase());

  if (labelNames.includes('enhancement') || labelNames.includes('feature')) {
    return { versionType: 'minor', changelogType: 'feature' };
  }
  if (labelNames.includes('bug') || labelNames.includes('bugfix')) {
    return { versionType: 'patch', changelogType: 'bugfix' };
  }
  if (labelNames.includes('documentation') || labelNames.includes('docs')) {
    return { versionType: 'patch', changelogType: 'docs' };
  }

  // タイトルプレフィックスによる判定（Conventional Commits）
  const titleLower = title.toLowerCase();

  if (/^feat(\(.+\))?:/i.test(title)) {
    return { versionType: 'minor', changelogType: 'feature' };
  }
  if (/^fix(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'bugfix' };
  }
  if (/^docs(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'docs', skip: true };
  }
  if (/^style(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'style', skip: true };
  }
  if (/^(refactor|perf)(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'improvement', skip: true };
  }
  if (/^chore(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'update', skip: true };
  }

  // [feat], [fix] などの形式
  if (titleLower.includes('[feat]')) {
    return { versionType: 'minor', changelogType: 'feature' };
  }
  if (titleLower.includes('[fix]')) {
    return { versionType: 'patch', changelogType: 'bugfix' };
  }

  // デフォルト
  return { versionType: 'patch', changelogType: 'update' };
}

/**
 * バージョン番号を計算
 */
export function bumpVersion(currentVersion: string, type: VersionType): string {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

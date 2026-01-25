/**
 * バージョン自動更新スクリプト
 *
 * PRマージ時にGitHub Actionsから呼び出され、以下を更新:
 * - package.json
 * - lib/version.ts
 * - data/dev-stories/version-history.ts
 * - data/dev-stories/detailed-changelog.ts
 *
 * 環境変数:
 * - PR_TITLE: PRのタイトル
 * - PR_BODY: PRの本文
 * - PR_LABELS: PRのラベル配列 (JSON)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ====== 型定義 ======
type VersionType = 'major' | 'minor' | 'patch';
type ChangelogEntryType =
  | 'update'
  | 'story'
  | 'feature'
  | 'bugfix'
  | 'improvement'
  | 'docs'
  | 'style';

interface PRLabel {
  name: string;
  color?: string;
}

interface VersionBumpResult {
  versionType: VersionType;
  changelogType: ChangelogEntryType;
}

// ====== バージョン判定ロジック ======
function determineVersionBump(
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

  // feat: または feat(scope): 形式
  if (/^feat(\(.+\))?:/i.test(title)) {
    return { versionType: 'minor', changelogType: 'feature' };
  }
  // fix: または fix(scope): 形式
  if (/^fix(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'bugfix' };
  }
  // docs: 形式
  if (/^docs(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'docs' };
  }
  // style: 形式
  if (/^style(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'style' };
  }
  // refactor: または perf: 形式
  if (/^(refactor|perf)(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'improvement' };
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

// ====== バージョン番号計算 ======
function bumpVersion(currentVersion: string, type: VersionType): string {
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

// ====== ユーティリティ ======
function escapeForTemplate(str: string): string {
  // テンプレートリテラル用のエスケープ
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escapeForSingleQuote(str: string): string {
  // シングルクォート用のエスケープ
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function extractSummary(title: string): string {
  // PRタイトルから要約を抽出
  // [Issue #N] プレフィックスを除去
  let summary = title.replace(/^\[Issue #\d+\]\s*/i, '');
  // Conventional Commits プレフィックスを除去
  summary = summary.replace(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:\s*/i, '');
  // PR番号を除去 (#N)
  summary = summary.replace(/\s*\(#\d+\)\s*$/, '');
  return summary.trim();
}

function extractTags(labels: PRLabel[]): string[] {
  // PRラベルからタグを生成（一般的なラベルは除外）
  const excludeLabels = [
    'enhancement',
    'bug',
    'bugfix',
    'documentation',
    'docs',
    'feature',
    'breaking-change',
    'skip-version',
    'no-release',
  ];

  return labels
    .map((l) => l.name)
    .filter((name) => !excludeLabels.includes(name.toLowerCase()));
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getNowISO(): string {
  return new Date().toISOString();
}

// ====== ファイル更新処理 ======
function updatePackageJson(newVersion: string): void {
  const path = join(process.cwd(), 'package.json');
  const content = JSON.parse(readFileSync(path, 'utf-8'));
  content.version = newVersion;
  writeFileSync(path, JSON.stringify(content, null, 2) + '\n');
  console.log(`✓ package.json updated to ${newVersion}`);
}

function updateVersionTs(newVersion: string): void {
  const path = join(process.cwd(), 'lib', 'version.ts');
  const content = `/**
 * アプリケーションバージョン情報
 *
 * このファイルはGitHub Actionsによって自動更新されます。
 * 手動で編集しないでください。
 */
export const APP_VERSION = '${newVersion}';
`;
  writeFileSync(path, content);
  console.log(`✓ lib/version.ts updated to ${newVersion}`);
}

function updateVersionHistory(newVersion: string, summary: string): void {
  const path = join(process.cwd(), 'data', 'dev-stories', 'version-history.ts');
  const content = readFileSync(path, 'utf-8');

  const today = getTodayDate();
  const escapedSummary = escapeForSingleQuote(summary);

  const newEntry = `  {
    version: '${newVersion}',
    date: '${today}',
    summary: '${escapedSummary}',
  },`;

  // VERSION_HISTORY配列の先頭に新しいエントリを追加
  // CRLF/LF両方に対応するため \r?\n を使用
  const pattern = /export const VERSION_HISTORY: VersionHistoryEntry\[\] = \[\r?\n/;

  if (!pattern.test(content)) {
    throw new Error('Could not find VERSION_HISTORY array in version-history.ts');
  }

  const updatedContent = content.replace(
    pattern,
    `export const VERSION_HISTORY: VersionHistoryEntry[] = [\n${newEntry}\n`
  );

  writeFileSync(path, updatedContent);
  console.log(`✓ version-history.ts updated with ${newVersion}`);
}

function updateDetailedChangelog(
  newVersion: string,
  type: ChangelogEntryType,
  title: string,
  body: string,
  tags: string[]
): void {
  const path = join(process.cwd(), 'data', 'dev-stories', 'detailed-changelog.ts');
  const fileContent = readFileSync(path, 'utf-8');

  const today = getTodayDate();
  const isoNow = getNowISO();

  // コンテンツの生成（PRボディがあればそれを使用、なければタイトルから生成）
  const contentText = body && body.trim() ? body.trim() : `- ${title}`;
  const escapedContent = escapeForTemplate(contentText);
  const escapedTitle = escapeForSingleQuote(title);

  const newEntry = `  {
    id: 'v${newVersion}',
    version: '${newVersion}',
    date: '${today}',
    type: '${type}',
    title: '${escapedTitle}',
    content: \`
${escapedContent}
    \`.trim(),
    tags: ${JSON.stringify(tags)},
    createdAt: '${isoNow}',
    updatedAt: '${isoNow}',
  },`;

  // DETAILED_CHANGELOG配列の先頭に新しいエントリを追加
  // CRLF/LF両方に対応するため \r?\n を使用
  const pattern = /export const DETAILED_CHANGELOG: ChangelogEntry\[\] = \[\r?\n/;

  if (!pattern.test(fileContent)) {
    throw new Error('Could not find DETAILED_CHANGELOG array in detailed-changelog.ts');
  }

  const updatedContent = fileContent.replace(
    pattern,
    `export const DETAILED_CHANGELOG: ChangelogEntry[] = [\n${newEntry}\n`
  );

  writeFileSync(path, updatedContent);
  console.log(`✓ detailed-changelog.ts updated with ${newVersion}`);
}

// ====== メイン処理 ======
async function main() {
  console.log('🚀 Starting version update...\n');

  // 環境変数から取得
  const prTitle = process.env.PR_TITLE || '';
  const prBody = process.env.PR_BODY || '';
  let prLabels: PRLabel[] = [];

  try {
    prLabels = JSON.parse(process.env.PR_LABELS || '[]');
  } catch {
    console.warn('⚠ Could not parse PR_LABELS, using empty array');
  }

  console.log('PR Info:');
  console.log(`  Title: ${prTitle}`);
  console.log(`  Labels: ${prLabels.map((l) => l.name).join(', ') || '(none)'}`);
  console.log('');

  // skip-versionラベルのチェック
  if (
    prLabels.some(
      (l) =>
        l.name.toLowerCase() === 'skip-version' ||
        l.name.toLowerCase() === 'no-release'
    )
  ) {
    console.log('⏭ skip-version or no-release label detected. Skipping version update.');
    return;
  }

  // バージョン判定
  const { versionType, changelogType } = determineVersionBump(
    prTitle,
    prBody,
    prLabels
  );

  // 現在のバージョン取得
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const currentVersion = packageJson.version;

  // 新バージョン計算
  const newVersion = bumpVersion(currentVersion, versionType);

  console.log(`Version bump: ${currentVersion} → ${newVersion} (${versionType})`);
  console.log(`Changelog type: ${changelogType}`);
  console.log('');

  // タイトルから要約を抽出
  const summary = extractSummary(prTitle);

  // PRラベルからタグを生成
  const tags = extractTags(prLabels);

  // ファイル更新
  updatePackageJson(newVersion);
  updateVersionTs(newVersion);
  updateVersionHistory(newVersion, summary);
  updateDetailedChangelog(newVersion, changelogType, summary, prBody, tags);

  console.log('\n✅ All files updated successfully!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

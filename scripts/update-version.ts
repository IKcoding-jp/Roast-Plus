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
  skip?: boolean; // バージョン更新をスキップするか
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
  // docs: 形式 → スキップ（技術的変更）
  if (/^docs(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'docs', skip: true };
  }
  // style: 形式 → スキップ（技術的変更）
  if (/^style(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'style', skip: true };
  }
  // refactor: または perf: 形式 → スキップ（技術的変更）
  if (/^(refactor|perf)(\(.+\))?:/i.test(title)) {
    return { versionType: 'patch', changelogType: 'improvement', skip: true };
  }
  // chore: 形式 → スキップ（技術的変更）
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

function extractUserFacingContent(body: string, title: string): string {
  /**
   * PR本文から「ユーザー向け更新内容」セクションを抽出する
   *
   * 対応フォーマット:
   * - ## ユーザー向け更新内容
   * - ## What's Changed (for users)
   * - ## Release Notes
   *
   * セクションがない場合は、タイトルから簡潔な説明を生成
   */
  if (!body || !body.trim()) {
    return `- ${title}`;
  }

  // ユーザー向けセクションのパターン（複数対応）
  const sectionPatterns = [
    /##\s*ユーザー向け更新内容\s*\n([\s\S]*?)(?=\n##\s|\n---|\Z|$)/i,
    /##\s*(?:What's Changed|Release Notes)\s*(?:\(for users\))?\s*\n([\s\S]*?)(?=\n##\s|\n---|\Z|$)/i,
    /##\s*更新内容\s*\n([\s\S]*?)(?=\n##\s|\n---|\Z|$)/i,
  ];

  for (const pattern of sectionPatterns) {
    const match = body.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  // セクションがない場合は、タイトルのみを使用（技術的なPR本文は使わない）
  return `- ${title}`;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getNowISO(): string {
  return new Date().toISOString();
}

// 同日の最新エントリを取得（存在する場合）
function getSameDayLatestVersion(): { version: string; content: string } | null {
  const versionHistoryPath = join(process.cwd(), 'data', 'dev-stories', 'version-history.ts');
  const content = readFileSync(versionHistoryPath, 'utf-8');
  const today = getTodayDate();

  // 最新エントリの日付をチェック
  const dateMatch = content.match(/date:\s*'(\d{4}-\d{2}-\d{2})'/);
  const versionMatch = content.match(/version:\s*'([\d.]+)'/);

  if (dateMatch && versionMatch && dateMatch[1] === today) {
    // 詳細changelogから同じバージョンのcontentを取得
    const detailedPath = join(process.cwd(), 'data', 'dev-stories', 'detailed-changelog.ts');
    const detailedContent = readFileSync(detailedPath, 'utf-8');

    // 該当バージョンのcontentを抽出
    const contentMatch = detailedContent.match(
      new RegExp(`id:\\s*'v${versionMatch[1]}'[\\s\\S]*?content:\\s*\\\`\\n([\\s\\S]*?)\\n\\s*\\\`\\.trim\\(\\)`)
    );

    return {
      version: versionMatch[1],
      content: contentMatch ? contentMatch[1].trim() : '',
    };
  }

  return null;
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

// 同日の既存エントリを更新（内容を追記）
function appendToSameDayEntry(
  existingVersion: string,
  existingContent: string,
  newSummary: string,
  title: string
): void {
  const today = getTodayDate();
  const isoNow = getNowISO();

  // version-history.ts の summary を更新
  const versionHistoryPath = join(process.cwd(), 'data', 'dev-stories', 'version-history.ts');
  const versionHistoryContent = readFileSync(versionHistoryPath, 'utf-8');

  // 「〜 など N件の更新」形式に変更
  const existingSummaryMatch = versionHistoryContent.match(
    new RegExp(`version:\\s*'${existingVersion}'[\\s\\S]*?summary:\\s*'([^']*)'`)
  );

  if (existingSummaryMatch) {
    const existingSummary = existingSummaryMatch[1];
    let newSummaryText: string;

    // 既存が「N件の更新」形式かチェック
    const countMatch = existingSummary.match(/など\s*(\d+)件の更新$/);
    if (countMatch) {
      // 既に件数表記がある場合は+1
      const newCount = parseInt(countMatch[1]) + 1;
      newSummaryText = existingSummary.replace(/など\s*\d+件の更新$/, `など ${newCount}件の更新`);
    } else {
      // 初めてまとめる場合は「〜 など 2件の更新」に
      newSummaryText = `${existingSummary} など 2件の更新`;
    }

    const updatedVersionHistory = versionHistoryContent.replace(
      new RegExp(`(version:\\s*'${existingVersion}'[\\s\\S]*?summary:\\s*')([^']*)'`),
      `$1${newSummaryText}'`
    );
    writeFileSync(versionHistoryPath, updatedVersionHistory);
    console.log(`✓ version-history.ts updated (appended to ${existingVersion})`);
  }

  // detailed-changelog.ts の content に追記
  const detailedPath = join(process.cwd(), 'data', 'dev-stories', 'detailed-changelog.ts');
  const detailedContent = readFileSync(detailedPath, 'utf-8');

  // 新しい内容を既存contentに追加
  const newContentLine = `- ${title}`;
  const updatedContent = existingContent + '\n' + newContentLine;
  const escapedUpdatedContent = escapeForTemplate(updatedContent);

  // content部分を更新
  const contentPattern = new RegExp(
    `(id:\\s*'v${existingVersion}'[\\s\\S]*?content:\\s*\\\`\\n)[\\s\\S]*?(\\n\\s*\\\`\\.trim\\(\\))`
  );

  const updatedDetailed = detailedContent.replace(
    contentPattern,
    `$1${escapedUpdatedContent}$2`
  );

  // updatedAtも更新
  const finalUpdated = updatedDetailed.replace(
    new RegExp(`(id:\\s*'v${existingVersion}'[\\s\\S]*?updatedAt:\\s*')[^']*'`),
    `$1${isoNow}'`
  );

  writeFileSync(detailedPath, finalUpdated);
  console.log(`✓ detailed-changelog.ts updated (appended to ${existingVersion})`);
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

  // コンテンツの生成（ユーザー向けセクションを抽出、なければタイトルから生成）
  const contentText = extractUserFacingContent(body, title);
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
  const { versionType, changelogType, skip } = determineVersionBump(
    prTitle,
    prBody,
    prLabels
  );

  // 技術的な変更（refactor/chore/docs/style）はスキップ
  if (skip) {
    console.log(`⏭ Technical change detected (${changelogType}). Skipping version update.`);
    console.log('   Use feat: or fix: prefix for user-facing changes.');
    return;
  }

  // タイトルから要約を抽出
  const summary = extractSummary(prTitle);

  // 同日の既存エントリをチェック
  const sameDayEntry = getSameDayLatestVersion();

  if (sameDayEntry) {
    // 同日の場合は既存エントリに追記（新バージョンは作らない）
    console.log(`📅 Same-day entry found (v${sameDayEntry.version}). Appending to existing version.`);
    console.log('');

    appendToSameDayEntry(
      sameDayEntry.version,
      sameDayEntry.content,
      summary,
      summary
    );

    console.log('\n✅ Appended to existing version successfully!');
    return;
  }

  // 現在のバージョン取得
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const currentVersion = packageJson.version;

  // 新バージョン計算
  const newVersion = bumpVersion(currentVersion, versionType);

  console.log(`Version bump: ${currentVersion} → ${newVersion} (${versionType})`);
  console.log(`Changelog type: ${changelogType}`);
  console.log('');

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

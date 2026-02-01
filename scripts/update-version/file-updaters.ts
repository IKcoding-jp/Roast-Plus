// ファイル更新処理

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { ChangelogEntryType } from './types';
import {
  escapeForTemplate,
  escapeForSingleQuote,
  extractUserFacingContent,
  getTodayDate,
  getNowISO,
} from './utils';

export function updatePackageJson(newVersion: string): void {
  const path = join(process.cwd(), 'package.json');
  const content = JSON.parse(readFileSync(path, 'utf-8'));
  content.version = newVersion;
  writeFileSync(path, JSON.stringify(content, null, 2) + '\n');
  console.log(`✓ package.json updated to ${newVersion}`);
}

export function updateVersionTs(newVersion: string): void {
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

export function updateVersionHistory(newVersion: string, summary: string): void {
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
export function appendToSameDayEntry(
  existingVersion: string,
  existingContent: string,
  newSummary: string,
  title: string
): void {
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
      const newCount = parseInt(countMatch[1]) + 1;
      newSummaryText = existingSummary.replace(/など\s*\d+件の更新$/, `など ${newCount}件の更新`);
    } else {
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

  const newContentLine = `- ${title}`;
  const updatedContent = existingContent + '\n' + newContentLine;
  const escapedUpdatedContent = escapeForTemplate(updatedContent);

  const contentPattern = new RegExp(
    `(id:\\s*'v${existingVersion}'[\\s\\S]*?content:\\s*\\\`\\n)[\\s\\S]*?(\\n\\s*\\\`\\.trim\\(\\))`
  );

  const updatedDetailed = detailedContent.replace(
    contentPattern,
    `$1${escapedUpdatedContent}$2`
  );

  const finalUpdated = updatedDetailed.replace(
    new RegExp(`(id:\\s*'v${existingVersion}'[\\s\\S]*?updatedAt:\\s*')[^']*'`),
    `$1${isoNow}'`
  );

  writeFileSync(detailedPath, finalUpdated);
  console.log(`✓ detailed-changelog.ts updated (appended to ${existingVersion})`);
}

export function updateDetailedChangelog(
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

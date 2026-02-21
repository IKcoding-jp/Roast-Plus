/**
 * update-changelog.mjs
 *
 * PRマージ時にchangelogを自動更新するスクリプト。
 * GitHub Actions の changelog-update.yml から呼び出される。
 *
 * 環境変数:
 *   NEW_VERSION     - 新しいバージョン番号 (例: "0.12.0")
 *   CHANGELOG_CONTENT - PRの「ユーザー向け更新内容」テキスト
 *   PR_TYPE         - "feature" | "bugfix"
 *   MERGE_DATE      - マージ日 (YYYY-MM-DD)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * package.json のバージョンを更新する
 */
export function updatePackageJson(newVersion, rootDir = ROOT_DIR) {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

/**
 * detailed-changelog.ts の先頭に新エントリを挿入する
 */
export function updateDetailedChangelog(newVersion, changelogContent, prType, mergeDate, rootDir = ROOT_DIR) {
  const filePath = path.join(rootDir, 'data/dev-stories/detailed-changelog.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  const now = new Date().toISOString();
  const type = prType === 'feature' ? 'feature' : 'bugfix';

  // コンテンツの行数からタイトルを生成（1行目を使用）
  const lines = changelogContent.trim().split('\n').filter(l => l.trim());
  const firstLine = lines[0]?.replace(/^[-*]\s*/, '') ?? changelogContent.trim();
  const title = lines.length > 1 ? `${firstLine} など ${lines.length}件の更新` : firstLine;

  const newEntry = `  {
    id: 'v${newVersion}',
    version: '${newVersion}',
    date: '${mergeDate}',
    type: '${type}',
    title: '${title.replace(/'/g, "\\'")}',
    content: \`
${changelogContent.trim()}
    \`.trim(),
    tags: [],
    createdAt: '${now}',
    updatedAt: '${now}',
  },`;

  const marker = 'export const DETAILED_CHANGELOG: ChangelogEntry[] = [';
  if (!content.includes(marker)) {
    throw new Error(`マーカーが見つかりません: ${marker}`);
  }

  const updated = content.replace(marker, `${marker}\n${newEntry}`);
  fs.writeFileSync(filePath, updated);
}

/**
 * version-history.ts の先頭に新エントリを挿入する
 */
export function updateVersionHistory(newVersion, changelogContent, mergeDate, rootDir = ROOT_DIR) {
  const filePath = path.join(rootDir, 'data/dev-stories/version-history.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  // コンテンツの行数からサマリーを生成
  const lines = changelogContent.trim().split('\n').filter(l => l.trim());
  const firstLine = lines[0]?.replace(/^[-*]\s*/, '') ?? changelogContent.trim();
  const summary = lines.length > 1 ? `${firstLine} など ${lines.length}件の更新` : firstLine;

  const newEntry = `  {
    version: '${newVersion}',
    date: '${mergeDate}',
    summary: '${summary.replace(/'/g, "\\'")}',
  },`;

  const marker = 'export const VERSION_HISTORY: VersionHistoryEntry[] = [';
  if (!content.includes(marker)) {
    throw new Error(`マーカーが見つかりません: ${marker}`);
  }

  const updated = content.replace(marker, `${marker}\n${newEntry}`);
  fs.writeFileSync(filePath, updated);
}

/**
 * メイン処理
 */
function main() {
  const { NEW_VERSION, CHANGELOG_CONTENT, PR_TYPE, MERGE_DATE } = process.env;

  if (!NEW_VERSION || !CHANGELOG_CONTENT || !PR_TYPE || !MERGE_DATE) {
    console.error('必須環境変数が不足しています: NEW_VERSION, CHANGELOG_CONTENT, PR_TYPE, MERGE_DATE');
    process.exit(1);
  }

  console.log(`バージョン ${NEW_VERSION} のchangelogを更新します...`);

  updatePackageJson(NEW_VERSION);
  console.log(`✅ package.json を ${NEW_VERSION} に更新しました`);

  updateDetailedChangelog(NEW_VERSION, CHANGELOG_CONTENT, PR_TYPE, MERGE_DATE);
  console.log(`✅ detailed-changelog.ts に新エントリを追加しました`);

  updateVersionHistory(NEW_VERSION, CHANGELOG_CONTENT, MERGE_DATE);
  console.log(`✅ version-history.ts に新エントリを追加しました`);

  console.log('🎉 changelog更新が完了しました');
}

// スクリプトとして直接実行された場合のみmain()を呼ぶ
// (テストからimportされた場合は実行しない)
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}

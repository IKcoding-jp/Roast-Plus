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

import { readFileSync } from 'fs';
import type { PRLabel } from './update-version/types';
import { determineVersionBump, bumpVersion } from './update-version/version-logic';
import { extractSummary, extractTags, getSameDayLatestVersion } from './update-version/utils';
import {
  updatePackageJson,
  updateVersionTs,
  updateVersionHistory,
  updateDetailedChangelog,
  appendToSameDayEntry,
} from './update-version/file-updaters';

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

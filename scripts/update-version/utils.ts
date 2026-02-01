// バージョン更新スクリプトのユーティリティ関数

import { readFileSync } from 'fs';
import { join } from 'path';
import type { PRLabel } from './types';

export function escapeForTemplate(str: string): string {
  // テンプレートリテラル用のエスケープ
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

export function escapeForSingleQuote(str: string): string {
  // シングルクォート用のエスケープ
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function extractSummary(title: string): string {
  // PRタイトルから要約を抽出
  // [Issue #N] プレフィックスを除去
  let summary = title.replace(/^\[Issue #\d+\]\s*/i, '');
  // Conventional Commits プレフィックスを除去
  summary = summary.replace(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:\s*/i, '');
  // PR番号を除去 (#N)
  summary = summary.replace(/\s*\(#\d+\)\s*$/, '');
  return summary.trim();
}

export function extractTags(labels: PRLabel[]): string[] {
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

export function extractUserFacingContent(body: string, title: string): string {
  /**
   * PR本文から「ユーザー向け更新内容」セクションを抽出する
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

  // セクションがない場合は、タイトルのみを使用
  return `- ${title}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getNowISO(): string {
  return new Date().toISOString();
}

// 同日の最新エントリを取得（存在する場合）
export function getSameDayLatestVersion(): { version: string; content: string } | null {
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

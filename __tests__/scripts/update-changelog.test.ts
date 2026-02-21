// @vitest-environment node
/**
 * update-changelog.mjs のユニットテスト
 *
 * テンポラリディレクトリを使って実ファイルを汚染せずにテストする。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// .mjs のエクスポート関数を動的インポート
// (静的importだと ESM/CJS の混在でエラーになる場合があるため)
type UpdateFunctions = {
  updatePackageJson: (version: string, rootDir: string) => void;
  updateDetailedChangelog: (version: string, content: string, type: string, date: string, rootDir: string) => void;
  updateVersionHistory: (version: string, content: string, date: string, rootDir: string) => void;
};

let updateFns: UpdateFunctions;

beforeEach(async () => {
  // キャッシュをクリアするため毎回動的インポート
  updateFns = await import('../../.github/scripts/update-changelog.mjs?' + Date.now()) as unknown as UpdateFunctions;
});

// テンポラリディレクトリを作成するヘルパー
function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'changelog-test-'));
}

// テンポラリディレクトリにpackage.jsonを配置
function setupPackageJson(dir: string, version: string): void {
  const pkg = { name: 'roastplus', version, scripts: {} };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
}

// テンポラリディレクトリにdetailed-changelog.tsを配置
function setupDetailedChangelog(dir: string): void {
  const dataDir = path.join(dir, 'data', 'dev-stories');
  fs.mkdirSync(dataDir, { recursive: true });

  const content = `import type { ChangelogEntry, ChangelogEntryType } from '@/types';

export const DETAILED_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'v0.11.0',
    version: '0.11.0',
    date: '2026-02-03',
    type: 'feature',
    title: '既存エントリ',
    content: 'テスト内容',
    tags: [],
    createdAt: '2026-02-03T00:00:00.000Z',
    updatedAt: '2026-02-03T00:00:00.000Z',
  },
];
`;
  fs.writeFileSync(path.join(dataDir, 'detailed-changelog.ts'), content);
}

// テンポラリディレクトリにversion-history.tsを配置
function setupVersionHistory(dir: string): void {
  const dataDir = path.join(dir, 'data', 'dev-stories');
  fs.mkdirSync(dataDir, { recursive: true });

  const content = `import type { VersionHistoryEntry } from '@/types';

export const VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    version: '0.11.0',
    date: '2026-02-03',
    summary: '既存サマリー',
  },
];
`;
  fs.writeFileSync(path.join(dataDir, 'version-history.ts'), content);
}

describe('updatePackageJson', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('バージョンが正しく更新される', () => {
    setupPackageJson(tmpDir, '0.11.0');
    updateFns.updatePackageJson('0.12.0', tmpDir);

    const updated = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
    expect(updated.version).toBe('0.12.0');
  });

  it('バージョン以外のフィールドが保持される', () => {
    setupPackageJson(tmpDir, '0.11.0');
    updateFns.updatePackageJson('0.12.0', tmpDir);

    const updated = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
    expect(updated.name).toBe('roastplus');
    expect(updated.scripts).toEqual({});
  });

  it('末尾に改行が追加される', () => {
    setupPackageJson(tmpDir, '0.11.0');
    updateFns.updatePackageJson('0.12.0', tmpDir);

    const content = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8');
    expect(content.endsWith('\n')).toBe(true);
  });
});

describe('updateDetailedChangelog', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    setupDetailedChangelog(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('新エントリが配列の先頭に挿入される', () => {
    updateFns.updateDetailedChangelog(
      '0.12.0',
      '- 新機能が使えるようになりました',
      'feature',
      '2026-03-01',
      tmpDir
    );

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/detailed-changelog.ts'),
      'utf8'
    );
    // 新エントリが既存エントリより先に現れる
    const newIdx = content.indexOf("id: 'v0.12.0'");
    const oldIdx = content.indexOf("id: 'v0.11.0'");
    expect(newIdx).toBeGreaterThan(-1);
    expect(newIdx).toBeLessThan(oldIdx);
  });

  it('既存エントリが保持される', () => {
    updateFns.updateDetailedChangelog(
      '0.12.0',
      '- 新機能が使えるようになりました',
      'feature',
      '2026-03-01',
      tmpDir
    );

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/detailed-changelog.ts'),
      'utf8'
    );
    expect(content).toContain("id: 'v0.11.0'");
    expect(content).toContain('既存エントリ');
  });

  it('PR_TYPE=feature でtype=featureになる', () => {
    updateFns.updateDetailedChangelog('0.12.0', '- 機能追加', 'feature', '2026-03-01', tmpDir);

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/detailed-changelog.ts'),
      'utf8'
    );
    expect(content).toContain("type: 'feature'");
  });

  it('PR_TYPE=bugfix でtype=bugfixになる', () => {
    updateFns.updateDetailedChangelog('0.11.1', '- バグ修正', 'bugfix', '2026-03-01', tmpDir);

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/detailed-changelog.ts'),
      'utf8'
    );
    expect(content).toContain("type: 'bugfix'");
  });

  it('複数行コンテンツの場合タイトルに件数が付く', () => {
    const multiLine = '- 機能A\n- 機能B\n- 機能C';
    updateFns.updateDetailedChangelog('0.12.0', multiLine, 'feature', '2026-03-01', tmpDir);

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/detailed-changelog.ts'),
      'utf8'
    );
    expect(content).toContain('など 3件の更新');
  });
});

describe('updateVersionHistory', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    setupVersionHistory(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('新エントリが配列の先頭に挿入される', () => {
    updateFns.updateVersionHistory(
      '0.12.0',
      '- 新機能が使えるようになりました',
      '2026-03-01',
      tmpDir
    );

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/version-history.ts'),
      'utf8'
    );
    const newIdx = content.indexOf("version: '0.12.0'");
    const oldIdx = content.indexOf("version: '0.11.0'");
    expect(newIdx).toBeGreaterThan(-1);
    expect(newIdx).toBeLessThan(oldIdx);
  });

  it('既存エントリが保持される', () => {
    updateFns.updateVersionHistory(
      '0.12.0',
      '- 新機能',
      '2026-03-01',
      tmpDir
    );

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/version-history.ts'),
      'utf8'
    );
    expect(content).toContain("version: '0.11.0'");
    expect(content).toContain('既存サマリー');
  });

  it('1行コンテンツの場合そのままサマリーになる', () => {
    updateFns.updateVersionHistory(
      '0.12.0',
      '- 新機能が使えるようになりました',
      '2026-03-01',
      tmpDir
    );

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/version-history.ts'),
      'utf8'
    );
    expect(content).toContain('新機能が使えるようになりました');
  });

  it('複数行コンテンツの場合サマリーに件数が付く', () => {
    const multiLine = '- 機能A\n- 機能B';
    updateFns.updateVersionHistory('0.12.0', multiLine, '2026-03-01', tmpDir);

    const content = fs.readFileSync(
      path.join(tmpDir, 'data/dev-stories/version-history.ts'),
      'utf8'
    );
    expect(content).toContain('など 2件の更新');
  });
});

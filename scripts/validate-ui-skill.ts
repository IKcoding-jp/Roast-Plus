/**
 * UIスキル検証スクリプト
 *
 * ソースコード（globals.css, components/ui/）とスキルドキュメントの
 * 整合性を検証し、不整合があれば警告を出力する。
 *
 * 使い方: npm run skill:validate
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SKILL_DIR = resolve(ROOT, '.claude/skills/roastplus-ui/references');

interface ValidationResult {
  category: string;
  issues: string[];
}

// ── 1. CSS変数の検証 ──────────────────────────────

function validateDesignTokens(): ValidationResult {
  const issues: string[] = [];

  const globalsCss = readFileSync(resolve(ROOT, 'app/globals.css'), 'utf-8');
  const tokensMd = readFileSync(resolve(SKILL_DIR, 'design-tokens.md'), 'utf-8');

  // :root ブロックからCSS変数を抽出
  const cssVarPattern = /--([\w-]+):\s*[^;]+;/g;
  const rootVars = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = cssVarPattern.exec(globalsCss)) !== null) {
    const varName = match[1];
    // Tailwind内部変数やフォント変数を除外
    if (
      !varName.startsWith('color-') &&
      !varName.startsWith('font-') &&
      !varName.startsWith('tw-') &&
      varName !== 'background' &&
      varName !== 'foreground'
    ) {
      rootVars.add(varName);
    }
  }

  // design-tokens.md に記載されている変数を抽出
  const docVarPattern = /`--([a-z][\w-]*)`/g;
  const docVars = new Set<string>();
  while ((match = docVarPattern.exec(tokensMd)) !== null) {
    docVars.add(match[1]);
  }

  // ソースにあってドキュメントにない変数
  for (const v of rootVars) {
    if (!docVars.has(v)) {
      issues.push(`CSS変数 --${v} がソースに存在するが design-tokens.md に未記載`);
    }
  }

  // テーマ数の検証
  const themeMatches = globalsCss.match(/\[data-theme="([^"]+)"\]/g) || [];
  const themes = new Set(themeMatches.map((m) => m.match(/"([^"]+)"/)?.[1]));
  const themesMd = readFileSync(resolve(SKILL_DIR, 'themes.md'), 'utf-8');
  const docThemeCount = (themesMd.match(/data-theme/g) || []).length;

  // themes.md の6テーマ一覧テーブルに全テーマが記載されているか
  for (const theme of themes) {
    if (theme && !themesMd.includes(theme)) {
      issues.push(`テーマ "${theme}" がソースに存在するが themes.md に未記載`);
    }
  }

  return { category: 'デザイントークン', issues };
}

// ── 2. コンポーネントの検証 ──────────────────────

function validateComponents(): ValidationResult {
  const issues: string[] = [];

  const indexTs = readFileSync(resolve(ROOT, 'components/ui/index.ts'), 'utf-8');
  const componentsMd = readFileSync(resolve(SKILL_DIR, 'components.md'), 'utf-8');

  // index.ts からエクスポートされているコンポーネント名を抽出
  const exportPattern = /export\s+\{[^}]*\}\s+from/g;
  const namePattern = /(\w+)/g;
  const exportedNames = new Set<string>();

  let exportMatch: RegExpExecArray | null;
  while ((exportMatch = exportPattern.exec(indexTs)) !== null) {
    const block = exportMatch[0];
    let nameMatch: RegExpExecArray | null;
    while ((nameMatch = namePattern.exec(block)) !== null) {
      const name = nameMatch[1];
      // キーワードやPropsの型定義を除外
      if (
        name !== 'export' &&
        name !== 'from' &&
        name !== 'type' &&
        !name.endsWith('Props')
      ) {
        exportedNames.add(name);
      }
    }
  }

  // components.md に記載されているコンポーネント名を確認
  for (const name of exportedNames) {
    // コンポーネント名がドキュメント内のどこかに出現するか（コードブロック含む）
    if (!componentsMd.includes(name)) {
      issues.push(`コンポーネント ${name} がエクスポートされているが components.md に未記載`);
    }
  }

  return { category: 'コンポーネント', issues };
}

// ── 3. Variant数の検証 ─────────────────────────────

function validateVariants(): ValidationResult {
  const issues: string[] = [];

  const targets = [
    { name: 'Button', file: 'Button.tsx' },
    { name: 'Card', file: 'Card.tsx' },
    { name: 'Badge', file: 'Badge.tsx' },
    { name: 'IconButton', file: 'IconButton.tsx' },
  ];

  const componentsMd = readFileSync(resolve(SKILL_DIR, 'components.md'), 'utf-8');
  const skillMd = readFileSync(
    resolve(ROOT, '.claude/skills/roastplus-ui/SKILL.md'),
    'utf-8',
  );

  for (const target of targets) {
    let source: string;
    try {
      source = readFileSync(resolve(ROOT, 'components/ui', target.file), 'utf-8');
    } catch {
      continue; // ファイルが存在しない場合はスキップ
    }

    // variant型定義からvariant値を抽出
    const variantTypeMatch = source.match(
      /variant\??\s*:\s*(['"][^'"]+['"]\s*\|\s*)*['"][^'"]+['"]/,
    );
    if (variantTypeMatch) {
      const variantStr = variantTypeMatch[0];
      const variants = variantStr.match(/'([^']+)'/g)?.map((v) => v.replace(/'/g, '')) || [];
      const sourceCount = variants.length;

      // components.md のvariant数と比較
      // "10 variants" や "6 variants" のパターンを検索
      const docVariantCountMatch = componentsMd.match(
        new RegExp(`${target.name}[\\s\\S]{0,200}(\\d+)\\s*種`, 'i'),
      );

      // SKILL.md のvariant表もチェック
      const skillVariantLine = skillMd.match(
        new RegExp(`${target.name}[^|]*\\|[^|]*（(\\d+)種）`),
      );
      if (skillVariantLine) {
        const skillCount = parseInt(skillVariantLine[1]);
        if (skillCount !== sourceCount) {
          issues.push(
            `${target.name}: SKILL.md に「${skillCount}種」と記載されているが、ソースには ${sourceCount} variants（${variants.join(', ')}）`,
          );
        }
      }
    }
  }

  return { category: 'Variant整合性', issues };
}

// ── 4. アニメーションの検証 ────────────────────────

function validateAnimations(): ValidationResult {
  const issues: string[] = [];

  const globalsCss = readFileSync(resolve(ROOT, 'app/globals.css'), 'utf-8');
  const animationsMd = readFileSync(resolve(SKILL_DIR, 'animations.md'), 'utf-8');

  // @keyframes 定義を抽出
  const keyframePattern = /@keyframes\s+([\w-]+)/g;
  let match: RegExpExecArray | null;
  const keyframes = new Set<string>();

  while ((match = keyframePattern.exec(globalsCss)) !== null) {
    keyframes.add(match[1]);
  }

  // animations.md に記載されているか
  // 親アニメーションの一部として使われるサブkeyframeは除外
  // (例: walk-bounce は walk-characters アニメーション内部で使用)
  const parentKeyframes = new Map<string, string>();
  for (const kf of keyframes) {
    // walk-bounce → walk, wobble-left → wobble 等、プレフィックスで親を推定
    const prefix = kf.split('-')[0];
    if (keyframes.has(prefix) || animationsMd.includes(prefix)) {
      parentKeyframes.set(kf, prefix);
    }
  }

  for (const kf of keyframes) {
    if (!animationsMd.includes(kf) && !parentKeyframes.has(kf)) {
      issues.push(`@keyframes ${kf} がソースに存在するが animations.md に未記載`);
    }
  }

  return { category: 'アニメーション', issues };
}

// ── メイン実行 ────────────────────────────────────

function main() {
  console.log('🔍 UIスキル整合性チェック開始...\n');

  const results = [
    validateDesignTokens(),
    validateComponents(),
    validateVariants(),
    validateAnimations(),
  ];

  let totalIssues = 0;

  for (const result of results) {
    if (result.issues.length > 0) {
      console.log(`⚠️  ${result.category}（${result.issues.length}件）`);
      for (const issue of result.issues) {
        console.log(`   - ${issue}`);
      }
      console.log();
      totalIssues += result.issues.length;
    } else {
      console.log(`✅ ${result.category}: OK`);
    }
  }

  console.log();
  if (totalIssues > 0) {
    console.log(`❌ ${totalIssues}件の不整合が検出されました。`);
    console.log('   .claude/skills/roastplus-ui/references/ のドキュメントを更新してください。');
    process.exit(1);
  } else {
    console.log('✅ すべてのチェックに合格しました。');
  }
}

main();

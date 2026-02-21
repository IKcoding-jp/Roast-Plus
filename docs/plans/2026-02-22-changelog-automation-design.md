# 設計書: 更新履歴ページ改善・changelog自動化

**作成日**: 2026-02-22
**対象**: 更新履歴ページのユーザー向けコンテンツ改善と、changelog管理の自動化
**アプローチ**: PRテンプレート連携型（Approach A）

---

## 背景・課題

- `data/dev-stories/detailed-changelog.ts` に技術的な説明文（Hydration、ESLint、lint-staged等）が混在しており、非エンジニアのユーザーには不要な情報が表示されている
- バージョン番号が `package.json` / `detailed-changelog.ts` / `version-history.ts` の3箇所で手動管理されており、PRごとに手動更新が必要
- `.github/PULL_REQUEST_TEMPLATE.md` にはすでに「ユーザー向け更新内容」セクションが存在するが、自動化が未実装

---

## 要件

- ユーザー向け更新内容（非エンジニアが理解できる説明のみ）を表示する
- 開発者ツール追加・リファクタリング等の内部変更はchangelogから完全除外
- バージョン管理とchangelog更新をGitHub Actionsで自動化
- AIがユーザー向け説明文のドラフトを生成し、開発者がレビューしてから確定する

---

## アーキテクチャ

### フロー概要

```
PR作成 → changelog-suggest.yml
  ├─ "ユーザー向け更新内容" が "-" のみ → OpenAI でドラフト生成
  └─ PRコメントとしてドラフトを投稿（開発者がPR本文を手動更新）

PRマージ → changelog-update.yml
  ├─ "ユーザー向け更新内容" を抽出
  ├─ 空("-"のみ) → スキップ（バージョンバンプなし）
  ├─ ブランチ名からバージョン種別を判定
  │     feat/*   → minor バンプ（0.11.0 → 0.12.0）
  │     fix/*    → patch バンプ（0.11.0 → 0.11.1）
  │     style/*  → patch バンプ
  │     その他   → スキップ
  └─ update-changelog.mjs を実行
        → package.json バージョン更新
        → detailed-changelog.ts に先頭追加
        → version-history.ts に先頭追加
        → git commit [skip ci] & push
```

---

## 変更・作成ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `.github/workflows/changelog-suggest.yml` | 新規作成 | PR作成時のAIドラフト提案ワークフロー |
| `.github/workflows/changelog-update.yml` | 新規作成 | PRマージ時のchangelog自動更新ワークフロー |
| `.github/scripts/update-changelog.mjs` | 新規作成 | TSファイル・package.json更新スクリプト |
| `.github/PULL_REQUEST_TEMPLATE.md` | 修正 | `<!-- /changelog -->` マーカーを追加 |
| `data/dev-stories/detailed-changelog.ts` | 自動更新 | Actionが担当（手動編集不要） |
| `data/dev-stories/version-history.ts` | 自動更新 | Actionが担当（手動編集不要） |
| `package.json` | 自動更新 | Actionが担当（手動編集不要） |

---

## PRテンプレート仕様

### 変更内容

終端マーカー `<!-- /changelog -->` を追加し、パースを確実にする。

```markdown
## ユーザー向け更新内容
<!-- ユーザーに見える変化のみ。技術的な内容は不要です -->
<!-- ユーザー向けの変更なし（内部改善のみ）の場合は "-" のままにしてください -->

-

<!-- /changelog -->

---

## 概要
...
```

### パース正規表現

```
/## ユーザー向け更新内容[\s\S]*?\n([\s\S]*?)<!-- \/changelog -->/
```

空判定: 抽出結果が `/^[\s\-]*$/` にマッチする場合はスキップ

---

## GitHub Actions ワークフロー仕様

### changelog-suggest.yml

```yaml
on:
  pull_request:
    types: [opened]
    branches: [main]

permissions:
  pull-requests: write
  contents: read
```

**処理ステップ:**
1. PR本文から「ユーザー向け更新内容」を抽出
2. 空("-"のみ)でない場合はスキップ（開発者が既に記入済み）
3. マージコミット一覧を取得
4. OpenAI API (gpt-4o-mini) でドラフト生成
5. PRにコメント投稿

### changelog-update.yml

```yaml
on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read
```

**処理ステップ:**
1. `github.event.pull_request.merged == true` チェック
2. PR本文から「ユーザー向け更新内容」を抽出
3. 空("-"のみ)なら終了
4. ブランチ名からバージョン種別を判定
5. `node .github/scripts/update-changelog.mjs` 実行
6. 変更をコミット・プッシュ

---

## update-changelog.mjs 仕様

### 引数・入力

環境変数から受け取る:
- `NEW_VERSION`: 新バージョン番号（例: `0.12.0`）
- `CHANGELOG_CONTENT`: PR本文から抽出したユーザー向け説明文
- `PR_TYPE`: `feature` / `bugfix` / `style` / `improvement`
- `MERGE_DATE`: マージ日 (`YYYY-MM-DD`)

### 処理内容

1. **`package.json`**: `version` フィールドを `NEW_VERSION` に更新
2. **`detailed-changelog.ts`**: `DETAILED_CHANGELOG: ChangelogEntry[] = [` の直後に新エントリを文字列挿入
3. **`version-history.ts`**: `VERSION_HISTORY: VersionHistoryEntry[] = [` の直後に新エントリを文字列挿入

### 生成エントリ形式

```typescript
// detailed-changelog.ts への追加
{
  id: 'v0.12.0',
  version: '0.12.0',
  date: '2026-02-22',
  type: 'feature',
  title: '○○機能が使えるようになりました',  // CHANGELOG_CONTENTの1行目（箇条書き冒頭）
  content: `
- ○○機能が使えるようになりました
- △△の動作が改善されました
  `.trim(),
  tags: [],
  createdAt: '2026-02-22T10:00:00.000Z',
  updatedAt: '2026-02-22T10:00:00.000Z',
},

// version-history.ts への追加
{
  version: '0.12.0',
  date: '2026-02-22',
  summary: '○○機能が使えるようになりました',
},
```

---

## AIプロンプト設計

```
あなたはコーヒー焙煎業務支援アプリの更新内容を
非エンジニアのスタッフ向けに分かりやすく伝える担当です。

以下のPR情報から「ユーザーが実感できる変化」のみを
箇条書き（1〜3項目）で日本語で書いてください。

ルール:
- 技術用語（Hydration、ESLint、リファクタリング等）は使わない
- 開発者ツールの変更は含めない
- ユーザーの操作や見た目に関係する変化のみ
- 変化がない場合は「-」とだけ返してください

PR タイトル: {prTitle}
コミットメッセージ一覧:
{commitMessages}
```

**使用モデル**: `gpt-4o-mini`（コスト最小化）
**使用Secret**: `OPENAI_API_KEY`（既存）

---

## バージョン管理ルール

| ブランチプレフィックス | バンプ種別 | 例 |
|---------------------|------------|-----|
| `feat/` | minor | 0.11.0 → 0.12.0 |
| `fix/` | patch | 0.11.0 → 0.11.1 |
| `style/` | patch | 0.11.0 → 0.11.1 |
| `improvement/` | patch | 0.11.0 → 0.11.1 |
| `chore/`, `docs/`, `refactor/`, `test/` | なし | 変更なし |
| ユーザー向け内容が空("-") | なし | 変更なし |

---

## 既存changelogの扱い

既存の `DETAILED_CHANGELOG` / `VERSION_HISTORY` エントリは**変更しない**。
新しいエントリから自動化が適用される。
過去の技術的な記述はそのまま残す（必要に応じて別Issueで整理）。

---

## GitHub Permissions

```yaml
# changelog-suggest.yml
permissions:
  pull-requests: write  # PRコメント投稿
  contents: read

# changelog-update.yml
permissions:
  contents: write       # ファイル更新・コミット（新規追加）
  pull-requests: read
```

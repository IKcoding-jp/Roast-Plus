---
name: security-audit
description: SAST、SCA、シークレットスキャンを含む包括的なセキュリティ監査を実行する。PR作成前やセキュリティチェック時に使用。
allowed-tools: Bash, Read
---

# Security Audit Protocol

ユーザーからセキュリティ監査やチェックを求められた場合、以下の3フェーズを順番に実行せよ。

## Phase 1: シークレット検出（Gitleaks）

### 実行

```bash
gitleaks detect --source . -v --no-git 2>&1
```

> Windows環境では `gitleaks.exe` がPATH（`C:\Users\kensa\bin`）に配置済み。
> `--no-git` はgit履歴ではなく現在のファイルのみスキャンする。
> git履歴全体をスキャンする場合は `--no-git` を外す。

### 判定

- **検出あり**: 直ちに処理を停止し、ユーザーに警告する。**コミットしてはならない。**
  - 検出されたシークレットの場所（ファイル名・行番号）を報告
  - `.env.local` への移動や、`.gitignore` への追加を提案
- **検出なし**: Phase 2 に進む

### 既知の許容パターン

RoastPlusではFirebaseの `NEXT_PUBLIC_FIREBASE_*` 環境変数が `.env.local` に存在する。
これらは公開APIキー（Firebaseの仕様上、クライアント側で使用される）だが、
**コードにハードコードされている場合は警告対象**とする。

## Phase 2: 依存関係スキャン（npm audit）

### 実行

```bash
npm audit --json 2>&1
```

### 分析

JSON出力をパースし、以下を報告：

| 項目 | 内容 |
|------|------|
| 脆弱性の総数 | critical / high / moderate / low 別 |
| 影響パッケージ | パッケージ名とバージョン |
| 修正可能 | `npm audit fix` で修正可能か |
| アドバイザリ | CVE番号またはGitHub Advisory URL |

### 判定

- **critical / high あり**: 修正バージョンが存在する場合、`npm audit fix` を提案
- **moderate / low のみ**: 報告のみ（ブロックしない）
- **修正不可**: 上流の修正待ちであることを明記

## Phase 3: 静的解析（Semgrep）※オプション

> Semgrepがインストールされている場合のみ実行。未インストール時はスキップ。

### 実行

```bash
semgrep scan --config=p/security-audit --config=p/owasp-top-ten --json 2>&1
```

### 分析

OWASP Top 10 に該当するパターンを検出：
- XSS（クロスサイトスクリプティング）
- インジェクション攻撃（SQL / NoSQL）
- 危険な関数使用（eval等の動的コード実行）
- 認証・認可の不備

## レポート出力

すべてのフェーズ完了後、以下のフォーマットでレポートを作成：

```markdown
# セキュリティ監査レポート

**日時**: YYYY-MM-DD
**対象**: RoastPlus

## 結果サマリー

| フェーズ | ステータス | 検出数 |
|---------|-----------|--------|
| シークレット検出 | PASS / FAIL | N件 |
| 依存関係スキャン | PASS / WARN | N件 |
| 静的解析 | PASS / WARN / SKIP | N件 |

## 詳細

### [各フェーズの詳細をここに記載]

## 推奨アクション

1. [優先度順にアクションを列挙]
```

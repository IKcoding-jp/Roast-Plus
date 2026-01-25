---
name: fix-issue
description: GitHub Issueをフィックス。ブランチ作成→実装→テスト→レビュー→PR→マージまで自動化
argument-hint: "[issue-number]"
---

# Issue自動化スキル

GitHub Issueの解決を自動化するスキルです。
**CLAUDE.md のルール**と**git-workflow スキル**に準拠して動作します。

---

## このスキルを使用するタイミング

- GitHub Issueを解決するとき
- バグ修正や機能追加を行うとき
- 複数のIssueを並列で処理するとき

---

## ワークフロー概要（CLAUDE.md準拠: 探索→計画→コード→コミット型）

```
Phase 1: 探索（Issue理解）
   └─ gh issue view → Serena MCP でコード探索

Phase 2: 計画
   └─ 「think hard」で実装計画 → ユーザー確認

Phase 3: 実装
   └─ ブランチ作成 → Context7 MCP → コード修正

Phase 4: 検証
   └─ lint / build / test → Chrome DevTools MCP（UI変更時）

Phase 5: コミット＆PR
   └─ git-workflow準拠コミット → --body-file でPR作成

Phase 6: マージ（ユーザー確認後）
```

---

## AI アシスタント指示

このスキルが呼び出されたら、以下の手順を**必ず順番に**実行してください。

### Phase 1: 探索（Issue理解）

#### 1.1 Issue情報取得

```bash
gh issue view $ARGUMENTS --json title,body,labels,number
```

Issue番号は `$ARGUMENTS` から取得します。

#### 1.2 関連コード探索（Serena MCP使用）

1. `search_for_pattern` でIssueに関連するコードを検索
2. `get_symbols_overview` でファイル構造を把握
3. `find_symbol` で具体的なシンボルを特定

**注意**: この段階ではコード修正禁止。理解に専念する。

---

### Phase 2: 計画

#### 2.1 実装計画の立案

「**think hard**」を使用して以下を検討:

- 変更が必要なファイル/シンボルの特定
- 実装アプローチの決定
- 潜在的な影響範囲の評価

#### 2.2 ユーザー確認

計画をユーザーに提示し、承認を得てから次へ進む。

---

### Phase 3: 実装

#### 3.1 ブランチ作成

**命名規則**（CLAUDE.md準拠）:

| ラベル | ブランチ名 |
|--------|-----------|
| `bug` | `fix/#番号-簡潔な説明` |
| `enhancement` | `feat/#番号-簡潔な説明` |

```bash
# 例: Issue #16 のバグ修正
git checkout -b "fix/#16-schedule-layout"
```

#### 3.2 最新ドキュメント参照（Context7 MCP使用）

使用するライブラリのAPIが不明な場合:

1. `resolve-library-id` でライブラリIDを取得
2. `query-docs` で最新ドキュメントを参照

#### 3.3 コード修正

- 最小限の変更で問題を解決
- 既存のコードスタイルに従う（`docs/coding-standards.md` 参照）

---

### Phase 4: 検証

#### 4.1 品質チェック

```bash
npm run lint
npm run build
npm run test
```

エラーがあれば修正してから次へ進む。

#### 4.2 ビジュアル確認（UI変更時のみ）

Chrome DevTools MCPを使用:

```
1. navigate_page → 対象ページへ移動
2. take_snapshot → DOM構造確認
3. take_screenshot → 視覚的確認
```

#### 4.3 自己コードレビュー

- [ ] 変更がIssueの要件を満たしているか
- [ ] 不要なコードが含まれていないか
- [ ] 既存機能に影響がないか
- [ ] コードスタイルが統一されているか

---

### Phase 5: コミット＆PR

#### 5.1 コミット（git-workflow スキル準拠）

```bash
git add .
git commit -m "fix(scope): 日本語で簡潔な説明

- 変更点1
- 変更点2

Closes #番号

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**コミットメッセージ規則**（git-workflow参照）:

| タイプ | 用途 |
|--------|------|
| `fix` | バグ修正 |
| `feat` | 新機能 |
| `refactor` | リファクタリング |
| `docs` | ドキュメント |

#### 5.2 PR作成

```bash
git push -u origin $(git branch --show-current)
```

**--body-file を使用**（CLAUDE.md推奨: バッククォート問題回避）:

```bash
# 一時ファイルにPR本文を作成
cat > /tmp/pr-body.md << 'PREOF'
## 概要

このPRはIssue #番号 を解決します。

## 変更内容

- 変更点1
- 変更点2

## テスト

- [x] npm run lint が通ること
- [x] npm run build が通ること
- [x] npm run test が通ること
- [ ] 実機で動作確認

## スクリーンショット

（UI変更の場合は添付）

Closes #番号
PREOF

# PR作成
gh pr create --base main --title "[Issue #番号] タイトル" --body-file /tmp/pr-body.md
```

---

### Phase 6: マージ（ユーザー確認後）

**必ずユーザーに確認してから**マージを実行:

```bash
gh pr merge --merge --delete-branch
```

---

## 注意事項

- **mainブランチでは直接作業しない**（CLAUDE.md: mainへの直接コミット禁止）
- **マージは必ずユーザー承認後**に実行
- **CI/CDが通ることを確認**してからマージ
- **複数Issueを並列処理**する場合はWorktreeを使用

---

## トラブルシューティング

### ブランチが既に存在する場合

```bash
git branch -D "fix/#16-xxx"
git checkout -b "fix/#16-xxx"
```

### コンフリクトが発生した場合

```bash
git fetch origin main
git rebase origin/main
# コンフリクトを解消
git rebase --continue
```

### PRがマージできない場合

1. CIが通っているか確認
2. レビュー承認があるか確認
3. ブランチ保護ルールを確認

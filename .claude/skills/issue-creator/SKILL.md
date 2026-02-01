---
name: issue-creator
description: GitHub Issue作成スキル。Serena MCPでコードベース調査→影響範囲特定→gh issue create。バグ、機能追加、リファクタ、ドキュメント等あらゆる作業に対応。「〜のIssueを作って」「〜を実装したい」時に使用。
argument-hint: "[作業内容]"
---

# Issue Creator

## ワークフロー

```
1. 作業内容理解 → 2. コード調査(Serena MCP) → 3. Issue内容整理 → 4. ユーザー確認 → 5. gh issue create
```

⚠️ **このスキルではコード修正を行わない。調査とIssue作成のみ。**

### 1. 作業内容理解

Issueタイプを判定: `bug` / `feat` / `refactor` / `docs` / `style` / `perf` / `chore` / `test`
不明点はユーザーに質問。

### 2. コード調査（Serena MCP）

- `find_symbol` / `search_for_pattern` で関連コード特定
- `get_symbols_overview` で構造把握
- `find_referencing_symbols` で影響範囲確認

**調査深度**: バグ修正・リファクタは詳細調査。UI変更・ドキュメントは軽微でOK。

### 3. Issue本文テンプレート

```markdown
## 概要
[何をするか - 1-2文]

## 理由/背景
[なぜ必要か]

## 対象箇所
- `path/to/file.ts:行番号` - 関数/コンポーネント名

## 作業内容
- [ ] タスク1
- [ ] タスク2

## 影響範囲
- 関連コンポーネント・依存関係
```

### 4. Issue作成

ユーザー確認後に実行:

```bash
cat > /tmp/issue_body.md <<'EOF'
[Issue本文]
EOF

gh issue create --title "[type]: タイトル" --body-file /tmp/issue_body.md --label "ラベル"
rm /tmp/issue_body.md
```

**ラベル対応**: bug→`bug`, feat→`enhancement`, refactor→`refactor`, docs→`documentation`, style→`design`, perf→`performance`, chore→`chore`, test→`testing`

### 5. 完了後

作成したIssue番号を案内: `/fix-issue [番号]` で実装開始可能。

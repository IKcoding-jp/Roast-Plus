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

作成したIssue番号を案内し、Working Documentsを自動生成します:

```bash
# Issue作成後、Working Documents自動生成を提案
echo "Issue #124 を作成しました。"
echo ""
echo "Working Documents（仕様書）を自動生成しますか？"
echo "生成する場合: /create-spec 124"
echo ""
echo "実装を開始する場合: /fix-issue 124"
```

#### Working Documents自動生成の流れ

1. **Issue作成完了** → Issue番号を取得（例: `#124`）
2. **ユーザーに確認** → 「Working Documentsを生成しますか？」
3. **承認後に実行** → `/create-spec 124`
4. **Working生成完了** → `docs/working/20260205_124_タイトル/` に4ファイル生成
5. **実装開始可能** → `/fix-issue 124` で実装フェーズへ

#### Working Documents生成のメリット

- **コンテキスト保持**: Issue作成時の調査結果を永続化
- **設計の明確化**: requirement.md, design.md で仕様を整理
- **タスク可視化**: tasklist.md で作業を分割
- **テスト計画**: testing.md でテストケースを事前定義

#### スキップ可能な場合

以下のIssueでは Working Documents生成をスキップしてもOK:

- 軽微なドキュメント修正（typo、リンク修正等）
- 単純な依存関係更新（`npm update`のみ）
- 緊急のホットフィックス（即座に修正が必要）

その他のIssue（機能追加、バグ修正、リファクタリング）では、Working Documents生成を強く推奨。

---

## 詳細パターン

実際のIssue作成例は以下を参照:

- **[issue-examples.md](references/issue-examples.md)** - バグ報告（タイマー停止、共通UI不統一）、機能追加（CSVエクスポート）、リファクタリング（複雑度削減）、ドキュメント追加等の具体例。Serena MCP調査結果からIssue本文、ラベル、gh CLIコマンドまでの完全な流れ。

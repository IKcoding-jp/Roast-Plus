---
name: fix-issue
description: GitHub Issueをフィックス。ブランチ作成→実装→テスト→レビュー→PR→マージまで自動化
argument-hint: "[issue-number]"
---

# Issue自動化スキル

GitHub Issueの解決を自動化するスキルです。
ブランチ作成から実装、テスト、コードレビュー、PR作成、マージまでを一貫して実行します。

---

## このスキルを使用するタイミング

- GitHub Issueを解決するとき
- バグ修正や機能追加を行うとき
- 複数のIssueを並列で処理するとき

---

## ワークフロー

```
1. Issue情報取得
   └─ gh issue view [番号] --json title,body,labels

2. ブランチ作成
   └─ labels に "bug" → fix/issue-{num}-{説明}
   └─ labels に "enhancement" → feat/issue-{num}-{説明}

3. 実装
   └─ Issueの内容を理解
   └─ 関連ファイルを特定（Serena MCP使用）
   └─ コード修正

4. 品質チェック
   └─ npm run lint
   └─ npm run build

5. 自己コードレビュー
   └─ 変更内容の確認
   └─ 品質チェックリストの確認

6. コミット
   └─ git add .
   └─ git commit -m "fix(scope): 説明" or "feat(scope): 説明"

7. PR作成
   └─ gh pr create --base main --title "[Issue #N] タイトル" --body "..."

8. マージ（確認後）
   └─ gh pr merge --squash --delete-branch
```

---

## 使用方法

```bash
# Issue #16 を解決
/fix-issue 16

# Worktree環境で使用
cd ../roastplus-issue-16
claude
> /fix-issue 16
```

---

## AI アシスタント指示

このスキルが呼び出されたら、以下の手順を**必ず順番に**実行してください：

### Step 1: Issue情報取得

```bash
gh issue view $ARGUMENTS --json title,body,labels,number
```

Issue番号は `$ARGUMENTS` から取得します。

### Step 2: ブランチ作成

1. 現在のブランチを確認
2. ラベルに基づいてブランチ名を決定:
   - `bug` ラベル → `fix/issue-{番号}-{短い説明}`
   - `enhancement` ラベル → `feat/issue-{番号}-{短い説明}`
3. ブランチを作成して切り替え

```bash
git checkout -b fix/issue-16-schedule-layout
```

### Step 3: 実装

1. **Serena MCPを使用**してコードベースを探索
   - `search_for_pattern` で関連コードを検索
   - `get_symbols_overview` でファイル構造を把握
   - `find_symbol` で具体的なシンボルを特定

2. **Context7 MCPを使用**して最新ドキュメントを参照
   - 使用するライブラリの最新APIを確認

3. コードを修正
   - 最小限の変更で問題を解決
   - 既存のコードスタイルに従う

### Step 4: 品質チェック

```bash
npm run lint
npm run build
```

エラーがあれば修正してから次へ進む。

### Step 5: 自己コードレビュー

変更内容を確認し、以下をチェック：

- [ ] 変更が Issue の要件を満たしているか
- [ ] 不要なコードが含まれていないか
- [ ] 既存機能に影響がないか
- [ ] コードスタイルが統一されているか

### Step 6: コミット

```bash
git add .
git commit -m "$(cat <<'EOF'
fix(scope): 日本語で簡潔な説明

- 変更点1
- 変更点2

Fixes #16

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**コミットメッセージ規則**:
- `fix`: バグ修正
- `feat`: 新機能
- スコープ: 影響を受けるコンポーネント名
- 本文: 変更内容を箇条書き
- フッター: `Fixes #番号` でIssueを閉じる

### Step 7: PR作成

```bash
git push -u origin $(git branch --show-current)

gh pr create --base main --title "[Issue #16] タイトル" --body "$(cat <<'EOF'
## 概要

このPRはIssue #16 を解決します。

## 変更内容

- 変更点1
- 変更点2

## テスト

- [ ] npm run lint が通ること
- [ ] npm run build が通ること
- [ ] 実機で動作確認

## スクリーンショット

（必要に応じて追加）

Fixes #16
EOF
)"
```

### Step 8: マージ（ユーザー確認後）

**必ずユーザーに確認してから**マージを実行：

```bash
gh pr merge --squash --delete-branch
```

---

## 注意事項

- **mainブランチでは直接作業しない**
- **マージは必ずユーザー承認後**に実行
- **CI/CDが通ることを確認**してからマージ
- **複数Issueを並列処理**する場合はWorktreeを使用

---

## トラブルシューティング

### ブランチが既に存在する場合

```bash
git branch -D fix/issue-16-xxx
git checkout -b fix/issue-16-xxx
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

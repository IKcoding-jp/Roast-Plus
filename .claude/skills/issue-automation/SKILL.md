---
name: issue-automation
description: GitHub Issueを自動解決。ブランチ作成→実装→テスト→レビュー→PR→マージまで自動化。CLAUDE.md準拠の探索→計画→コード→コミット型ワークフロー。Issue #番号を引数に取る。バグ修正、機能追加、リファクタ時に使用。
argument-hint: "[issue-number]"
---

# Issue自動化スキル

GitHub Issueの解決を自動化するスキル。**CLAUDE.md**と**git-workflow**に準拠して動作します。

## ワークフロー概要

```
Phase 1: 探索(Issue理解)
   └─ gh issue view → Serena MCP でコード探索

Phase 2: 計画
   └─ 「think hard」で実装計画 → ユーザー確認

Phase 3: 実装
   └─ ブランチ作成 → Context7 MCP → コード修正

Phase 4: 検証
   └─ lint / build / test → Chrome DevTools MCP(UI変更時)

Phase 5: コミット＆PR
   └─ ユーザー確認 → コミット → プッシュ確認 → PR確認

Phase 6: マージ(ユーザー確認後)
```

## 実行手順

### Phase 1: 探索(Issue理解)

**Issue情報取得:**
```bash
gh issue view $ARGUMENTS --json title,body,labels,number
```

**コード探索(Serena MCP):**
1. `search_for_pattern` - Issue関連コード検索
2. `get_symbols_overview` - ファイル構造把握
3. `find_symbol` - 具体的シンボル特定

⚠️ **この段階ではコード修正禁止。理解に専念する。**

---

### Phase 2: 計画

**実装計画立案:**
- 「**think hard**」で以下を検討:
  - 変更が必要なファイル/シンボルの特定
  - 実装アプローチの決定
  - 影響範囲の評価

**ユーザー確認:**
計画をユーザーに提示し、承認を得てから次へ進む。

---

### Phase 3: 実装

**ブランチ作成(CLAUDE.md準拠):**

| ラベル | ブランチ名 |
|--------|-----------|
| `bug` | `fix/#番号-簡潔な説明` |
| `enhancement` | `feat/#番号-簡潔な説明` |

```bash
git checkout -b "fix/#16-schedule-layout"
```

**最新ドキュメント参照(Context7 MCP):**
使用ライブラリのAPI確認時:
1. `resolve-library-id` - ライブラリID取得
2. `query-docs` - 最新ドキュメント参照

**コード修正:**
- 最小限の変更で問題を解決
- `docs/coding-standards.md` に従う

---

### Phase 4: 検証

**品質チェック:**
```bash
npm run lint
npm run build
npm run test
```

**ビジュアル確認(UI変更時のみ、Chrome DevTools MCP):**
```
navigate_page → take_snapshot → take_screenshot
```

**自己レビューチェックリスト:**
- [ ] 変更がIssueの要件を満たしているか
- [ ] 不要なコードが含まれていないか
- [ ] 既存機能に影響がないか
- [ ] コードスタイルが統一されているか

---

### Phase 5: コミット＆PR

**コミット準備(git-workflow準拠):**

変更内容とコミットメッセージを**AskUserQuestionツールで確認**:

```
📝 コミット内容
- 変更ファイル: [ファイル一覧]
- コミットメッセージ案:
  fix(scope): 日本語で簡潔な説明

  - 変更点1
  - 変更点2

  Closes #番号

  Co-Authored-By: Claude <noreply@anthropic.com>

このままコミットしますか?
```

承認後にコミット実行:
```bash
git add .
git commit -m "$(cat <<'EOF'
fix(scope): 日本語で簡潔な説明

- 変更点1
- 変更点2

Closes #番号

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**コミットタイプ対応表(git-workflow参照):**
| タイプ | 用途 |
|--------|------|
| `fix` | バグ修正 |
| `feat` | 新機能 |
| `refactor` | リファクタリング |
| `docs` | ドキュメント |

**プッシュ確認:**

**AskUserQuestionツールで確認**:
```
🚀 プッシュ準備
- ブランチ: [ブランチ名]
- コミット数: [コミット数]

このままプッシュしますか?
```

承認後にプッシュ:
```bash
git push -u origin $(git branch --show-current)
```

**PR作成確認:**

**AskUserQuestionツールで確認**してから、**--body-file を使用**(CLAUDE.md推奨):

```bash
# 一時ファイルにPR本文を作成
cat > /tmp/pr-body.md <<'PREOF'
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

Closes #番号
PREOF

# PR作成
gh pr create --base main --title "[Issue #番号] タイトル" --body-file /tmp/pr-body.md
```

---

### Phase 6: マージ(ユーザー確認後)

**AskUserQuestionツールで確認**してからマージ:

```bash
gh pr merge --merge --delete-branch
```

---

## 注意事項

- **mainブランチでは直接作業しない**(CLAUDE.md準拠)
- **コミット、プッシュ、PR作成、マージは必ずユーザー確認後**
- **CI/CDが通ることを確認**してからマージ

---

## トラブルシューティング

### ブランチが既に存在する
```bash
git branch -D "fix/#16-xxx"
git checkout -b "fix/#16-xxx"
```

### コンフリクト発生時
```bash
git fetch origin main
git rebase origin/main
# コンフリクトを解消
git rebase --continue
```

### PRがマージできない
1. CIが通っているか確認
2. レビュー承認があるか確認
3. ブランチ保護ルールを確認

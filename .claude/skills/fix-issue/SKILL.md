---
name: fix-issue
description: GitHub Issueを自動解決。ブランチ作成→実装→テスト→レビュー→PR→マージまで自動化。CLAUDE.md準拠の探索→計画→コード→コミット型ワークフロー。Issue番号を引数に取る。「/fix-issue 123」のように使用。
argument-hint: "[issue-number]"
---

# Issue自動解決スキル

## ワークフロー

```
Phase 1: 探索 → Phase 2: 計画 → Phase 3: 実装 → Phase 4: 検証 → Phase 5: コミット＆PR → Phase 6: マージ
```

⚠️ **コミット、プッシュ、PR作成、マージは必ずAskUserQuestionでユーザー確認後に実行。**

### Phase 1: 探索（Issue理解）

```bash
gh issue view $ARGUMENTS --json title,body,labels,number
```

Serena MCPでコード探索: `search_for_pattern` → `get_symbols_overview` → `find_symbol`
**この段階ではコード修正禁止。**

### Phase 2: 計画

「think hard」で実装計画を立案し、ユーザーに提示して承認を得る。

### Phase 3: 実装

**ブランチ作成（CLAUDE.md準拠）:**
- bug → `fix/#番号-説明`
- enhancement → `feat/#番号-説明`（または `feature/#番号-説明`）

**Context7 MCP** でライブラリのAPI確認: `resolve-library-id` → `query-docs`

### Phase 4: 検証

**Lintエラー完全解消（ゼロになるまでループ）:**
```
npm run lint → エラーあり → npm run lint -- --fix → 残りを手動修正 → 再実行
```

**ビルド＆テスト:** `npm run build && npm run test`

**UI変更時:** Chrome DevTools MCPで `navigate_page` → `take_snapshot` → `take_screenshot`

**自己レビュー:** 要件充足、不要コードなし、既存機能への影響なし を確認。

### Phase 5: コミット＆PR

1. **コミット** — git-workflowスキル準拠。ユーザー確認後に実行
2. **プッシュ** — ユーザー確認後: `git push -u origin $(git branch --show-current)`
3. **PR作成** — ユーザー確認後、`--body-file`使用:

```bash
cat > /tmp/pr-body.md <<'PREOF'
## 概要
Issue #番号 を解決。

## 変更内容
- 変更点

## テスト
- [x] lint / build / test 通過
- [ ] 実機動作確認

Closes #番号
PREOF

gh pr create --base main --title "[Issue #番号] タイトル" --body-file /tmp/pr-body.md
```

4. **レビュー（任意）** — ユーザー確認後、`code-review`スキルで実施

### Phase 6: マージ

ユーザー確認後: `gh pr merge --merge --delete-branch`
